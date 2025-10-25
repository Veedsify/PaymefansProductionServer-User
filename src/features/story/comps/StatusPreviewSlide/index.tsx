"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { Story } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import HlsViewer from "@/features/media/HlsViewer";

// Dynamic imports for better code splitting
const CaptionOverlay = dynamic(() => import("./CaptionOverlay"), {
  ssr: false,
});

const StatusViewBlock = dynamic(() => import("./StatusViewBlock"), {
  ssr: false,
});

const TaggedUsersButton = dynamic(() => import("./TaggedUsersButton"), {
  ssr: false,
});

const StoryReplyInput = dynamic(() => import("./StoryReplyInput"), {
  ssr: false,
});

type StatusPreviewSlideProps = {
  story: Story;
  index: number;
  activeIndex: number;
  moveToNextSlide: () => void;
};

const StatusPreviewSlide = ({
  story,
  index,
  activeIndex,
}: StatusPreviewSlideProps) => {
  const refCounter = useRef(0);
  const { user } = useAuthContext();
  const canShowViewBlock = story.user.id === user?.id;

  useEffect(() => {
    async function storyViewed() {
      if (refCounter.current > 1) {
        return;
      }
      await axiosInstance.post("/story/view", {
        storyMediaId: story.media_id,
      });
      refCounter.current++;
    }
    storyViewed();
    return () => {
      refCounter.current = 0;
    };
  }, [story.media_id, refCounter]);

  return (
    <div className="relative flex items-center justify-center w-full h-full max-w-full max-h-full">
      <div className="relative flex items-center justify-center w-full h-full">
        {story.media_type === "image" ? (
          <Image
            src={story.media_url}
            alt={story?.caption || "Story image"}
            fill
            style={{ objectFit: "contain" }}
            priority={index === activeIndex}
            loading={index === activeIndex ? "eager" : "lazy"}
            className="z-30 bg-black rounded-lg shadow-lg"
            onError={() => {
              console.error("Image failed to load:", story.media_url);
            }}
          />
        ) : story.media_type === "video" ? (
          <HlsViewer
            className="w-auto h-full object-contain bg-black rounded-lg shadow-lg"
            streamUrl={story.media_url}
            muted={false}
            isOpen={true}
            showControls={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white">
            <p>Unsupported media type</p>
          </div>
        )}

        {/* Dynamically loaded components */}
        {canShowViewBlock && <StatusViewBlock story={story} />}
        <CaptionOverlay story={story} />
        <TaggedUsersButton story={story} />
        <StoryReplyInput story={story} />
      </div>
    </div>
  );
};

export default StatusPreviewSlide;
