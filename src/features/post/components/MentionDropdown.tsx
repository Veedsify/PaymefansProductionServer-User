import React from "react";
import Image from "next/image";
import { MentionUser } from "@/types/Components";

interface MentionSuggestion extends MentionUser {
  highlighted?: boolean;
}

interface MentionDropdownProps {
  showMentions: boolean;
  mentionSuggestions: MentionSuggestion[];
  selectedMentionIndex: number;
  isMentionLoading: boolean;
  onMentionSelect: (user: MentionUser) => void;
  onMentionHover: (index: number) => void;
}

const MentionDropdown = React.memo(
  ({
    showMentions,
    mentionSuggestions,
    selectedMentionIndex,
    isMentionLoading,
    onMentionSelect,
    onMentionHover,
  }: MentionDropdownProps) => {
    if (!showMentions) return null;

    return (
      <div
        className="absolute z-50 w-full p-1 overflow-y-auto bg-white border border-gray-300 shadow-lg dark:bg-gray-800 dark:border-gray-700 rounded-md max-h-60"
        style={{ top: "100%", left: 0 }}
      >
        {isMentionLoading ? (
          <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : mentionSuggestions.length > 0 ? (
          mentionSuggestions.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-3 cursor-pointer rounded-md transition-colors ${
                index === selectedMentionIndex
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => onMentionSelect(user)}
              onMouseEnter={() => onMentionHover(index)}
            >
              <Image
                src={user.avatar || "/site/avatar.png"}
                alt={user.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                    {user.name}
                  </p>
                  {user.isVerified && (
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.username}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">
            No users found
          </div>
        )}
      </div>
    );
  }
);

MentionDropdown.displayName = "MentionDropdown";

export default MentionDropdown;
