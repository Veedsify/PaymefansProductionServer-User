import React from "react";
import { X } from "lucide-react";
import { MediaFile } from "@/types/MessageComponents";

interface FileUploadProgressProps {
  files: MediaFile[];
  progress: Record<number, number>;
  onCancel?: () => void;
}
const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  files,
  progress,
  onCancel,
}) => {
  if (!files.length) return null;

  return (
      <div className="absolute -top-[250px] left-0 w-full bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
          Uploading {files.length} {files.length === 1 ? "file" : "files"}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
            aria-label="Cancel upload"
          >
            <X size={20} />
          </button>
        )}
      </div>
    
      <div className="space-y-4">
        {files.map((file, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="truncate max-w-[250px] text-gray-700 dark:text-gray-300 font-medium">
                {file.file.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {progress[index] ? `${progress[index]}%` : "Pending..."}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress[index] || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadProgress;
