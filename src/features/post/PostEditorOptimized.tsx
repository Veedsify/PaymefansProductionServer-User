// Optimized PostEditor with separated concerns
"use client";
import { useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  LucideChevronDown,
  LucideChevronUp,
  LucideUsers,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineEye } from "react-icons/hi";
import { POST_CONFIG } from "@/config/config";
import { useUploadProgress } from "@/contexts/UploadProgressContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import { PostCancel } from "@/features/post/PostCancel";
import { useMentions } from "@/hooks/useMentions";
import { usePostAudience } from "@/hooks/usePostAudience";
// Custom hooks
import { usePostEditor } from "@/hooks/usePostEditor";
import { usePostInitialization } from "@/hooks/usePostInitialization";
import type {
  PostAudienceDataProps,
  PostEditorProps,
  UploadedMediaProp,
  UserMediaProps,
} from "@/types/Components";
import { SavePost } from "@/utils/SavePost";
// Components
import MentionDropdown from "./components/MentionDropdown";
import MentionList from "./components/MentionList";
import ExistingMediaPreview from "./ExistingMediaPreview";
import dynamic from "next/dynamic";
const PostMediaPreview = dynamic(() => import("./PostMediaPreview"), {
  ssr: false,
});
const AudienceDropdown = dynamic(() => import("./AudienceDropDown"), {
  ssr: false,
});

// Validation helper (can be inside or outside component)
const validatePost = ({
  postText,
  media,
  editedMedia,
  posts,
  isUploadComplete,
  isAnyUploading,
  visibility,
  price,
}: {
  postText: string;
  media: UploadedMediaProp[] | null;
  editedMedia: UserMediaProps[] | null;
  posts: any;
  isUploadComplete: boolean;
  isAnyUploading: boolean;
  visibility: string;
  price: number;
}) => {
  const hasContent = !!postText?.trim();
  const hasNewMedia = media && media.length > 0;
  const hasExistingMedia = editedMedia && editedMedia.length > 0;
  const hasAnyMedia = hasNewMedia || hasExistingMedia;

  console.log({ hasContent, hasNewMedia, hasExistingMedia, hasAnyMedia });

  // New post must have content or media
  if (!hasContent && !hasAnyMedia && !posts) {
    return { valid: false, error: "empty" };
  }

  // Wait for uploads
  if (hasNewMedia && (!isUploadComplete || isAnyUploading)) {
    return { valid: false, error: "uploading" };
  }

  // Price validation
  if (visibility.toLowerCase() === "price" && price <= 0) {
    return { valid: false, error: "price" };
  }

  return { valid: true };
};

