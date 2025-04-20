"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { imageTypes, videoTypes } from "@/lib/filetypes";
import { socket } from "../sub_components/sub/socket";

type MediaProps = {
  id: string;
  file: File;
  progress: number;
  removeThisMedia: (id: string, type: string) => void;
};

const Media = ({ id, file, removeThisMedia, progress }: MediaProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (imageTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => setUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (videoTypes.includes(file.type)) {
      const blob = new Blob([file], { type: file.type });
      setUrl(URL.createObjectURL(blob));
    }
  }, [file]);

  useEffect(() => {
    setUploadProgress(progress);
  }, [progress]);

  return (
    <div className="relative">
      {file.type.includes("video") ? (
        <video
          src={url || "/site/loading.gif"}
          className="relative object-cover h-auto aspect-square shadow-lg border block rounded-xl z-10"
        />
      ) : (
        <Image
        unoptimized
          src={url || "/site/loading.gif"}
          alt="Media preview"
          width={200}
          height={200}
          className="relative object-cover h-auto aspect-square shadow-lg border block rounded-xl z-10"
        />
      )}
      <div className="absolute top-0 right-0 bg-black/50 text-white p-1 w-full h-full rounded-xl flex items-center justify-center z-20">
        <span
          onClick={() => removeThisMedia(id, file.type)}
          className="cursor-pointer"
        >
          <X size={20} />
        </span>
      </div>
      {uploadProgress >= 0 && (
        <div className="absolute bottom-2 left-0 right-0 text-white z-20 text-center">
          <span>{uploadProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(Media);
