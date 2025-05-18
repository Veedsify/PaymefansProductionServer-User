"use client";
import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { imageTypes, videoTypes } from "@/lib/filetypes";

type MediaProps = {
  id: string;
  file: File;
  progress: number;
  removeThisMedia: (id: string, type: string) => void;
};

const Media = ({ id, file, removeThisMedia, progress }: MediaProps) => {
  // Memoize URL generation and cleanup for videos
  const url = useMemo(() => {
    if (imageTypes.includes(file.type)) {
      return URL.createObjectURL(file);
    } else if (videoTypes.includes(file.type)) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (!url) {
    return (
      <div className="relative">
        <div className="bg-gray-200 animate-pulse h-32 w-32 rounded-xl"></div>
      </div>
    );
  }

  const isVideo = videoTypes.includes(file.type);

  return (
    <div className="relative">
      {isVideo ? (
        <video
          src={url}
          playsInline
          className="relative object-cover h-auto aspect-square shadow-lg border block rounded-xl z-10"
        />
      ) : (
        <Image
          priority
          src={url}
          alt={file.name || "Media preview"}
          width={200}
          height={200}
          className="relative object-cover h-auto aspect-square shadow-lg border block rounded-xl z-10"
        />
      )}
      <div className="absolute top-0 right-0 bg-black/50 text-white p-1 w-full h-full rounded-xl flex items-center justify-center z-20">
        <button
          onClick={() => removeThisMedia(id, file.type)}
          className="cursor-pointer"
          aria-label="Remove media"
          type="button"
        >
          <X size={20} />
        </button>
      </div>
      {progress >= 0 && (
        <div className="absolute bottom-2 left-0 right-0 text-white z-20 text-center">
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(Media);
