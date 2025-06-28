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
  const { setVisibility, visibility, setPostText, postText } =
    useNewPostStore();
  const [editedMedia, setEditedMedia] = useState<UserMediaProps[]>([]);
  const [removedIds, setRemovedIds] = useState<RemovedMediaIdProps[]>([]);
  const [media, setMedia] = useState<UploadedImageProp[] | null>(null);
  const { mediaUploadComplete, setMediaUploadComplete } =
    usePostMediaUploadContext();
  const isWaterMarkEnabled = usePostEditorContext(
    (state) => state.isWaterMarkEnabled
  );

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
    [user]
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
    []
  );

  // Mention search
  useEffect(() => {
    if (mentionQuery.length > 0) {
      searchUsers(mentionQuery).then((users) => {
        setMentionSuggestions(
          users.map((user, index) => ({ ...user, highlighted: index === 0 }))
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
    [setPostText]
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
    [mentionStartPos, cursorPosition, mentions, setPostText]
  );
  // Keydown navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showMentions && mentionSuggestions.length > 0) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSelectedMentionIndex((prev) =>
              prev < mentionSuggestions.length - 1 ? prev + 1 : 0
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedMentionIndex((prev) =>
              prev > 0 ? prev - 1 : mentionSuggestions.length - 1
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
    [showMentions, mentionSuggestions, selectedMentionIndex, selectMention]
  );

  // Preload existing post data
  useEffect(() => {
    if (posts) {
      setPostText(posts.content);
      if (posts.post_audience) {
        const audience = postAudienceData.find(
          (aud) => aud.name.toLowerCase() === posts.post_audience.toLowerCase()
        );
        if (audience) {
          setVisibility(audience.name);
          setPostAudience(audience);
        }
      }
      if (posts.UserMedia) {
        setEditedMedia(posts.UserMedia);
      }
    }
  }, [posts, setPostText, setVisibility, postAudienceData]);

  // Media attachments
  const handleMediaAttachment = useCallback((image: UploadedImageProp) => {
    setMedia((prevMedia) => [...(prevMedia || []), image]);
  }, []);

  const removeThisMedia = (id: string, type: string) => {
    setMedia((prevMedia) =>
      prevMedia ? prevMedia.filter((file) => file.fileId !== id) : null
    );
    const removeId = media?.find((med) => med.fileId === id);
    if (removeId) {
      setRemovedIds((prevIds) => [...prevIds, { id: removeId.id, type }]);
    }
  };

  // Update audience
  const updatePostAudience = useCallback(
    (audience: PostAudienceDataProps) => {
      setPostAudience(audience);
      setVisibility(audience.name);
      setDropdown(false);
    },
    [setVisibility]
  );

  const setPriceHandler = (value: string) => {
    const priceValue = parseInt(value.replace(/[^0-9.]/g, ""));
    if (priceValue < 0) {
      toast.error("Price cannot be negative.", {
        id: "post-price-error",
      });
      return;
    }
    if (isNaN(priceValue)) {
      toast.error("Invalid price value.", {
        id: "post-price-error",
      });
      return;
    }
    if (priceValue > 100000) {
      toast.error("Price cannot exceed 100,000.", {
        id: "post-price-error",
      });
      return;
    }
    setPrice(priceValue);
  };

  // Submit post
  const handlePostSubmit = async () => {
    if ((!content || content.trim() === "") && !media) {
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

    toast.loading("Creating your post...", {
      id: "post-upload",
    });

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
    if (res.error) {
      swal({
        title: "Error",
        text: res.message,
        icon: "error",
        buttons: ["Cancel", "Retry"],
        dangerMode: true,
      });
    } else {
      toast.success(POST_CONFIG.POST_CREATED_SUCCESS_MSG, {
        id: "post-upload",
      });
      setPostText("");
      setVisibility("Public");
      router.prefetch("/profile");
      router.push("/profile");
      setMedia(null);
      setEditedMedia([]);
      setRemovedIds([]);
      setMediaUploadComplete(false);
      setPrice(0);
      setMentions([]);
    }
  };

  return (
    <>
      <div className="md:p-8 p-4 dark:text-white relative">
        <div className="flex items-center mb-6">
          <PostCancel />
          <button
            onClick={handlePostSubmit}
            className="bg-primary-dark-pink text-white p-2 px-8 rounded ml-auto text-sm font-semibold cursor-pointer"
          >
            Post
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src={user?.profile_image || "/site/avatar.png"}
            alt="Profile"
            width={56}
            height={56}
            className="w-14 border border-gray-800 inline-block rounded-full"
          />
          <AudienceDropdown
            postAudience={postAudience}
            postAudienceData={postAudienceData}
            setPrice={setPriceHandler}
            dropdown={dropdown}
            setDropdown={setDropdown}
            updatePostAudience={updatePostAudience}
          />
        </div>

        <div className="relative mt-3">
          <textarea
            ref={textareaRef}
            className="block dark:bg-gray-950 dark:text-white rounded-md mb-3 leading-relaxed text-gray-700 font-medium w-full resize-none outline-none overflow-auto"
            placeholder="What's on your mind? Use @ to mention someone..."
            defaultValue={postText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
          />

          {showMentions && (
            <div
              className="absolute z-50 w-full bg-white dark:bg-gray-800 
                          border border-gray-300 dark:border-gray-700 
                          rounded-md shadow-lg max-h-60 overflow-y-auto p-1"
              style={{ top: "100%", left: 0 }}
            >
              {isMentionLoading ? (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
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
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        {mentions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Mentioned users:
            </p>
            <div className="flex flex-wrap gap-2">
              {mentions.map((mention) => (
                <div
                  key={mention.id}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm"
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
                        prev.filter((m) => m.id !== mention.id)
                      )
                    }
                    className="text-gray-500 hover:text-red-500 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <p className="text-xs text-gray-400 font-medium">
            {wordLimit} characters remaining
          </p>
        </div>
      </div>
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
  }: {
    postAudience: PostAudienceDataProps | null;
    postAudienceData: PostAudienceDataProps[];
    dropdown: boolean;
    setPrice: (value: string) => void;
    setDropdown: (value: boolean) => void;
    updatePostAudience: (audience: PostAudienceDataProps) => void;
  }) => {
    return (
      <div className="flex items-center gap-4 w-full">
        <button
          className="border inline-block border-gray-800 ml-2 rounded-3xl px-3 text-gray-800 dark:text-gray-200 text-sm relative"
          onClick={() => setDropdown(!dropdown)}
        >
          <span className="flex justify-start text-left gap-3 items-center font-medium text-sm p-2 transition-all duration-300 cursor-pointer w-40">
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
            <ul className="bg-white dark:bg-gray-950 rounded-2xl overflow-hidden mt-2 border border-gray-800 text-left w-full">
              {postAudienceData.map((audience) => (
                <li
                  key={audience.id}
                  onClick={() => updatePostAudience(audience)}
                  className="p-3 pr-5 text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium dark:hover:bg-slate-800 hover:bg-violet-50 cursor-pointer"
                >
                  {audience.icon}
                  {audience.name}
                </li>
              ))}
            </ul>
          </div>
        </button>
        {postAudience?.name === "Price" && (
          <div className="flex items-center border border-gray-800 rounded-3xl px-3 text-gray-800 dark:text-gray-200 text-sm">
            <Image
              width={20}
              height={20}
              src="/site/coin.svg"
              className="w-auto h-5 aspect-square"
              alt=""
            />
            <input
              type="text"
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="outline-0 border-0 rounded-3xl px-1 text-base py-[6px] text-gray-800 dark:text-gray-200"
            />
          </div>
        )}
      </div>
    );
  }
);

AudienceDropdown.displayName = "AudienceDropdown";

export default PostEditor;
