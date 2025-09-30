"use client";
import { useQueryClient } from "@tanstack/react-query";
import {
  LucideCamera,
  LucideCheck,
  LucideLoader,
  LucideSend,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { POST_CONFIG } from "@/config/config";
import { useAuthContext } from "@/contexts/UserUseContext";
import { imageTypes } from "@/lib/FileTypes";
import type { FileHolderProps, ReplyPostProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import FetchMentions from "@/utils/data/FetchMentions";
import ParseContentToHtml from "@/utils/ParseHtmlContent";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

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
        className="object-cover w-full bg-white rounded-lg shadow-lg aspect-square"
      />
      <span
        className="absolute top-0 right-0 flex items-center justify-center text-white bg-black rounded-full cursor-pointer w-7 h-7"
        onClick={() => remove(file)}
      >
        <X size={20} strokeWidth={3} />
      </span>
    </div>
  );
});
FilesHolder.displayName = "FilesHolder";

const ReplyPostComponent = ({ options, isReply }: ReplyPostProps) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
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
    [],
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
    [],
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
    [mentionStartPos, cursorPosition, typedComment, mentions],
  );
  // Keydown for mention navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
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
    [files],
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
      const url = `/comments/new`;

      // Parse final text to HTML (for links & mentions)
      const finalHtmlContent = ParseContentToHtml(typedComment, mentions);

      const formData = new FormData();
      formData.append("post_id", options?.post_id);
      formData.append("postId", String(options?.id));
      formData.append("comment", typedComment);
      formData.append("reply_to", options?.reply_to || "");
      formData.append("mentions", JSON.stringify(mentions));
      if (options.parentId) {
        formData.append("parentId", options.parentId);
      }
      files.forEach((file) => formData.append("files", file));

      const res = await axiosInstance.post(url, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent?.total) {
            setProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100),
            );
          }
        },
      });
      const { status, error, data } = res.data;

      if (status && !error) {
        setCommentSending(false);
        toast.success(POST_CONFIG.COMMENT.COMMENT_CREATED_SUCCESS_MSG);
        queryClient.invalidateQueries({
          queryKey: ["comments", options.post_id, user?.id],
        });
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
        <div className="flex flex-col items-center justify-center w-full p-2 text-center">
          <LoadingSpinner text={`${progress}%`} />
        </div>
      )}
      <div className="relative flex items-start pb-5 mt-5 gap-4 dark:text-white border-black/30">
        {/* Mention Suggestions Dropdown */}
        {showMentions && (
          <div
            className="absolute z-50 p-1 overflow-y-auto bg-white border border-gray-300 shadow-lg dark:bg-gray-800 dark:border-gray-700 rounded-md max-h-60"
            style={{ top: "90px", left: "80px", width: "220px" }}
          >
            {isMentionLoading ? (
              <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">
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
                    <p className="text-sm text-gray-900 truncate dark:text-white">
                      {userItem.name}
                      {userItem.isVerified && <LucideCheck size={8} />}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userItem.username}
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

        <div className="flex items-center gap-2">
          <Image
            width={65}
            height={65}
            src={user?.profile_image || "/site/avatar.png"}
            alt=""
            className="object-cover w-10 h-auto rounded-full md:w-10"
          />
        </div>
        <div className="flex flex-col items-start flex-1">
          <div className="w-full">
            <p className="mb-2 text-xs md:text-sm font-semibold">
              Replying to{" "}
              <span className="font-bold text text-primary-dark-pink">
                {options.author_username}
              </span>
            </p>
            <div
              className={`h-12 w-full flex items-center justify-center rounded-full outline outline-gray-200 mb-3`}
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
                className={`block pl-6 leading-none py-2 text-xs md:text-sm w-full outline-none border-none resize-none duration-300 transition-all bg-transparent dark:text-white dark:bg-transparent`}
              />
              {!isReply && (
                <div className="p-2 mr-2 gap-4">
                  <label htmlFor="file" className="cursor-pointer">
                    <LucideCamera
                      className="h-6 w-6 md:h-7 md:w-7"
                      strokeWidth={1.5}
                    />
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
              )}
              <button
                onClick={handleReplyClicked}
                className="hidden px-6 py-2 mr-1 text-white rounded-full bg-primary-dark-pink md:block"
              >
                Reply
              </button>
              <button
                onClick={handleReplyClicked}
                className="px-3 py-2 mr-1 text-white rounded-full bg-primary-dark-pink md:hidden"
              >
                <LucideSend className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
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
