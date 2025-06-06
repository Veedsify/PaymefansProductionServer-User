"use client";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { LucideCamera, LucideLoader, LucideSend, X } from "lucide-react";
import Image from "next/image";
import React, { ChangeEvent, useCallback, useState } from "react";
import { imageTypes } from "@/lib/FileTypes";
import toast from "react-hot-toast";
import { getToken } from "../../utils/Cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FileHolderProps, ReplyPostProps } from "@/types/Components";
import { POST_CONFIG } from "@/config/config";

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
  const [replyPostOpen, setReplyPostOpen] = useState(false);
  const [typedComment, setTypedComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [commentSending, setCommentSending] = useState(false);
  const [progress, setProgress] = useState(0);  
  const router = useRouter();

  const handleTextAreaFocus = () => setReplyPostOpen(true);

  const handleTypedComment = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTypedComment(e.target.value);
  }, []);

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

  const handleReplyClicked = async () => {
    if (!typedComment && files.length == 0)
      return toast.error("Comment cannot be empty");
    try {
      setCommentSending(true);
      const token = getToken();
      const url = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/comments/new`;
      
      const formData = new FormData();
      formData.append("post_id", options?.post_id);
      formData.append("postId", String(options?.id));
      formData.append("comment", typedComment);
      formData.append("reply_to", options?.reply_to || "");
      if(options.parentId){
        formData.append("parentId", options.parentId);
      }
      files.forEach((file) => formData.append("files", file));

      const res = await axios.post(url, formData, {
        cancelToken: new axios.CancelToken((c) => (c)), // Simplified cancel token
        onUploadProgress: (progressEvent) => {
          if (progressEvent?.total) {
            setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
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
          text: data.comment,
          files,
          author_username: user?.username || "",
          time: new Date(),
          name: user?.name || "",
          profile_image: user?.profile_image || "",
          comment_id: data.comment_id,
        });

        // Reset form
        setTypedComment("");
        setFiles([]);
      } else {
        toast.error(POST_CONFIG.COMMENT.COMMENT_CREATED_ERROR_MSG);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error(POST_CONFIG.COMMENT.COMMENT_CREATED_ERROR_MSG);
    } finally {
      setCommentSending(false); // Always reset sending state
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
      <div className="flex gap-4 items-start mt-5 dark:text-white pb-10 border-black/30">
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
                onBlur={(e) => !e.target.value && setReplyPostOpen(false)}
                onFocus={handleTextAreaFocus}
                onChange={handleTypedComment}
                disabled={commentSending}
                value={typedComment}
                placeholder="Type a reply"
                className={`block ml-3 leading-none py-2 w-full outline-none resize-none duration-300 transition-all bg-transparent dark:text-white dark:bg-slate-800 `}
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
