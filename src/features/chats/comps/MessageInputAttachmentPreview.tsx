"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";

type MessageInputAttachmentPreviewProps = {
  type: "image" | "video";
  previewUrl: string;
  posterUrl?: string;
};

const MessageInputAttachmentPreview = ({
  type,
  previewUrl,
  posterUrl,
}: MessageInputAttachmentPreviewProps) => {
  const previewUrlRef = useRef<string>(previewUrl);
  const posterUrlRef = useRef<string | undefined>(posterUrl);

  // Update refs when URLs change
  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    posterUrlRef.current = posterUrl;
  }, [posterUrl]);

  return (
    <>
      {type === "video" ? (
        <video
          src={previewUrl}
          muted
          className="object-cover w-full cursor-pointer aspect-square rounded-xl"
          poster={posterUrl}
        />
      ) : (
        <Image
          width={400}
          height={400}
          priority
          src={previewUrl}
          alt=""
          className="object-cover w-full aspect-square rounded-xl"
        />
      )}
    </>
  );
};

export default MessageInputAttachmentPreview;
