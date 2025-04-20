import usePostComponent from "@/contexts/post-component-preview";
import {
  Attachment,
  MediaFile,
  MessageBubbleContentProps,
} from "@/types/components";
import Image from "next/image";
import { HiPlay } from "react-icons/hi";
import { LucideImage, LucideVideo, Upload } from "lucide-react";
import { useEffect, useState } from "react";

const MessageBubbleContent = ({
  message,
  hasAttachments,
  hasMessage,
  hasRawFiles,
  attachment,
  rawFiles,
  isSender,
}: MessageBubbleContentProps) => {
  const { fullScreenPreview } = usePostComponent();
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const handlePreview = (file: Attachment, index: number) => {
    fullScreenPreview({
      url: `${file.url}`,
      type: file.type.includes("image") ? "image" : "video",
      open: true,
      ref: index,
      otherUrl:
        attachment?.map((f) => ({
          url: f.url,
          type: f.type,
        })) || [],
      withOptions: true,
    });
  };
  const handleRawPreview = (file: MediaFile, index: number) => {
    fullScreenPreview({
      url: `${file.previewUrl}`,
      type: file.type.includes("image") ? "image" : "video",
      open: true,
      ref: index,
      otherUrl:
        rawFiles?.map((f) => ({
          url: f.previewUrl,
          type: f.type,
        })) || [],
      withOptions: true,
    });
  };
  useEffect(() => {
    const UploadRawFiles = rawFiles?.map((item) => {
      if (item.type === "image") {
      }
      if (item.type === "video") {
      }
    });
  }, [rawFiles]);

  const renderMedia = (file: Attachment, index: number) => (
    <div
      key={index}
      className="p-2 cursor-pointer relative group transition-transform duration-200 hover:scale-105"
      onClick={() => handlePreview(file, index)}
    >
      {file.type.includes("image") ? (
        <div className="relative">
          <Image
            priority
            width={300}
            height={300}
            quality={80}
            src={file.url}
            alt="Uploaded content"
            className="w-full object-cover rounded-lg aspect-square shadow-md group-hover:brightness-90 transition"
          />
          <span className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
            <LucideImage className="text-white" size={16} />
          </span>
        </div>
      ) : (
        <div className="relative">
          <video
            className="w-full object-cover rounded-lg shadow-md group-hover:brightness-75 transition"
            muted
            playsInline
            preload="metadata"
          >
            <source src={file.url} type={file.type} />
          </video>
          <div className="bg-black/40 absolute inset-0 w-full h-full flex items-center justify-center opacity-100 group-hover:bg-black/60 transition">
            <button className="h-12 w-12 p-1 rounded-full flex items-center justify-center bg-primary-dark-pink/90 aspect-square shadow-lg hover:bg-primary-dark-pink transition">
              <HiPlay className="text-white" size={40} />
            </button>
          </div>
          <span className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
          <LucideVideo className="text-white" size={16} />
          </span>
        </div>
      )}
    </div>
  );

  const renderRawMedia = (file: MediaFile, index: number) => (
    <div
      key={index}
      className="p-2 cursor-pointer relative group transition-transform duration-200 hover:scale-105"
      onClick={() => handleRawPreview(file, index)}
    >
      {file.type.includes("image") ? (
        <div className="relative">
          <Image
            priority
            width={300}
            height={300}
            src={file.previewUrl}
            alt="Uploaded content"
            className="w-full object-cover rounded-lg aspect-square shadow-md group-hover:brightness-90 transition"
          />
          <span className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
            <LucideImage className="text-white" size={16} />
          </span>
        </div>
      ) : (
        <div className="relative">
          <video
            className="w-full object-cover rounded-lg shadow-md group-hover:brightness-75 transition"
            muted
            playsInline
            preload="metadata"
          >
            <source src={file.previewUrl} type={file.type} />
          </video>
          <div className="bg-black/40 absolute inset-0 w-full h-full flex items-center justify-center opacity-100 group-hover:bg-black/60 transition">
            <button className="h-12 w-12 p-1 rounded-full flex items-center justify-center bg-primary-dark-pink/90 aspect-square shadow-lg hover:bg-primary-dark-pink transition">
              <HiPlay className="text-white" size={40} />
            </button>
          </div>
          <span className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
            <LucideVideo className="text-white" size={16} />
          </span>
        </div>
      )}
      {progress[file.previewUrl] < 100 && (
        <div className="absolute top-3 right-3 flex items-center justify-center w-12 h-12 z-10">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-gray-300"
              d="M18 2.0845
       a 15.9155 15.9155 0 0 1 0 31.831
       a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              className="text-primary-dark-pink"
              d="M18 2.0845
       a 15.9155 15.9155 0 0 1 0 31.831
       a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="100, 100"
              strokeDashoffset={100 - (progress[file.previewUrl] || 0)}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs text-white font-semibold drop-shadow">
            {progress[file.previewUrl] || 0}%
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {hasAttachments && (
        <div
          className={`grid overflow-hidden ${
            (attachment.length ?? 0) >= 4 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {attachment.map(renderMedia)}
        </div>
      )}

      {hasRawFiles && (
        <div
          className={`grid overflow-hidden ${
            (rawFiles?.length ?? 0) >= 4 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {rawFiles?.map(renderRawMedia)}
        </div>
      )}

      {hasMessage && (
        <div
          className={`p-4 rounded-3xl font-medium ${
            isSender
              ? "bg-gray-100 rounded-br-none"
              : "bg-primary-dark-pink text-white rounded-bl-none"
          }`}
        >
          <div
            className={`leading-relaxed w-full text-wrap ${
              isSender ? "sender-link-style" : "receiver-link-style"
            }`}
            dangerouslySetInnerHTML={{
              __html: message as TrustedHTML,
            }}
          />
        </div>
      )}
    </>
  );
};

export default MessageBubbleContent;
