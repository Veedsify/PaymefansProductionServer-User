"use client";
import React from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { UserMediaProps } from "@/types/Components";

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
            className="relative object-cover h-32 w-32 aspect-square shadow-lg border block rounded-xl z-10"
          />
        ) : (
          <Image
            src={item.url}
            alt="Existing media"
            width={128}
            height={128}
            className="relative object-cover h-32 w-32 aspect-square shadow-lg border block rounded-xl z-10"
          />
        )}

        {/* Remove button overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center z-20">
          <button
            onClick={() => onRemove(item.media_id, item.media_type)}
            className="bg-red-500 hover:bg-red-600 text-white p-1 absolute right-1 top-1 rounded-full transition-colors duration-200"
            aria-label="Remove media"
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Media type indicator */}
        {isVideo && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-20">
            Video
          </div>
        )}

        {/* Blur indicator if media is blurred */}
        {item.blur === "true" && (
          <div className="absolute bottom-2 right-2 bg-yellow-500/80 text-white px-2 py-1 rounded text-xs z-20">
            Blurred
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Existing Media ({media.length})
      </p>
      <div className="flex flex-wrap gap-3">{media.map(renderMedia)}</div>
    </div>
  );
};

export default React.memo(ExistingMediaPreview);
