"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ban, Loader2, User, Calendar, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getBlockedUsers, unblockUser } from "@/utils/data/BlockUser";
import toast from "react-hot-toast";

interface BlockedUser {
  user: {
    id: number;
    username: string;
    name: string;
    fullname: string;
    profile_image: string | null;
  } | null;
  blockId: string;
  created_at: string;
}

const BlockedUsersPage = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingUser, setUnblockingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async (page = 1, reset = true) => {
    setLoading(true);
    try {
      const min = (page - 1) * ITEMS_PER_PAGE;
      const max = ITEMS_PER_PAGE;

      const result = await getBlockedUsers(min, max);

      if (result.status && !result.error) {
        if (reset) {
          setBlockedUsers(result.blockedUsers);
        } else {
          setBlockedUsers((prev) => [...prev, ...result.blockedUsers]);
        }
        setHasMore(result.blockedUsers.length === ITEMS_PER_PAGE);
        setCurrentPage(page);
      } else {
        console.error("Failed to fetch blocked users:", result.message);
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId: number, blockId: string) => {
    if (!userId) return;

    setUnblockingUser(blockId);
    try {
      const result = await unblockUser(userId);

      if (result.status && !result.error) {
        // Remove the user from the blocked list
        setBlockedUsers((prev) =>
          prev.filter((item) => item.blockId !== blockId),
        );
        toast.success("User unblocked successfully");
      } else {
        toast.error(result.message || "Failed to unblock user");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("An error occurred while unblocking the user");
    } finally {
      setUnblockingUser(null);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBlockedUsers(currentPage + 1, false);
    }
  };

  const filteredUsers = blockedUsers.filter((item) => {
    if (!searchTerm) return true;
    const user = item.user;
    if (!user) return false;

    return (
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Blocked Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users you have blocked. You can unblock them to allow
            interactions again.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search blocked users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && blockedUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Loading blocked users...
            </span>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Ban className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? "No matching users found" : "No blocked users"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms"
                : "You haven't blocked any users yet"}
            </p>
          </motion.div>
        )}

        {/* Blocked Users List */}
        {filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredUsers.map((item, index) => {
              const user = item.user;
              if (!user) return null;

              return (
                <motion.div
                  key={item.blockId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Profile Image */}
                      <div className="relative">
                        {user.profile_image ? (
                          <Image
                            src={user.profile_image}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/${user.username}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {user.name}
                          </Link>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.username}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          Blocked on {formatDate(item.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Unblock Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUnblockUser(user.id, item.blockId)}
                      disabled={unblockingUser === item.blockId}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        unblockingUser === item.blockId
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                      }`}
                    >
                      {unblockingUser === item.blockId ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Unblocking...
                        </div>
                      ) : (
                        "Unblock"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && filteredUsers.length > 0 && !searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Load More
            </button>
          </motion.div>
        )}

        {/* Results Count */}
        {filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            Showing {filteredUsers.length} blocked user
            {filteredUsers.length !== 1 ? "s" : ""}
            {searchTerm && ` matching "${searchTerm}"`}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsersPage;
