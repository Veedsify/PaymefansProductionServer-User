"use client"
import { useNewPostStore } from "@/contexts/new-post-context";
import { FileVideo2, Image, ImageIcon, LucidePaperclip } from "lucide-react";
import toast from "react-hot-toast";
import { HiCamera, HiUser, HiVideoCamera } from "react-icons/hi"
import Toggle from "../checked";
import { imageTypes, videoTypes } from "@/lib/filetypes";

const NewPostMediaAdd = ({
    handleFileSelect
}: {
    handleFileSelect: (files: File[]) => void
}) => {
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files as FileList
        if (files) {
            let validFiles: File[] = [];

            Array.from(files).forEach((file) => {
                if (file.size > 10000000 && imageTypes.includes(file.type)) { // 10MB = 10,000,000 bytes
                    return toast.error("File size should not exceed 10MB");; // Skip further processing for this file
                }
                if (!imageTypes.includes(file.type) && !videoTypes.includes(file.type)) {
                    return toast.error("Invalid file type");; // Skip further processing for this file
                }
                // If the file passes all checks, add it to the valid files array
                validFiles.push(file);
            });

            if (validFiles.length > 0) {
                handleFileSelect(validFiles); // Process only the valid files
            }
        }
    }
    return (
        <>
            <div className="md:px-8 px-4 w-full dark:text-white flex md:justify-start gap-3 items-center">
                <label htmlFor="attachments" className='cursor-pointer'>
                    <ImageIcon
                        size={45}
                        className='border border-gray-400 dark:border-slate-800 p-2 rounded-lg'
                    />
                </label>
                <input type="file" accept="image/*, video/*" multiple
                    onChange={handleImageSelect}
                    id="attachments" className="hidden" name="attachments" />
                <input type="file" className="hidden" id="flie" capture="environment" />
                <label htmlFor="flie" className='cursor-pointer'>
                    <FileVideo2 size={45} strokeWidth={2}
                        className="border border-gray-400 dark:border-slate-800 p-2 rounded-lg"
                    />
                </label>
                <div className="flex items-center gap-3">
                    <Toggle
                        state={false}
                    />
                    <small>
                        enable watermark
                    </small>
                </div>
            </div>
        </>
    )
}

export default NewPostMediaAdd