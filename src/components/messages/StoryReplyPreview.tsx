"use client";
import React from "react";
import Image from "next/image";
import { LucidePlay } from "lucide-react";
import { useUserAuthContext } from "@/lib/UserUseContext";

type StoryReplyPreviewProps = {
  storyReply: {
    story_media_id: string;
    story_preview_url: string;
    story_type: string;
    story_owner_username: string;
    story_owner_profile_image: string;
  };
  onStoryClick?: () => void;
};

const StoryReplyPreview: React.FC<StoryReplyPreviewProps> = ({
  storyReply,
  onStoryClick,
}) => {
  const {user} = useUserAuthContext()
  return (
    <div
      onClick={onStoryClick}
      className="relative w-fit mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg   border-l-2 border-primary-dark-pink cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-2">
        {/* Story preview thumbnail */}
        <div className="rounded-lg overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 flex-shrink-0">
              <Image
                src={storyReply.story_owner_profile_image}
                alt={storyReply.story_owner_username}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">
              {storyReply.story_owner_username === user?.username
                ? "My"
                : storyReply.story_owner_username}{" "}
              Story
            </span>
          </div>
          <Image
            src={storyReply.story_preview_url}
            width={300}
            height={300}
            alt="Story preview"
            className="object-cover max-w-[150px] rounded-3xl"
          />
        </div>
      </div>
    </div>
  );
};

export default StoryReplyPreview;