const PostEditor = React.memo(({ posts }: PostEditorProps) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { isUploadComplete, isAnyUploading } = useUploadProgress();

  // Custom hooks
  const {
    textareaRef,
    content,
    price,
    nairaDisplayValue,
    isSubmitting,
    editedMedia,
    removedIds,
    uploadedMedia,
    handleContentChange,
    setPriceHandler,
    removeThisMedia,
    removeExistingMedia,
    setIsSubmitting,
    setMediaUploadComplete,
    config,
    visibility,
    setVisibility,
    postText,
    setPostText,
    isWaterMarkEnabled,
    setContent,
    setEditedMedia,
    setPrice,
    setNairaDisplayValue,
  } = usePostEditor(posts);

  const {
    showMentions,
    mentionSuggestions,
    selectedMentionIndex,
    mentions,
    isMentionLoading,
    setSelectedMentionIndex,
    processMentions,
    selectMention,
    removeMention,
    handleKeyDown,
  } = useMentions();

  // Audience data
  const postAudienceData: PostAudienceDataProps[] = useMemo(
    () =>
      [
        {
          id: 1,
          name: "Public",
          icon: <HiOutlineEye size={20} className="inline" />,
        },
        ...(user?.is_model && user.Model?.verification_status
          ? [
              {
                id: 2,
                name: "Subscribers",
                icon: <LucideUsers size={20} className="inline" />,
              },
              {
                id: 3,
                name: "Price",
                icon: <DollarSign size={20} className="inline" />,
              },
            ]
          : []),
      ] as PostAudienceDataProps[],
    [user]
  );

  const {
    postAudience,
    dropdown,
    setDropdown,
    updatePostAudience,
    setPostAudience,
  } = usePostAudience(postAudienceData);

  // Word limit state
  const [wordLimit, setWordLimit] = useState(1000);

  // Initialize post data
  usePostInitialization({
    posts,
    setContent,
    setPostText,
    setVisibility,
    setPostAudience,
    setEditedMedia,
    setPrice,
    setNairaDisplayValue,
    postAudienceData,
    config,
  });

  // Enhanced audience update
  const handleAudienceUpdate = useCallback(
    (audience: PostAudienceDataProps) => {
      updatePostAudience(audience);
      setVisibility(audience.name as "Public" | "Subscribers" | "Price");
    },
    [updatePostAudience, setVisibility]
  );

  // Textarea change handler
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      const cursorPos = e.target.selectionStart || 0;

      if (text.length > 1000) {
        e.target.value = text.slice(0, 1000);
        setWordLimit(0);
        return;
      } else {
        setWordLimit(1000 - text.length);
      }

      handleContentChange(text);
      processMentions(text, cursorPos);
    },
    [handleContentChange, processMentions]
  );

  // Mention selection handler
  const handleMentionSelect = useCallback(
    (user: any) => {
      const newText = selectMention(user, textareaRef);
      if (newText && textareaRef.current) {
        handleContentChange(newText);
      }
    },
    [selectMention, handleContentChange]
  );

  // Keydown handler
  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const newText = handleKeyDown(e, textareaRef);
      if (newText) {
        handleContentChange(newText);
      }
    },
    [handleKeyDown, handleContentChange]
  );

  // Submit handler
  const handlePostSubmit = useCallback(async () => {
    if (isSubmitting) return;

    const validation = validatePost({
      postText,
      media: uploadedMedia,
      editedMedia,
      posts,
      isUploadComplete,
      isAnyUploading,
      visibility,
      price,
    });

    if (!validation.valid) {
      switch (validation.error) {
        case "empty":
          toast.error("Post is empty, please write something or add media.", {
            id: "post-upload",
          });
          break;
        case "uploading":
          toast.error("Please wait for all media uploads to complete.", {
            id: "post-upload",
          });
          break;
        case "price":
          toast.error("Please set a price for your post.", {
            id: "post-price-error",
          });
          break;
      }
      return;
    }

    setIsSubmitting(true);
    const isEditing = !!posts?.post_id;

    toast.loading(
      isEditing ? "Saving your changes..." : "Creating your post...",
      { id: "post-upload" }
    );

    const savePostOptions = {
      data: {
        media: uploadedMedia || [],
        content: postText,
        visibility: visibility.toLowerCase(),
        removedMedia: removedIds,
        price: price > 0 ? price : undefined,
        mentions,
        isWaterMarkEnabled,
      },
      action: isEditing ? "update" : "create",
      post_id: posts?.post_id || "",
    };

    const res = await SavePost(savePostOptions);

    if (!res.error) {
      const successMessage = isEditing
        ? "Post updated successfully!"
        : POST_CONFIG.POST_CREATED_SUCCESS_MSG;

      // Reset form if creating new post
      if (!isEditing) {
        setPostText("");
        setVisibility("Public");
        setMediaUploadComplete(false);
      }

      toast.success(successMessage, { id: "post-upload" });
      router.push("/profile");
      queryClient.invalidateQueries({ queryKey: ["personal-posts"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
    } else {
      toast.error(res.message, { id: "post-upload" });
    }

    setIsSubmitting(false);
  }, [
    posts,
    postText,
    uploadedMedia,
    editedMedia,
    removedIds,
    isSubmitting,
    isUploadComplete,
    isAnyUploading,
    visibility,
    price,
    mentions,
    isWaterMarkEnabled,
    toast,
    router,
    queryClient,
    setIsSubmitting,
    setPostText,
    setVisibility,
    setMediaUploadComplete,
  ]);

  const checkDateDiff = () => {
    if (!posts?.created_at) return false;
    const postDate = new Date(posts.created_at);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - postDate.getTime();
    return timeDiff > 86400000;
  };

  const isOldPost = checkDateDiff();

  return (
    <>
      <div className="relative p-4 md:p-8 dark:text-white">
        {/* Header */}
        <div className="flex items-center mb-6">
          <PostCancel />
          <button
            onClick={handlePostSubmit}
            disabled={isSubmitting}
            className={`text-white p-2 px-8 rounded ml-auto text-sm font-semibold transition-all duration-200 transform ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "bg-primary-dark-pink hover:bg-primary-dark-pink/90 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            }`}
          >
            {isSubmitting
              ? posts?.post_id
                ? "Saving..."
                : "Processing..."
              : posts?.post_id
              ? "Save"
              : "Post"}
          </button>
        </div>

        {/* Profile and Audience */}
        <div className="flex items-start lg:items-center gap-2">
          <Image
            src={user?.profile_image || "/site/avatar.png"}
            alt="Profile"
            width={56}
            height={56}
            className="inline-block border border-gray-800 rounded-full w-14"
          />
          <AudienceDropdown
            postAudience={postAudience}
            postAudienceData={postAudienceData}
            setPrice={setPriceHandler}
            dropdown={dropdown}
            setDropdown={setDropdown}
            updatePostAudience={handleAudienceUpdate}
            price={price}
            config={config}
            nairaDisplayValue={nairaDisplayValue}
          />
        </div>

        {/* Content Area */}
        <div className="relative mt-3">
          <textarea
            ref={textareaRef}
            className="block dark:bg-gray-950 dark:text-white rounded-md mb-3 leading-relaxed text-gray-700 font-medium w-full resize-none outline-none overflow-auto min-h-[120px] p-3 border border-gray-300 dark:border-gray-700"
            placeholder="What's on your mind? Use @ to mention someone..."
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            rows={6}
          ></textarea>

          <MentionDropdown
            showMentions={showMentions}
            mentionSuggestions={mentionSuggestions}
            selectedMentionIndex={selectedMentionIndex}
            isMentionLoading={isMentionLoading}
            onMentionSelect={handleMentionSelect}
            onMentionHover={setSelectedMentionIndex}
          />
        </div>

        <MentionList mentions={mentions} onRemove={removeMention} />

        <div className="mt-10">
          <p className="text-xs font-medium text-gray-400">
            {wordLimit} characters remaining
          </p>
        </div>
      </div>

      {/* Existing Media */}
      {editedMedia.length > 0 && !isOldPost && (
        <div className="px-4 md:px-8">
          <ExistingMediaPreview
            media={editedMedia}
            onRemove={removeExistingMedia}
          />
        </div>
      )}

      {/* Media Preview */}
      <PostMediaPreview setIsSubmitting={setIsSubmitting} />
    </>
  );
});

PostEditor.displayName = "PostEditor";

export default PostEditor;
