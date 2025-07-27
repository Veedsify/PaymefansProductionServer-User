"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BellOff,
  Images,
  Star,
  Search,
  Ban,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { blockUser, checkBlockStatus } from "@/utils/data/BlockUser";
import axios from "axios";
import { toast } from "react-hot-toast";
import ActiveProfileTag from "@/components/sub_components/sub/ActiveProfileTag";

interface ConversationReceiver {
  id: number;
  user_id: string;
  name: string;
  username: string;
  profile_image: string | null;
  active_status: boolean;
  is_verified: boolean;
  Settings: any;
  flags: string;
  isProfileHidden: boolean;
}

const ConversationSettingsPage = () => {
  const [isBlocking, setIsBlocking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversationReceiver, setConversationReceiver] =
    useState<ConversationReceiver | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const { user } = useUserAuthContext();
  const conversationId = params.conversationId as string;

  // Fetch conversation receiver data
  const fetchConversationReceiver = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/conversations/receiver/${conversationId}`,
        {
          withCredentials: true,
        },
      );

      const data = response.data;

      if (!data.error && data.receiver) {
        setConversationReceiver(data.receiver);

        // Check if user is already blocked
        if (data.receiver.id && user?.id !== data.receiver.id) {
          try {
            const blockResult = await checkBlockStatus(data.receiver.id);
            if (blockResult.status && !blockResult.error) {
              setIsUserBlocked(blockResult.isBlocked);
            }
          } catch (error) {
            console.error("Error checking block status:", error);
          }
        }
      } else {
        setError(data.message || "Failed to fetch conversation data");
      }
    } catch (error) {
      console.error("Error fetching conversation receiver:", error);
      setError("Failed to load conversation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchConversationReceiver();
    }
  }, [conversationId, user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Loading conversation...
        </p>
      </div>
    );
  }

  if (error || !conversationReceiver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <p className="text-red-500 dark:text-red-400">
          {error || "Conversation not found"}
        </p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center min-h-dvh">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-white overflow-hidden dark:bg-gray-950"
      >
        {/* Profile Section */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            {conversationReceiver.profile_image ? (
              <Image
                src={conversationReceiver.profile_image}
                alt={conversationReceiver.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center shadow-md text-xl font-bold text-white dark:from-blue-700 dark:to-indigo-900">
                <span>{getInitials(conversationReceiver.name)}</span>
              </div>
            )}
            <ActiveProfileTag userid={conversationReceiver.username} />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              {conversationReceiver.name}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {conversationReceiver.username}
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm uppercase text-gray-500 font-medium px-2 mb-2 dark:text-gray-400">
              Notifications & Media
            </h3>
            <SettingsAction
              icon={<BellOff className="text-blue-600 dark:text-blue-400" />}
              label="Mute notifications"
              description="Turn off notifications for this chat"
            />
            <SettingsAction
              icon={<Images className="text-indigo-600 dark:text-indigo-400" />}
              label="Media & documents"
              description="View shared media, links and files"
              badge="23"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-sm uppercase text-gray-500 font-medium px-2 mb-2 dark:text-gray-400">
              Chat Options
            </h3>
            <SettingsAction
              icon={<Star className="text-amber-500 dark:text-amber-400" />}
              label="Starred messages"
              description="View messages you've starred"
            />
            <SettingsAction
              icon={<Search className="text-gray-700 dark:text-gray-200" />}
              label="Search in conversation"
              description="Find specific messages or content"
              onClick={() => setIsSearching(true)}
            />
          </div>

          <div>
            <h3 className="text-sm uppercase text-gray-500 font-medium px-2 mb-2 dark:text-gray-400">
              Privacy & Support
            </h3>
            <SettingsAction
              icon={<Ban className="text-red-500 dark:text-red-400" />}
              label={isUserBlocked ? "Unblock user" : "Block user"}
              description={
                isUserBlocked
                  ? "Allow messages from this user"
                  : "You won't receive messages from this user"
              }
              danger={!isUserBlocked}
              onClick={() => setIsBlocking(true)}
            />
            <SettingsAction
              icon={<Trash2 className="text-red-600 dark:text-red-400" />}
              label="Delete conversation"
              description="Permanently delete all messages"
              danger
              onClick={() => setIsDeleting(true)}
            />
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modals */}
      {isBlocking && (
        <BlockUserModal
          onClose={() => setIsBlocking(false)}
          isCurrentlyBlocked={isUserBlocked}
          targetUserId={conversationReceiver.id}
          onBlockSuccess={(blocked) => setIsUserBlocked(blocked)}
        />
      )}
      {isDeleting && <DeleteChatModal onClose={() => setIsDeleting(false)} />}
      {isSearching && <SearchModal onClose={() => setIsSearching(false)} />}
    </div>
  );
};

type SettingsActionProps = {
  icon: React.ReactNode;
  label: string;
  description?: string;
  danger?: boolean;
  badge?: string;
  onClick?: () => void;
};

const SettingsAction: React.FC<SettingsActionProps> = ({
  icon,
  label,
  description,
  danger,
  badge,
  onClick,
}) => (
  <motion.button
    whileHover={{ x: 4 }}
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-xl transition text-left
          ${
            danger
              ? "hover:bg-red-50 dark:hover:bg-red-900"
              : "hover:bg-gray-50 dark:hover:bg-gray-800"
          }
          group
  `}
  >
    <div className="text-2xl mr-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1">
      <div
        className={`font-medium ${
          danger
            ? "text-red-600 dark:text-red-400"
            : "text-gray-800 dark:text-gray-200"
        }`}
      >
        {label}
      </div>
      {description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </div>
      )}
    </div>
    {badge && (
      <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-medium">
        {badge}
      </div>
    )}
    <ChevronRight className="text-gray-400 dark:text-gray-500 ml-1 h-5 w-5" />
  </motion.button>
);

