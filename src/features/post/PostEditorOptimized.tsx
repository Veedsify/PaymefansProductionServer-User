// Optimized PostEditor with separated concerns
"use client";
import React, { useCallback, useMemo, useState } from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideUsers,
  DollarSign,
} from "lucide-react";
import { HiOutlineEye } from "react-icons/hi";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SavePost } from "@/utils/SavePost";
import { POST_CONFIG } from "@/config/config";
import PostMediaPreview from "./PostMediaPreview";
import { PostEditorProps, PostAudienceDataProps } from "@/types/Components";
import { PostCancel } from "@/features/post/PostCancel";
import ExistingMediaPreview from "./ExistingMediaPreview";

// Custom hooks
import { usePostEditor } from "@/hooks/usePostEditor";
import { useMentions } from "@/hooks/useMentions";
import { usePostAudience } from "@/hooks/usePostAudience";
import { usePostContext } from "@/contexts/PostContext";
import { useUploadProgress } from "@/contexts/UploadProgressContext";
import { usePostInitialization } from "@/hooks/usePostInitialization";

// Components
import MentionDropdown from "./components/MentionDropdown";
import MentionList from "./components/MentionList";
import { useQueryClient } from "@tanstack/react-query";

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
    media,
    handleContentChange,
    setPriceHandler,
    handleMediaAttachment,
    removeThisMedia,
    removeExistingMedia,
    setIsSubmitting,
    setMediaUploadComplete,
    config,
    visibility,
    setVisibility,
    postText,
    setPostText,
    mediaUploadComplete,
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

  const {
    postAudience,
    dropdown,
    setDropdown,
    updatePostAudience,
    setPostAudience,
  } = usePostAudience();

  // Word limit state
  const [wordLimit, setWordLimit] = useState(1000);

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
  const handlePostSubmit = async () => {
    if (isSubmitting) return;

    // Check if post has content OR media
    const hasContent = content && content.trim() !== "";
    const hasNewMedia = media && media.length > 0;
    const hasExistingMedia = editedMedia && editedMedia.length > 0;
    const hasAnyMedia = hasNewMedia || hasExistingMedia;

    // For new posts, require either content or media
    if (!hasContent && !hasAnyMedia && !posts) {
      toast.error("Post is empty, please write something or add media.", {
        id: "post-upload",
      });
      return;
    }

    // Check upload completion using the shared progress context
    if (hasNewMedia && (!isUploadComplete || isAnyUploading)) {
      toast.error("Please wait for all media uploads to complete.", {
        id: "post-upload",
      });
      return;
    }

    if (visibility.toLowerCase() === "price" && price <= 0) {
      toast.error("Please set a price for your post.", {
        id: "post-price-error",
      });
      return;
    }

    setIsSubmitting(true);
    const isEditing = posts?.post_id;

    toast.loading(
      isEditing ? "Saving your changes..." : "Creating your post...",
      {
        id: "post-upload",
      }
    );

    const savePostOptions = {
      data: {
        media: media || [],
        content: postText,
        visibility: visibility.toLowerCase(),
        removedMedia: removedIds,
        price: price > 0 ? price : undefined,
        mentions: mentions,
        isWaterMarkEnabled,
      },
      action: posts?.post_id ? "update" : "create",
      post_id: posts?.post_id || "",
    };

    const res = await SavePost(savePostOptions);
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.message, { id: "post-upload" });
    } else {
      const successMessage = isEditing
        ? "Post updated successfully!"
        : POST_CONFIG.POST_CREATED_SUCCESS_MSG;
      toast.success(successMessage, { id: "post-upload" });
      queryClient.invalidateQueries({ queryKey: ["personal-posts"] });  
      if (isEditing) {
        router.push("/profile");
      } else {
        setPostText("");
        setVisibility("Public");
        setMediaUploadComplete(false);
        router.push("/profile");
      }
    }
  };

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
          />

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
      <PostMediaPreview
        setIsSubmitting={setIsSubmitting}
        submitPost={handleMediaAttachment}
        removeThisMedia={removeThisMedia}
      />
    </>
  );
});

PostEditor.displayName = "PostEditor";

// Optimized AudienceDropdown
const AudienceDropdown = React.memo(
  ({
    postAudience,
    postAudienceData,
    dropdown,
    setPrice,
    setDropdown,
    updatePostAudience,
    price,
    config,
    nairaDisplayValue,
  }: {
    postAudience: PostAudienceDataProps | null;
    postAudienceData: PostAudienceDataProps[];
    dropdown: boolean;
    setPrice: (value: string) => void;
    setDropdown: (value: boolean) => void;
    updatePostAudience: (audience: PostAudienceDataProps) => void;
    price: number;
    config: any;
    nairaDisplayValue: string;
  }) => {
    return (
      <div className="flex flex-wrap items-start w-full gap-4">
        <button
          className="relative inline-block px-3 ml-2 text-sm text-gray-800 border border-gray-800 rounded-3xl dark:text-gray-200"
          onClick={() => setDropdown(!dropdown)}
        >
          <span className="flex items-center justify-start w-40 p-2 text-sm font-medium text-left cursor-pointer gap-3 transition-all duration-300">
            {postAudience?.icon}
            <span className="flex-1">{postAudience?.name}</span>
            {dropdown ? (
              <LucideChevronUp size={20} />
            ) : (
              <LucideChevronDown size={20} />
            )}
          </span>
          <div
            className={`absolute w-full left-0 mt-0 transition-all duration-300 z-10 ${
              dropdown
                ? "opacity-100 -translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <ul className="w-full mt-2 overflow-hidden text-left bg-white border border-gray-800 dark:bg-gray-950 rounded-2xl">
              {postAudienceData.map((audience) => (
                <li
                  key={audience.id}
                  onClick={() => updatePostAudience(audience)}
                  className="flex items-center p-3 pr-5 text-sm font-medium text-gray-600 cursor-pointer gap-2 dark:text-gray-400 dark:hover:bg-slate-800 hover:bg-violet-50"
                >
                  {audience.icon}
                  {audience.name}
                </li>
              ))}
            </ul>
          </div>
        </button>
        {postAudience?.name === "Price" && (
          <div className="flex items-center gap-1">
            <div className="flex items-center px-3 text-sm text-gray-800 border border-gray-800 rounded-3xl dark:text-gray-200">
              <span className="text-base">₦</span>
              <input
                type="text"
                value={nairaDisplayValue}
                onChange={(e) => {
                  if (e.target.value === "" || !e.target.value) {
                    setPrice("");
                    return;
                  }
                  setPrice(e.target.value);
                }}
                placeholder="Enter amount in Naira"
                className="outline-0 border-0 rounded-3xl px-1 text-base py-[6px] text-gray-800 dark:text-gray-200 bg-transparent"
              />
              {price > 0 && (
                <div className="flex items-center ml-auto gap-1">
                  <Image
                    width={16}
                    height={16}
                    src="/site/coin.svg"
                    className="w-4 h-4 aspect-square"
                    alt=""
                  />
                  <p className="text-primary-dark-pink">
                    {price.toLocaleString()} points
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

AudienceDropdown.displayName = "AudienceDropdown";

export default PostEditor;
