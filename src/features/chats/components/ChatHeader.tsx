"use client";

import React from "react";
import { LucideArrowLeft, LucideGrip, LucideVerified } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FormatName from "@/lib/FormatName";
import ActiveProfileTag from "../../profile/ActiveProfileTag";

interface ChatHeaderProps {
  receiver: any;
  conversationId: string;
  onBack: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  receiver,
  conversationId,
  onBack,
}) => {
  const profilePicture = receiver?.profile_image || "/site/avatar.png";

  return (
    <div className="flex items-center px-5 py-4 border-b border-black/30 dark:border-gray-800 shrink-0">
      <button onClick={onBack} className="mr-6 sm:mr-10" aria-label="Back">
        <LucideArrowLeft size={24} className="text-gray-900 dark:text-white" />
      </button>

      <div className="flex items-center gap-3">
        <Image
          className="object-cover rounded-full"
          width={40}
          height={40}
          priority
          src={
            receiver && receiver.active_status
              ? profilePicture
              : "/site/avatar.png"
          }
          alt={`${receiver?.name || "User"}'s profile`}
        />
        <div>
          <Link
            href={receiver?.is_profile_hidden ? `#` : `/${receiver?.username}`}
            className="flex items-center text-sm font-semibold text-gray-900 gap-1 dark:text-white"
          >
            {FormatName(receiver?.name)}
            {receiver?.is_verified && (
              <LucideVerified className="ml-1 text-emerald-600" size={16} />
            )}
          </Link>
          <div className="flex items-center text-xs text-gray-500 gap-1 dark:text-gray-400">
            {receiver?.username && !receiver.is_profile_hidden && (
              <ActiveProfileTag userid={receiver.username} withText />
            )}
          </div>
        </div>
      </div>

      <div className="ml-auto">
        <Link
          href={`/chats/${conversationId}/settings`}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Settings"
        >
          <LucideGrip
            size={24}
            className="text-gray-900 cursor-pointer dark:text-white"
            aria-label="More options"
          />
        </Link>
      </div>
    </div>
  );
};

export default ChatHeader;
