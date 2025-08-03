"use client";
import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { imageTypes, videoTypes } from "@/lib/FileTypes";

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
        <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-xl"></div>
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
          className="relative z-10 block object-cover h-auto border shadow-lg aspect-square rounded-xl"
        />
      ) : (
        <Image
          priority
          src={url}
          alt={file.name || "Media preview"}
          width={200}
          height={200}
          className="relative z-10 block object-cover h-auto border shadow-lg aspect-square rounded-xl"
        />
      )}
      <div className="absolute top-0 right-0 z-20 flex items-center justify-center w-full h-full p-1 text-white bg-black/50 rounded-xl">
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
        <div className="absolute left-0 right-0 z-20 text-center text-white bottom-2">
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(Media);
