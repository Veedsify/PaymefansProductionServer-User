"use client";
import React from "react";
import Image from "next/image";
import { LucidePlay } from "lucide-react";
import { useAuthContext } from "@/contexts/UserUseContext";

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
  const { user } = useAuthContext();
  return (
    <div
      onClick={onStoryClick}
      className="relative p-2 mb-2 bg-gray-100 border-l-2 rounded-lg cursor-pointer w-fit dark:bg-gray-800  border-primary-dark-pink transition-colors"
    >
      <div className="flex items-center gap-2">
        {/* Story preview thumbnail */}
        <div className="flex-shrink-0 overflow-hidden rounded-lg">
          <div className="flex items-center mb-1 gap-2">
            <div className="flex-shrink-0 w-6 h-6 overflow-hidden bg-gray-300 rounded-full dark:bg-gray-600">
              <Image
                src={storyReply.story_owner_profile_image}
                alt={storyReply.story_owner_username}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <span className="text-xs font-medium text-gray-600 truncate dark:text-gray-300">
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
