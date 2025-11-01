import { LucideImage } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback } from "react";
import usePostComponent from "@/contexts/PostComponentPreview";

interface AttachmentProps {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface AttachmentRendererProps {
  attachment: AttachmentProps;
  className?: string;
  allAttachments?: AttachmentProps[];
  index?: number;
}

const AttachmentRenderer: React.FC<AttachmentRendererProps> = ({
  attachment,
  className = "",
  allAttachments = [],
  index = 0,
}) => {
  const fullScreenPreview = usePostComponent(
    (state) => state.fullScreenPreview,
  );

  // Handle image preview
  const handlePreview = useCallback(() => {
    const newIndex = allAttachments.findIndex(
      (file) => file.fileUrl === attachment.fileUrl,
    );

    fullScreenPreview({
      url: attachment.fileUrl,
      type: "image",
      userProfile: null,
      open: true,
      ref: newIndex,
      otherUrl: allAttachments.map((file) => ({
        url: file.fileUrl,
        type: "image" as const,
      })),
      withOptions: true,
    });
  }, [attachment.fileUrl, allAttachments, fullScreenPreview]);

  // Only handle images - reject other file types
  if (!attachment.fileType?.startsWith("image")) {
    return null;
  }

  return (
    <div
      className={`relative cursor-pointer group transition-transform duration-200 grid hover:scale-105 ${className} `}
      onClick={handlePreview}
      tabIndex={0}
      aria-label="Image preview"
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePreview();
        }
      }}
    >
      <Image
        src={attachment.fileUrl}
        alt={attachment.fileName}
        width={150}
        height={150}
        className="object-cover w-full rounded-lg max-w-28 aspect-square group-hover:brightness-90 transition"
        loading="eager"
      />
      <span className="absolute px-2 py-1 text-xs text-gray-700 rounded shadow bottom-2 right-2 bg-white/30 group-hover:bg-primary-dark-pink group-hover:text-white transition">
        <LucideImage className="text-white" size={16} />
      </span>
    </div>
  );
};

export default AttachmentRenderer;
