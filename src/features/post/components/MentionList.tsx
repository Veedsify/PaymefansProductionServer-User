import Image from "next/image";
import React from "react";
import type { MentionUser } from "@/types/Components";

interface MentionListProps {
  mentions: MentionUser[];
  onRemove: (mentionId: string) => void;
}

const MentionList = React.memo(({ mentions, onRemove }: MentionListProps) => {
  if (mentions.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        Mentioned users:
      </p>
      <div className="flex flex-wrap gap-2">
        {mentions.map((mention) => (
          <div
            key={mention.id}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full gap-2 dark:bg-gray-800"
          >
            <Image
              src={mention.avatar || "/site/avatar.png"}
              alt={mention.name}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full"
            />
            <span>{mention.username}</span>
            <button
              onClick={() => onRemove(mention.id)}
              className="ml-1 text-gray-500 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

MentionList.displayName = "MentionList";

export default MentionList;
