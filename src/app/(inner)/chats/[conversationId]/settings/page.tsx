"use client";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/contexts/UserUseContext";
import ActiveProfileTag from "@/features/profile/ActiveProfileTag";
import axiosInstance from "@/utils/Axios";
import { blockUser, checkBlockStatus } from "@/utils/data/BlockUser";

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
  is_profile_hidden: boolean;
}

interface FreeMessageStatus {
  userEnabled: boolean;
  bothEnabled: boolean;
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
  const [freeMessageStatus, setFreeMessageStatus] = useState<FreeMessageStatus>(
    {
      userEnabled: false,
      bothEnabled: false,
    },
  );
  const [isUpdatingFreeMessage, setIsUpdatingFreeMessage] = useState(false);

  const params = useParams();
  const { user } = useAuthContext();
  const conversationId = params.conversationId as string;

  useEffect(() => {
    // Fetch conversation receiver data
    const fetchConversationReceiver = async () => {
      try {
        const response = await axiosInstance.get(
          `/conversations/receiver/${conversationId}`,
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
    if (conversationId) {
      fetchConversationReceiver();
    }
  }, [conversationId, user?.id]);

  // Fetch free message status
  const fetchFreeMessageStatus = async () => {
    try {
      const response = await axiosInstance.get(
        `/conversations/free-message-status/${conversationId}`,
        {
          withCredentials: true,
        },
      );

      const data = response.data;
      if (!data.error) {
        setFreeMessageStatus({
          userEnabled: data.userEnabled || false,
          bothEnabled: data.bothEnabled || false,
        });
      }
    } catch (error) {
      console.error("Error fetching free message status:", error);
    }
  };

  const handleToggleFreeMessage = async () => {
    if (isUpdatingFreeMessage) return;

    setIsUpdatingFreeMessage(true);
    try {
      const response = await axiosInstance.post(
        `/conversations/toggle-free-messages`,
        {
          conversationId,
          enable: !freeMessageStatus.userEnabled,
        },
        {
          withCredentials: true,
        },
      );

      const data = response.data;
      if (!data.error) {
        // Refresh the status
        await fetchFreeMessageStatus();
        toast.success(
          freeMessageStatus.userEnabled
            ? "Free messages disabled for this conversation"
            : "Free messages enabled for this conversation",
        );
      } else {
        toast.error(data.message || "Failed to update free message setting");
      }
    } catch (error) {
      console.error("Error toggling free message:", error);
      toast.error("Failed to update free message setting");
    } finally {
      setIsUpdatingFreeMessage(false);
    }
  };

  // Load free message status on component mount
  React.useEffect(() => {
    if (conversationId && !loading) {
      fetchFreeMessageStatus();
    }
  }, [conversationId, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
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
        className="w-full overflow-hidden bg-white dark:bg-gray-950"
      >
        {/* Profile Section */}
        <div className="flex items-center p-6 border-b border-gray-200 gap-4 dark:border-gray-800">
          <div className="relative">
            {conversationReceiver.profile_image ? (
              <Image
                src={conversationReceiver.profile_image}
                alt={conversationReceiver.name}
                width={64}
                height={64}
                className="object-cover w-16 h-16 rounded-full shadow-md"
              />
            ) : (
              <div className="flex items-center justify-center w-16 h-16 text-xl font-bold text-white rounded-full shadow-md bg-gradient-to-tr from-blue-400 to-indigo-500 dark:from-blue-700 dark:to-indigo-900">
                <span>{getInitials(conversationReceiver.name)}</span>
              </div>
            )}
            <ActiveProfileTag userid={conversationReceiver.username} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {conversationReceiver.name}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {conversationReceiver.username}
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="p-4">
          {/* <div className="mb-4">
            <h3 className="px-2 mb-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-400">
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
          </div> */}

          <div className="mb-4">
            <h3 className="px-2 mb-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-400">
              Chat Options
            </h3>
            <SettingsAction
              icon={
                <div
                  className={`p-1 rounded-full ${
                    freeMessageStatus.userEnabled
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      freeMessageStatus.userEnabled
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
              }
              label="Free messaging"
              description={
                freeMessageStatus.bothEnabled
                  ? "✅ Free messages enabled (both users agree)"
                  : freeMessageStatus.userEnabled
                    ? "⏳ You enabled free messages (waiting for other user)"
                    : "💰 Enable free messages for this conversation"
              }
              onClick={handleToggleFreeMessage}
              isLoading={isUpdatingFreeMessage}
            />
            {/* <SettingsAction
              icon={<Star className="text-amber-500 dark:text-amber-400" />}
              label="Starred messages"
              description="View messages you've starred"
            />
            <SettingsAction
              icon={<Search className="text-gray-700 dark:text-gray-200" />}
              label="Search in conversation"
              description="Find specific messages or content"
              onClick={() => setIsSearching(true)}
            /> */}
          </div>

          <div>
            <h3 className="px-2 mb-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-400">
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
            {/* <SettingsAction
              icon={<Trash2 className="text-red-600 dark:text-red-400" />}
              label="Delete conversation"
              description="Permanently delete all messages"
              danger
              onClick={() => setIsDeleting(true)}
            /> */}
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
  isLoading?: boolean;
};

const SettingsAction: React.FC<SettingsActionProps> = ({
  icon,
  label,
  description,
  danger,
  badge,
  onClick,
  isLoading = false,
}) => (
  <motion.button
    whileHover={{ x: 4 }}
    onClick={onClick}
    disabled={isLoading}
    className={`flex items-center w-full px-4 py-3 rounded-xl transition text-left
          ${
            danger
              ? "hover:bg-red-50 dark:hover:bg-red-900"
              : "hover:bg-gray-50 dark:hover:bg-gray-800"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
          group
  `}
  >
    <div className="mr-4 text-2xl group-hover:scale-110 transition-transform">
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      ) : (
        icon
      )}
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
      <div className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
        {badge}
      </div>
    )}
    <ChevronRight className="w-5 h-5 ml-1 text-gray-400 dark:text-gray-500" />
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
        className="w-full max-w-sm p-6 mx-4 bg-white dark:bg-gray-900 rounded-xl"
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {isCurrentlyBlocked ? "Unblock this user?" : "Block this user?"}
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isCurrentlyBlocked
            ? "You will start receiving messages from this user again."
            : "You won't receive messages or calls from this user anymore. They won't be notified that you've blocked them."}
        </p>
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
      className="w-full max-w-sm p-6 mx-4 bg-white dark:bg-gray-900 rounded-xl"
    >
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900">
        <AlertTriangle className="text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">
        Delete Conversation
      </h3>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
        This will permanently delete all messages in this conversation. This
        action cannot be undone.
      </p>
      <div className="flex justify-center mt-6 gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 font-medium text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
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
      className="w-full max-w-xl p-6 bg-white dark:bg-gray-800 lg:rounded-xl lg:mx-4"
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
        className="w-full p-2 mt-4 border border-gray-300 rounded-lg dark:text-white"
      />
    </motion.div>
  </div>
);

export default ConversationSettingsPage;