const BlockUserModal: React.FC<{
  onClose: () => void;
  isCurrentlyBlocked: boolean;
  targetUserId: number | null;
  onBlockSuccess: (blocked: boolean) => void;
}> = ({ onClose, isCurrentlyBlocked, targetUserId, onBlockSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBlockAction = async () => {
    if (!targetUserId) {
      toast.error("Invalid user ID");
      return;
    }

    setIsProcessing(true);
    try {
      let result;
      if (isCurrentlyBlocked) {
        // Unblock user
        const { unblockUser } = await import("@/utils/data/BlockUser");
        result = await unblockUser(targetUserId);
      } else {
        // Block user
        result = await blockUser(targetUserId);
      }

      if (result.status && !result.error) {
        toast.success(result.message);
        onBlockSuccess(!isCurrentlyBlocked);
        onClose();
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error in block operation:", error);
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4"
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {isCurrentlyBlocked ? "Unblock this user?" : "Block this user?"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isCurrentlyBlocked
            ? "You will start receiving messages from this user again."
            : "You won't receive messages or calls from this user anymore. They won't be notified that you've blocked them."}
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleBlockAction}
            disabled={isProcessing}
            className={`px-4 py-2 text-white font-medium rounded-lg ${
              isCurrentlyBlocked
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } disabled:opacity-50`}
          >
            {isProcessing
              ? "Processing..."
              : isCurrentlyBlocked
                ? "Unblock User"
                : "Block User"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DeleteChatModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mx-auto mb-4">
        <AlertTriangle className="text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
        Delete Conversation
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">
        This will permanently delete all messages in this conversation. This
        action cannot be undone.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700">
          Delete
        </button>
      </div>
    </motion.div>
  </div>
);

const SearchModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 z-[200] flex lg:py-4 lg:items-center lg:justify-center"
    onClick={onClose}
  >
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-gray-800 lg:rounded-xl p-6 max-w-xl w-full lg:mx-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Search
        </h3>
        <button onClick={onClose} className="text-gray-500">
          <Trash2 className="dark:text-white" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Search in conversation"
        className="w-full border dark:text-white border-gray-300 rounded-lg p-2 mt-4"
      />
    </motion.div>
  </div>
);

export default ConversationSettingsPage;
