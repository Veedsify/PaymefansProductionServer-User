"use client";
import { useNewPostStore } from "@/contexts/new-post-context";
import { MdOutlinePermMedia } from "react-icons/md";
import toast from "react-hot-toast";
import Toggle from "../checked";
import { imageTypes, videoTypes } from "@/lib/filetypes";
import { useUserAuthContext } from "@/lib/userUseContext";
import { POST_CONFIG } from "@/config/config";
const {
  MODEL_POST_LIMIT,
  IMAGE_FILE_SIZE_LIMIT,
  IMAGE_FILE_SIZE_LIMIT_ERROR_MSG,
  USER_POST_LIMIT,
  MODEL_POST_LIMIT_ERROR_MSG,
  USER_POST_LIMIT_ERROR_MSG,
} = POST_CONFIG;

const NewPostMediaAdd = ({
  handleFileSelect,
}: {
  handleFileSelect: (files: File[]) => void;
}) => {
  const { user } = useUserAuthContext();
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files as FileList;
    if (files) {
      let validFiles: File[] = [];

      Array.from(files).forEach((file) => {
        // File size validation
        if (
          file.size > IMAGE_FILE_SIZE_LIMIT &&
          file.type.startsWith("image/")
        ) {
          // 10MB = 10,000,000 bytes
          toast.error(IMAGE_FILE_SIZE_LIMIT_ERROR_MSG);
          return; // Skip further processing for this file
        }

        // File type validation
        if (
          !imageTypes.includes(file.type) &&
          !videoTypes.includes(file.type)
        ) {
          toast.error("Invalid file type");
          return; // Skip further processing for this file
        }

        // If file passes both checks, add it to the valid files array
        validFiles.push(file);
      });

      // Check if the number of valid files exceeds the limit of 5
      if (validFiles.length > USER_POST_LIMIT && !user?.is_model) {
        toast.error(USER_POST_LIMIT_ERROR_MSG);
        validFiles = validFiles.slice(0, 5); // Keep only the first 5 valid files
      }

      if (validFiles.length > MODEL_POST_LIMIT && user?.is_model) {
        toast.error(MODEL_POST_LIMIT_ERROR_MSG);
        validFiles = validFiles.slice(0, 30); // Keep only the first 20 valid files
      }

      // Process valid files if any
      if (validFiles.length > 0) {
        handleFileSelect(validFiles);
      }
    }
  };
  return (
    <>
      <div className="md:px-8 border-y py-3 px-4 w-full dark:text-white flex md:justify-start gap-3 items-center">
        <label htmlFor="attachments" className="cursor-pointer">
          <MdOutlinePermMedia
            size={40}
            className="border border-gray-400 dark:border-slate-800 p-2 rounded-lg"
          />
        </label>
        <input
          type="file"
          accept="image/*, video/*"
          multiple
          onChange={handleImageSelect}
          id="attachments"
          className="hidden"
          name="attachments"
        />
        <div className="flex items-center gap-3">
          <Toggle state={false} />
          <small>enable watermark</small>
        </div>
      </div>
    </>
  );
};

export default NewPostMediaAdd;
