"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useUserAuthContext } from "@/lib/UserUseContext";
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
import {
  PostEditorProps,
  UploadedImageProp,
  UserMediaProps,
  PostAudienceDataProps,
  RemovedMediaIdProps,
  MentionUser,
} from "@/types/Components";
import { useNewPostStore } from "@/contexts/NewPostContext";
import { PostCancel } from "@/components/sub_components/sub/PostCancel";
import { usePostMediaUploadContext } from "@/contexts/PostMediaUploadContext";
import FetchMentions from "@/utils/data/FetchMentions";
import { usePostEditorContext } from "@/contexts/PostEditorContext";
import { useConfigContext } from "@/contexts/ConfigContext";
import ExistingMediaPreview from "./ExistingMediaPreview";
import Loader from "@/components/lib_components/LoadingAnimation";

interface MentionSuggestion extends MentionUser {
  highlighted?: boolean;
}

const PostEditor = React.memo(({ posts }: PostEditorProps) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dropdown, setDropdown] = useState(false);
  const [wordLimit, setWordLimit] = useState(1000);
  const [content, setContent] = useState<string>("");
  const { user } = useUserAuthContext();
  const [price, setPrice] = useState<number>(0);
  const [nairaDisplayValue, setNairaDisplayValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { setVisibility, visibility, setPostText, postText } =
    useNewPostStore();
  const [editedMedia, setEditedMedia] = useState<UserMediaProps[]>([]);
  const [removedIds, setRemovedIds] = useState<RemovedMediaIdProps[]>([]);
  const [media, setMedia] = useState<UploadedImageProp[] | null>(null);
  const { mediaUploadComplete, setMediaUploadComplete } =
    usePostMediaUploadContext();
  const isWaterMarkEnabled = usePostEditorContext(
    (state) => state.isWaterMarkEnabled,
  );
  const { config } = useConfigContext();

  // Mentions state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<
    MentionSuggestion[]
  >([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [mentions, setMentions] = useState<MentionUser[]>([]);
  const [isMentionLoading, setIsMentionLoading] = useState(false);

  // Post audience
  const [postAudience, setPostAudience] = useState<PostAudienceDataProps>({
    id: 1,
    name: "Public",
    icon: <HiOutlineEye size={20} className="inline" />,
  });

  // Audience options
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
    [user],
  );

  // User search simulation
  const searchUsers = useCallback(
    async (query: string): Promise<MentionUser[]> => {
      setIsMentionLoading(true);
      return new Promise((resolve) => {
        setTimeout(async () => {
          const filteredUsers = await FetchMentions(query);
          setIsMentionLoading(false);
          resolve(filteredUsers);
        }, 300);
      });
    },
    [],
  );

  // Mention search
  useEffect(() => {
    if (mentionQuery.length > 0) {
      searchUsers(mentionQuery).then((users) => {
        setMentionSuggestions(
          users.map((user, index) => ({ ...user, highlighted: index === 0 })),
        );
        setSelectedMentionIndex(0);
      });
    } else {
      setMentionSuggestions([]);
    }
  }, [mentionQuery, searchUsers]);

  // Textarea changes
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

      setContent(text);
      setPostText(text);
      setCursorPosition(cursorPos);

      const textBeforeCursor = text.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        const hasSpaceAfterAt =
          textAfterAt.includes(" ") || textAfterAt.includes("\n");
        // Show mention suggestions if not followed by space/new line
        if (!hasSpaceAfterAt && textAfterAt.length <= 20) {
          setShowMentions(true);
          setMentionQuery(textAfterAt);
          setMentionStartPos(lastAtIndex);
        } else {
          setShowMentions(false);
          setMentionQuery("");
        }
      } else {
        setShowMentions(false);
        setMentionQuery("");
      }
    },
    [setPostText],
  );

  // Mention selection
  const selectMention = useCallback(
    (mentionedUser: MentionUser) => {
      if (!textareaRef.current) return;

      // Prevent multiple mentions of the same user
      if (mentions.find((m) => m.id === mentionedUser.id)) {
        toast.error(`@${mentionedUser.username} is already mentioned.`, {
          id: "mention-duplicate",
        });
        return;
      }
      const textarea = textareaRef.current;
      const currentText = textarea.value;
      const beforeMention = currentText.substring(0, mentionStartPos);
      const afterMention = currentText.substring(cursorPosition);
      const newText = `${beforeMention}${mentionedUser.username} ${afterMention}`;
      const newCursorPos = mentionStartPos + mentionedUser.username.length + 2;

      textarea.value = newText;
      setContent(newText);
      setPostText(newText);

      setMentions((prev) => [...prev, mentionedUser]);
      setShowMentions(false);
      setMentionQuery("");

      textarea.focus();
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }, 0);
    },
    [mentionStartPos, cursorPosition, mentions, setPostText],
  );
  // Keydown navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showMentions && mentionSuggestions.length > 0) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSelectedMentionIndex((prev) =>
              prev < mentionSuggestions.length - 1 ? prev + 1 : 0,
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedMentionIndex((prev) =>
              prev > 0 ? prev - 1 : mentionSuggestions.length - 1,
            );
            break;
          case "Enter":
          case "Tab":
            e.preventDefault();
            selectMention(mentionSuggestions[selectedMentionIndex]);
            break;
          case "Escape":
            setShowMentions(false);
            setMentionQuery("");
            break;
        }
      }
    },
    [showMentions, mentionSuggestions, selectedMentionIndex, selectMention],
  );

  // Preload existing post data
  useEffect(() => {
    if (posts) {
      const existingContent = posts.content || "";
      setContent(existingContent);
      setPostText(existingContent);
      // Update word limit based on existing content
      setWordLimit(1000 - existingContent.length);

      if (posts.post_audience) {
        let audienceName = posts.post_audience.toLowerCase();
        // Map "price" audience to "Price" for the dropdown
        if (audienceName === "price") {
          audienceName = "price";
        }
        const audience = postAudienceData.find(
          (aud) => aud.name.toLowerCase() === audienceName,
        );
        if (audience) {
          setVisibility(audience.name);
          setPostAudience(audience);
        }
      }
      if (posts.UserMedia) {
        setEditedMedia(posts.UserMedia);
      }
      if (posts.post_price) {
        setPrice(posts.post_price);
        // Convert points to Naira for display
        const nairaValue = config?.point_conversion_rate_ngn
          ? Math.round(posts.post_price * config.point_conversion_rate_ngn)
          : posts.post_price;
        setNairaDisplayValue(nairaValue.toString());
      }
    }
  }, [posts, setPostText, setVisibility, postAudienceData, config]);

  // Media attachments
  const handleMediaAttachment = useCallback((image: UploadedImageProp) => {
    setMedia((prevMedia) => [...(prevMedia || []), image]);
  }, []);

  const removeThisMedia = (id: string, type: string) => {
    setMedia((prevMedia) =>
      prevMedia ? prevMedia.filter((file) => file.fileId !== id) : null,
    );
    const removeId = media?.find((med) => med.fileId === id);
    if (removeId) {
      setRemovedIds((prevIds) => [...prevIds, { id: removeId.id, type }]);
    }
  };

  // Remove existing media
  const removeExistingMedia = (mediaId: string, mediaType: string) => {
    setEditedMedia((prevMedia) =>
      prevMedia.filter((item) => item.media_id !== mediaId),
    );
    setRemovedIds((prevIds) => [...prevIds, { id: mediaId, type: mediaType }]);
  };

  // Update audience
  const updatePostAudience = useCallback(
    (audience: PostAudienceDataProps) => {
      setPostAudience(audience);
      setVisibility(audience.name);
      setDropdown(false);
    },
    [setVisibility],
  );

  const setPriceHandler = (value: string) => {
    // Store the display value (Naira)
    setNairaDisplayValue(value);

    const nairaValue = parseInt(value.replace(/[^0-9.]/g, ""));
    if (nairaValue < 0) {
      toast.error("Price cannot be negative.", {
        id: "post-price-error",
      });
      return;
    }
    if (isNaN(nairaValue)) {
      setPrice(0);
      return;
    }
    if (nairaValue > 10000000) {
      // 10 million Naira limit
      toast.error("Price cannot exceed ₦10,000,000.", {
        id: "post-price-error",
      });
      return;
    }

    // Convert Naira to points for storage
    const pointsValue = config?.point_conversion_rate_ngn
      ? Math.floor(nairaValue / config.point_conversion_rate_ngn)
      : 0;
    setPrice(pointsValue);
  };

  // Submit post
  const handlePostSubmit = async () => {
    if (isSubmitting) {
      return; // Prevent double submission
    }

    if (
      (!content || content.trim() === "") &&
      !posts &&
      (!media || !editedMedia)
    ) {
      toast.error("Post is empty, please write something.", {
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
    if (!mediaUploadComplete && media && media.length > 0) {
      toast.error("Please wait for all media uploads to complete.", {
        id: "post-upload",
      });
      return;
    }
    if (media?.some((file) => !file.fileId)) {
      toast.error("Please wait for all uploads to complete.", {
        id: "post-upload",
      });
      return;
    }

    setIsSubmitting(true);
    const isEditing = posts?.post_id;

    toast.loading(
      isEditing ? "Saving your changes..." : "Creating your post...",
      {
        id: "post-upload",
      },
    );

    // Convert to HTML
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
      toast.error(res.message, {
        id: "post-upload",
      });
    } else {
      const successMessage = isEditing
        ? "Post updated successfully!"
        : POST_CONFIG.POST_CREATED_SUCCESS_MSG;
      toast.success(successMessage, {
        id: "post-upload",
      });

      if (isEditing) {
        // For editing, just redirect without clearing form
        router.prefetch("/profile");
        router.push("/profile");
      } else {
        // For creating, clear the form
        setPostText("");
        setVisibility("Public");
        setMedia(null);
        setEditedMedia([]);
        setRemovedIds([]);
        setMediaUploadComplete(false);
        setPrice(0);
        setNairaDisplayValue("");
        setMentions([]);
        router.prefetch("/profile");
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

  const date = checkDateDiff();

  return (
    <>
      <div className="relative p-4 md:p-8 dark:text-white">
        <div className="flex items-center mb-6">
          <PostCancel />
          <button
            onClick={handlePostSubmit}
            disabled={isSubmitting}
            className={`text-white p-2 px-8 rounded ml-auto text-sm font-semibold transition-all duration-200 transform ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed opacity-50 scale-95"
                : "bg-primary-dark-pink hover:bg-primary-dark-pink/90 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            }`}
          >
            {isSubmitting
              ? posts?.post_id
                ? "Saving..."
                : "Creating..."
              : posts?.post_id
                ? "Save"
                : "Post"}
          </button>
        </div>
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
            updatePostAudience={updatePostAudience}
            price={price}
            config={config}
            nairaDisplayValue={nairaDisplayValue}
          />
        </div>

        <div className="relative mt-3">
          <textarea
            ref={textareaRef}
            className="block dark:bg-gray-950 dark:text-white rounded-md mb-3 leading-relaxed text-gray-700 font-medium w-full resize-none outline-none overflow-auto min-h-[120px] p-3 border border-gray-300 dark:border-gray-700"
            placeholder="What's on your mind? Use @ to mention someone..."
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={6}
          />

          {showMentions && (
            <div
              className="absolute z-50 w-full p-1 overflow-y-auto bg-white border border-gray-300 shadow-lg dark:bg-gray-800
  dark:border-gray-700
 rounded-md max-h-60"
              style={{ top: "100%", left: 0 }}
            >
              {isMentionLoading ? (
                <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : mentionSuggestions.length > 0 ? (
                mentionSuggestions.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer rounded-md transition-colors
                      ${
                        index === selectedMentionIndex
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    onClick={() => selectMention(user)}
                    onMouseEnter={() => setSelectedMentionIndex(index)}
                  >
                    <Image
                      src={user.avatar || "/site/avatar.png"}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                          {user.name}
                        </p>
                        {user.isVerified && (
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.username}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        {mentions.length > 0 && (
          <div className="mb-3">
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Mentioned users:
            </p>
            <div className="flex flex-wrap gap-2">
              {mentions.map((mention) => (
                <div
                  key={mention.id}
                  className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full gap-2 dark:bg-gray-800"
                >
                  <Image
                    src={mention.avatar || "/site/avatar.png"}
                    alt={mention.name}
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{mention.username}</span>
                  <button
                    onClick={() =>
                      setMentions((prev) =>
                        prev.filter((m) => m.id !== mention.id),
                      )
                    }
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <p className="text-xs font-medium text-gray-400">
            {wordLimit} characters remaining
          </p>
        </div>
      </div>

      {/* Existing Media Preview */}
      {editedMedia.length > 0 && !date && (
        <div className="px-4 md:px-8">
          <ExistingMediaPreview
            media={editedMedia}
            onRemove={removeExistingMedia}
          />
        </div>
      )}

      <PostMediaPreview
        submitPost={handleMediaAttachment}
        removeThisMedia={removeThisMedia}
      />
    </>
  );
});

PostEditor.displayName = "PostEditor";

// AudienceDropdown
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
  },
);

AudienceDropdown.displayName = "AudienceDropdown";

export default PostEditor;
