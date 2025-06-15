"use client";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { LucideCamera, LucideLoader, LucideSend, X } from "lucide-react";
import Image from "next/image";
import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { imageTypes } from "@/lib/FileTypes";
import toast from "react-hot-toast";
import { getToken } from "../../utils/Cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FileHolderProps, ReplyPostProps } from "@/types/Components";
import { POST_CONFIG } from "@/config/config";
import FetchMentions from "@/utils/data/FetchMentions";
import ParseContentToHtml from "@/utils/ParseHtmlContent";

// Mock user data for @mentions (example)
interface MentionUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
}

const FilesHolder = React.memo(({ file, remove }: FileHolderProps) => {
  const objUrl = URL.createObjectURL(file);
  return (
    <div className="relative w-[80px] md:w-[90px] aspect-square">
      <Image
        src={objUrl}
        alt=""
        width={80}
        height={80}
        className="rounded-lg w-full aspect-square shadow-lg bg-white object-cover"
      />
      <span
        className="absolute top-0 right-0 bg-black text-white flex items-center justify-center w-7 h-7 rounded-full cursor-pointer"
        onClick={() => remove(file)}
      >
        <X size={20} strokeWidth={3} />
      </span>
    </div>
  );
});
FilesHolder.displayName = "FilesHolder";

