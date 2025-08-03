"use client";
import React, { useState, useEffect } from "react";
import { Ban, Shield } from "lucide-react";
import {
  blockUser,
  unblockUser,
  checkBlockStatus,
} from "@/utils/data/BlockUser";
import toast from "react-hot-toast";

interface BlockUserButtonProps {
  userId: number;
  userName: string;
  className?: string;
}

const BlockUserButton: React.FC<BlockUserButtonProps> = ({
  userId,
  userName,
  className = "",
}) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserBlockStatus = async () => {
      setIsChecking(true);
      try {
        const result = await checkBlockStatus(userId);
        if (result.status && !result.error) {
          setIsBlocked(result.isBlocked);
        }
      } catch (error) {
        console.error("Error checking block status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    if (userId) {
      checkUserBlockStatus();
    }
  }, [userId]);

  const handleBlockToggle = async () => {
    if (isLoading) return;

    const confirmMessage = isBlocked
      ? `Are you sure you want to unblock ${userName}? You will start receiving messages from them again.`
      : `Are you sure you want to block ${userName}? You won't receive messages or see content from them anymore.`;

    const confirmed = await swal({
      title: "Block User",
      text: confirmMessage,
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      let result;
      if (isBlocked) {
        result = await unblockUser(userId);
      } else {
        result = await blockUser(userId);
      }

      if (result.status && !result.error) {
        setIsBlocked(!isBlocked);
        toast.success(result.message);
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error toggling block status:", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <button
        disabled
        className={`flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-medium opacity-50 ${className}`}
      >
        <div className="w-4 h-4 mr-2 border-2 border-gray-300 rounded-full border-t-transparent animate-spin" />
        ...
      </button>
    );
  }

  return (
    <button
      onClick={handleBlockToggle}
      disabled={isLoading}
      className={`flex items-center justify-center cursor-pointer px-3 py-1 rounded-md border text-sm font-medium transition-colors w-full ${
        isBlocked
          ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30"
          : "border-red-300 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30"
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isBlocked ? `Unblock ${userName}` : `Block ${userName}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 mr-2 border-2 rounded-full border-current border-t-transparent animate-spin" />
      ) : isBlocked ? (
        <Shield className="w-4 h-4 mr-2" />
      ) : (
        <Ban className="w-4 h-4 mr-2" />
      )}
      {isLoading ? "..." : isBlocked ? "Unblock" : "Block"}
    </button>
  );
};

export default BlockUserButton;
