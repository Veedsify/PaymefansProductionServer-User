"use client";
import { X } from "lucide-react";
import Image from "next/image";
import React from "react";
import type { UserMediaProps } from "@/types/Components";

type ExistingMediaPreviewProps = {
  media: UserMediaProps[];
  onRemove: (mediaId: string, mediaType: string) => void;
};

const ExistingMediaPreview = ({
  media,
  onRemove,
}: ExistingMediaPreviewProps) => {
  if (!media || media.length === 0) {
    return null;
  }

  const renderMedia = (item: UserMediaProps) => {
    const isVideo = item.media_type === "video";

    return (
      <div key={item.media_id} className="relative group">
        {isVideo ? (
          <video
            src={item.url}
            poster={item.poster || undefined}
            playsInline
            muted
            className="relative z-10 block object-cover w-32 h-32 border shadow-lg aspect-square rounded-xl"
          />
        ) : (
          <Image
            src={item.url}
            alt="Existing media"
            width={128}
            height={128}
            className="relative z-10 block object-cover w-32 h-32 border shadow-lg aspect-square rounded-xl"
          />
        )}

        {/* Remove button overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 bg-black/50 group-hover:opacity-100 transition-opacity duration-200 rounded-xl">
          <button
            onClick={() => onRemove(item.media_id, item.media_type)}
            className="absolute p-1 text-white bg-red-500 rounded-full hover:bg-red-600 right-1 top-1 transition-colors duration-200"
            aria-label="Remove media"
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Media type indicator */}
        {isVideo && (
          <div className="absolute z-20 px-2 py-1 text-xs text-white rounded top-2 left-2 bg-black/70">
            Video
          </div>
        )}

        {/* Blur indicator if media is blurred */}
        {item.blur === "true" && (
          <div className="absolute z-20 px-2 py-1 text-xs text-white rounded bottom-2 right-2 bg-yellow-500/80">
            Blurred
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-4">
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        Existing Media ({media.length})
      </p>
      <div className="flex flex-wrap gap-3">{media.map(renderMedia)}</div>
    </div>
  );
};

export default React.memo(ExistingMediaPreview);