const ReplyPostComponent = ({ options }: ReplyPostProps) => {
  const { user } = useUserAuthContext();
  const router = useRouter();

  // Existing states
  const [replyPostOpen, setReplyPostOpen] = useState(false);
  const [typedComment, setTypedComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [commentSending, setCommentSending] = useState(false);
  const [progress, setProgress] = useState(0);

  // For mentions
  const inputRef = useRef<HTMLInputElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionUser[]>(
    []
  );
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentions, setMentions] = useState<MentionUser[]>([]);
  const [isMentionLoading, setIsMentionLoading] = useState(false);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Search for users to mention
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

  // On mention query update
  useEffect(() => {
    if (mentionQuery.length > 0) {
      searchUsers(mentionQuery).then((users) => {
        setMentionSuggestions(users);
        setSelectedMentionIndex(0);
      });
    } else {
      setMentionSuggestions([]);
    }
  }, [mentionQuery, searchUsers]);

  // Focus toggling
  const handleTextAreaFocus = () => setReplyPostOpen(true);

  // Typing comment (detect @)
  const handleTypedComment = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setTypedComment(text);

    if (inputRef.current) {
      const cPos = inputRef.current.selectionStart || 0;
      setCursorPosition(cPos);

      // Detect mention
      const textBeforeCursor = text.substring(0, cPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        const hasSpaceAfterAt =
          textAfterAt.includes(" ") || textAfterAt.includes("\n");
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
    }
  }, []);

  // Keydown for mention navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
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
    [showMentions, mentionSuggestions, selectedMentionIndex]
  );

  // Select mention
  const selectMention = useCallback(
    (mentionedUser: MentionUser) => {
      if (!inputRef.current) return;

      // Avoid duplicate mentions
      if (mentions.some((m) => m.id === mentionedUser.id)) {
        toast.error(`@${mentionedUser.username} is already mentioned.`, {
          id: "mention-duplicate",
        });
        return;
      }

      const inputEl = inputRef.current;
      const currentText = typedComment;
      const beforeMention = currentText.substring(0, mentionStartPos);
      const afterMention = currentText.substring(cursorPosition);
      const newText = `${beforeMention}${mentionedUser.username} ${afterMention}`;
      const newCursorPos = mentionStartPos + mentionedUser.username.length + 2;

      setTypedComment(newText);
      setMentions((prev) => [...prev, mentionedUser]);

      setShowMentions(false);
      setMentionQuery("");

      // Focus and set cursor
      setTimeout(() => {
        inputEl.focus();
        inputEl.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }, 0);
    },
    [mentionStartPos, cursorPosition, typedComment, mentions]
  );

  // File handling
  const handleFiles = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList) {
        const newFiles = Array.from(fileList);
        if (newFiles.length > 5 || files.length + newFiles.length > 5) {
          return toast.error("You can only upload 5 files at a time");
        }
        newFiles.forEach((file) => {
          if (!imageTypes.includes(file.type)) {
            toast.error("Only images are allowed");
          } else {
            setFiles((prev) => {
              return [...new Set([...prev, ...newFiles])];
            });
          }
        });
      }
    },
    [files]
  );

  const removeFile = useCallback((file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  }, []);

  // Comment submit
  const handleReplyClicked = async () => {
    if (!typedComment && files.length === 0) {
      return toast.error("Comment cannot be empty");
    }
    try {
      setCommentSending(true);
      const token = getToken();
      const url = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/comments/new`;

      // Parse final text to HTML (for links & mentions)
      const finalHtmlContent = ParseContentToHtml(typedComment, mentions);

      const formData = new FormData();
      formData.append("post_id", options?.post_id);
      formData.append("postId", String(options?.id));
      formData.append("comment", typedComment);
      formData.append("reply_to", options?.reply_to || "");
      if (options.parentId) {
        formData.append("parentId", options.parentId);
      }
      files.forEach((file) => formData.append("files", file));

      const res = await axios.post(url, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent?.total) {
            setProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            );
          }
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const { status, error, data } = res.data;

      if (status && !error) {
        setCommentSending(false);
        toast.success(POST_CONFIG.COMMENT.COMMENT_CREATED_SUCCESS_MSG);
        options.setNewComment?.({
          text: finalHtmlContent,
          files,
          author_username: user?.username || "",
          time: new Date(),
          name: user?.name || "",
          profile_image: user?.profile_image || "",
          comment_id: data.comment_id,
        });

        // Reset fields
        setTypedComment("");
        setFiles([]);
        setMentions([]);
      } else {
        toast.error(POST_CONFIG.COMMENT.COMMENT_CREATED_ERROR_MSG);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error(POST_CONFIG.COMMENT.COMMENT_CREATED_ERROR_MSG);
    } finally {
      setCommentSending(false);
    }
  };

  return (
    <div>
      {commentSending && (
        <div className="flex w-full flex-col items-center text-center justify-center p-2">
          <LucideLoader
            size={30}
            className="animate-spin transition-all duration-300"
          />
          <p className="text-sm text-gray-500">{progress}%</p>
        </div>
      )}
      <div className="flex gap-4 items-start mt-5 dark:text-white pb-10 border-black/30 relative">
        {/* Mention Suggestions Dropdown */}
        {showMentions && (
          <div
            className="absolute z-50 bg-white dark:bg-gray-800 
                       border border-gray-300 dark:border-gray-700 
                       rounded-md shadow-lg max-h-60 overflow-y-auto p-1"
            style={{ top: "90px", left: "80px", width: "220px" }}
          >
            {isMentionLoading ? (
              <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : mentionSuggestions.length > 0 ? (
              mentionSuggestions.map((userItem, i) => (
                <div
                  key={userItem.id}
                  className={`flex items-center gap-2 p-2 cursor-pointer rounded-md transition-colors 
                    ${
                      i === selectedMentionIndex
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  onClick={() => selectMention(userItem)}
                  onMouseEnter={() => setSelectedMentionIndex(i)}
                >
                  <Image
                    src={userItem.avatar || "/site/avatar.png"}
                    alt={userItem.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {userItem.name}
                      {userItem.isVerified && (
                        <svg
                          className="w-4 h-4 inline-block ml-1 text-blue-500"
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
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userItem.username}
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

        <div className="flex items-center gap-2">
          <Image
            width={65}
            height={65}
            src={user?.profile_image || "/site/avatar.png"}
            alt=""
            className="w-10 md:w-10 h-auto rounded-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col items-start">
          <div className="w-full">
            <p className="mb-1 p-3 text-sm font-semibold">
              Replying to{" "}
              <span className="font-bold text-primary-dark-pink">
                {options.author_username}
              </span>
            </p>
            <div
              className={`h-auto w-full flex items-center justify-center rounded-full border border-gray-200 mb-3`}
            >
              <input
                ref={inputRef}
                onBlur={(e) => !e.target.value && setReplyPostOpen(false)}
                onFocus={handleTextAreaFocus}
                onChange={handleTypedComment}
                onKeyDown={handleKeyDown}
                disabled={commentSending}
                value={typedComment}
                placeholder="Type a reply"
                className={`block ml-3 leading-none py-2 w-full outline-none resize-none duration-300 transition-all bg-transparent dark:text-white dark:bg-slate-800`}
              />
              <div className="p-2 gap-4 mr-2">
                <label htmlFor="file" className="cursor-pointer">
                  <LucideCamera size={28} />
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    multiple
                    onChange={handleFiles}
                    accept="image/*"
                  />
                </label>
              </div>
              <button
                onClick={handleReplyClicked}
                className="bg-primary-dark-pink hidden mr-1 md:block text-white px-6 py-2 rounded-full"
              >
                Reply
              </button>
              <button
                onClick={handleReplyClicked}
                className="bg-primary-dark-pink md:hidden text-white px-3 py-2 mr-1 rounded-full"
              >
                <LucideSend size={20} />
              </button>
            </div>

            <div
              className={`flex gap-3 flex-wrap ${files.length > 0 && "mb-3"}`}
            >
              {files.map((file, index) => (
                <FilesHolder key={index} file={file} remove={removeFile} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyPostComponent;
