"use client";

import { Story } from "@/types/Story";
import StoryPreviewComponent from "./StatusPreviewComponent";
import { X } from "lucide-react";

const StatusModal = ({
  open,
  setStoriesOpen,
  stories: userStories,
}: {
  open: boolean;
  stories: Story[];
  setStoriesOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const stories = userStories.flatMap((story) =>
    story.StoryMedia.map((media) => ({
      ...media,
      media_url: media.media_url,
      story_id: story.story_id,
      user: story.user,
    }))
  );

  const closeStoryModal = async () => {
    setStoriesOpen(false);
  };

  if (!open) return null;

  return (
    <>
      <div
        className={`fixed bg-black/90 inset-0 z-[200] w-full h-dvh md:h-dvh p-3 flex items-center justify-center ${
          open
            ? "pointer-events-auto opacity-100 visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute z-20 p-2 text-white rounded-full cursor-pointer top-4 right-4 bg-black/60 hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
          onClick={closeStoryModal}
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>
        <StoryPreviewComponent
          className={"object-contain w-full h-full relative"}
          onAllStoriesEnd={closeStoryModal}
          stories={stories}
          key={stories.map((story) => story.media_url).join(",")}
        />
      </div>
    </>
  );
};

export default StatusModal;
