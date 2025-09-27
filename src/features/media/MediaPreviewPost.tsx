"use client";
import { X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef } from "react";
import type { UrlObject } from "url";
import { imageTypes, videoTypes } from "@/lib/FileTypes";

type MediaProps = {
  id: string;
  file: File;
  url: string;
};

const Media = React.memo(({ id, file, url }: MediaProps) => {
  const isVideo = useMemo(() => videoTypes.includes(file.type), [file.type]);

  return (
    <div className="relative">
      {isVideo ? (
        <video
          src={url}
          playsInline
          className="relative z-10 block object-cover h-auto aspect-square rounded-xl"
        />
      ) : (
        <Image
          priority
          src={url}
          alt={file.name || "Media preview"}
          width={200}
          height={200}
          className="relative z-10 block object-cover h-auto aspect-square rounded-xl"
        />
      )}
    </div>
  );
});
Media.displayName = "Media";

export default React.memo(Media);
