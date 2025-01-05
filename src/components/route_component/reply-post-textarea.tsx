"use client"
import { useUserAuthContext } from "@/lib/userUseContext";
import { LucideCamera, LucideLoader, X } from "lucide-react";
import Image from "next/image";
import React, { ChangeEvent, useCallback, useState } from "react";
import { imageTypes } from "@/lib/filetypes";
import toast from "react-hot-toast";
import { getToken } from "../../utils/cookie.get";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FileHolderProps, ReplyPostProps } from "@/types/components";
import {POST_CONFIG} from "@/config/config";



const FilesHolder = React.memo(({ file, remove }: FileHolderProps) => {
    const objUrl = URL.createObjectURL(file);
    return (
        <div className="relative w-[100px] aspect-square">
            <Image src={objUrl} alt="" width={100} height={100} className="rounded-lg w-full aspect-square shadow-lg bg-white object-cover" />
            <span className="absolute top-0 right-0 bg-black text-white flex items-center justify-center w-7 h-7 rounded-full cursor-pointer" onClick={() => remove(file)}>
                <X size={20} strokeWidth={3} />
            </span>
        </div>
    );
});
FilesHolder.displayName = "FilesHolder";



export const ReplyPostComponent = ({ options }: ReplyPostProps) => {
    const { user } = useUserAuthContext();
    const [replyPostOpen, setReplyPostOpen] = useState(false);
    const [typedComment, setTypedComment] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [commentSending, setCommentSending] = useState(false);
    const router = useRouter();

    const handleTextAreaFocus = () => setReplyPostOpen(true);

    const handleTypedComment = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setTypedComment(e.target.value);
    }, []);

    const handleFiles = useCallback((e: ChangeEvent<HTMLInputElement>) => {
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
                    })
                }
            });
        }
    }, [files]);

    const removeFile = useCallback((file: File) => {
        setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    }, []);

    const handleReplyClicked = async () => {
        if ((!typedComment && files.length == 0)) return toast.error("Comment cannot be empty");
        try {
            setCommentSending(true);
            const token = getToken();
            const url = `${process.env.NEXT_PUBLIC_EXPRESS_URL}/comment/new`;
            const formData = new FormData();
            formData.append("post_id", options?.post_id);
            formData.append("postId", String(options?.id))
            formData.append("comment", typedComment);
            formData.append("reply_to", options?.reply_to || "");
            files.forEach((file) => {
                formData.append("files", file);
            });
            let cancel;
            // Perform your API call here with axios using the token and url
            const res = await axios.post(url, formData, {
                cancelToken: new axios.CancelToken((c) => cancel = c),
                onUploadProgress(progressEvent) {
                    if (progressEvent) {
                        console.log(progressEvent.loaded / progressEvent.total! * 100 + "%");
                    }
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            const data = res.data;
            console.log(data)
            if (data.status) {
                toast.success(POST_CONFIG.COMMENT.COMMENT_CREATED_SUCCESS_MSG);
                setCommentSending(false);
                options.setNewComment?.({
                    text: data.data.comment,
                    files: files,
                    author_username: user?.username || "",
                    time: new Date(),
                    name: user?.name || "",
                    profile_image: user?.profile_image || "",
                })
                setTypedComment("");
                setFiles([]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            {commentSending && <div className="flex w-full text-center justify-center p-2">
                <LucideLoader size={30} className="animate-spin transition-all duration-300" />
            </div>}
            <div className="flex gap-4 items-start mt-5 dark:text-white">
                <div className="flex items-center gap-2">
                    <Image width={80} height={80} src={user?.profile_image || "/site/avatar.png"} alt="" className="w-10 md:w-16 h-auto rounded-full object-cover" />
                </div>
                <div className="flex-1">
                    <p className="mb-3 p-3 text-sm font-semibold">
                        Replying to <span className="font-bold text-primary-dark-pink">{options.author_username}</span>
                    </p>
                    <div className={`h-auto mb-3`}>
                        <textarea
                            onBlur={(e) => !e.target.value && setReplyPostOpen(false)}
                            onFocus={handleTextAreaFocus}
                            onChange={handleTypedComment}
                            disabled={commentSending}
                            value={typedComment}
                            placeholder="Type a reply"
                            className={`block border w-full outline-none p-3 resize-none duration-300 transition-all ${replyPostOpen ? "h-full" : "h-1/3"} dark:text-white dark:bg-slate-800 rounded-md`}
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap mb-3">
                        {files.map((file, index) => (
                            <FilesHolder key={index} file={file} remove={removeFile} />
                        ))}
                    </div>
                    <div className="flex p-3 gap-4">
                        <span className="cursor-pointer">
                            <label htmlFor="file" className="cursor-pointer">
                                <LucideCamera size={30} />
                                <input type="file" id="file" className="hidden" multiple onChange={handleFiles} accept="image/*" />
                            </label>
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleReplyClicked}
                    className="bg-primary-dark-pink text-white px-6 py-2 rounded-full">Reply</button>
            </div>
        </div>
    );
};

export default ReplyPostComponent;
