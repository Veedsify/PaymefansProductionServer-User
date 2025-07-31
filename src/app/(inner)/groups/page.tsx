"use client";

import {
  LucideSearch,
  LucideUsers,
  LucideVerified,
  LucideLoader2,
  LucidePlus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/lib/UserUseContext";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  fetchUserGroups,
  searchGroups,
  joinGroup as joinGroupAPI,
  GroupData,
  GroupsResponse,
} from "@/utils/data/GroupAPI";

const Groups = () => {
  const user = useUserStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"my-groups" | "available">(
    "my-groups",
  );

  // Fetch user's groups
  const {
    data: groupsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<GroupsResponse>({
    queryKey: ["groups", user?.id],
    queryFn: fetchUserGroups,
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch available groups for search
  const { data: availableGroupsData, isLoading: isSearchLoading } = useQuery({
    queryKey: ["available-groups", searchQuery],
    queryFn: () => searchGroups(searchQuery, 20),
    enabled: !!user && activeTab === "available",
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check if user is properly authenticated
  if (!user && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Authentication Required
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mb-4">
          Please log in to view your groups.
        </p>
      </div>
    );
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroupAPI(groupId);
      toast.success("Join request sent successfully!");
      refetch();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send join request";
      toast.error(message);
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60),
      );

      if (diffInHours < 1) {
        return "now";
      } else if (diffInHours < 24) {
        return `${diffInHours}h`;
      } else {
        return `${Math.floor(diffInHours / 24)}d`;
      }
    } catch {
      return "";
    }
  };

  const userGroups: GroupData[] = groupsData?.data?.userGroups || [];
  const availableGroups: GroupData[] = availableGroupsData?.data?.groups || [];
  const userGroupsCount = groupsData?.data?.userGroupsCount || 0;

  return (
    <div className="md:py-5 md:px-8 p-3 h-full">
      {/* Header */}
      <div className="flex items-center mb-7">
        <span className="font-bold text-xl flex-shrink-0 dark:text-white">
          Groups
        </span>
        <div className="flex items-center justify-center w-8 h-8 aspect-square flex-shrink-0 ml-auto text-white md:py-3 md:px-3 py-1 px-1 bg-primary-text-dark-pink rounded-full font-bold">
          {userGroupsCount}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("my-groups")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "my-groups"
              ? "bg-primary-dark-pink text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          My Groups ({userGroupsCount})
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "available"
              ? "bg-primary-dark-pink text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Find Groups
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex align-baseline justify-between border dark:text-white border-gray-400 rounded-md p-4 mb-7 w-full">
        <input
          type="text"
          placeholder={
            activeTab === "my-groups"
              ? "Search My Groups"
              : "Search Available Groups"
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm outline-none border-none dark:bg-gray-950 w-full"
        />
        <LucideSearch className="block text-center" />
      </div>

      {/* Loading States */}
      {(isLoading || isSearchLoading) && (
        <div className="flex items-center justify-center py-8">
          <LucideLoader2 className="animate-spin w-8 h-8 text-primary-dark-pink" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400 mb-2">
            Failed to load groups. Please try again.
          </p>
          {error && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Error: {error.message || "Unknown error occurred"}
            </p>
          )}
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-primary-dark-pink text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Groups List */}
      {!isLoading && !isSearchLoading && (
        <div className="space-y-4">
          {activeTab === "my-groups" && (
            <>
              {userGroups.length === 0 ? (
                <div className="text-center py-12">
                  <LucideUsers
                    size={48}
                    className="mx-auto mb-4 text-gray-400"
                  />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Groups Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    You haven&apos;t joined any groups yet. Find and join groups
                    to start chatting!
                  </p>
                  <button
                    onClick={() => setActiveTab("available")}
                    className="px-6 py-3 bg-primary-dark-pink text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Find Groups
                  </button>
                </div>
              ) : (
                userGroups
                  .filter(
                    (group) =>
                      !searchQuery ||
                      group.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  )
                  .map((group) => (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="block bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Group Avatar */}
                        <div className="relative">
                          <Image
                            src={group.groupIcon || "/site/avatar.png"}
                            alt={group.name}
                            width={56}
                            height={56}
                            className="rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/site/avatar.png";
                            }}
                          />
                          {group.isActive && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          )}
                        </div>

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {group.name}
                            </h3>
                            {group.admin.is_verified && (
                              <LucideVerified
                                size={16}
                                className="text-blue-500 flex-shrink-0"
                              />
                            )}
                            {group.userRole === "ADMIN" && (
                              <span className="text-xs bg-primary-dark-pink text-white px-2 py-1 rounded-full">
                                Admin
                              </span>
                            )}
                            {group.userRole === "MODERATOR" && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                Mod
                              </span>
                            )}
                          </div>

                          {/* Last Message */}
                          {group.lastMessage ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              <span className="font-medium">
                                {group.lastMessage.senderUsername}:
                              </span>{" "}
                              {group.lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              No messages yet
                            </p>
                          )}

                          {/* Group Stats */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <LucideUsers size={12} />
                              {group.membersCount} members
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                              {group.groupType.toLowerCase()}
                            </span>
                          </div>
                        </div>

                        {/* Time & Unread */}
                        <div className="text-right">
                          {group.lastMessage && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatLastMessageTime(
                                group.lastMessage.timestamp,
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
              )}
            </>
          )}

          {activeTab === "available" && (
            <>
              {availableGroups.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No groups found matching &apos;{searchQuery}&apos;
                  </p>
                </div>
              ) : availableGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Start typing to search for groups
                  </p>
                </div>
              ) : (
                availableGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      {/* Group Avatar */}
                      <Image
                        src={group.groupIcon || "/site/avatar.png"}
                        alt={group.name}
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/site/avatar.png";
                        }}
                      />

                      {/* Group Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {group.name}
                          </h3>
                          {group.admin.is_verified && (
                            <LucideVerified
                              size={16}
                              className="text-blue-500"
                            />
                          )}
                        </div>

                        {group.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {group.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <LucideUsers size={12} />
                            {group.membersCount}/{group.maxMembers} members
                          </span>
                          <span>•</span>
                          <span className="capitalize">
                            {group.groupType.toLowerCase()}
                          </span>
                          <span>•</span>
                          <span>Admin: {group.admin.username}</span>
                        </div>
                      </div>

                      {/* Join Button */}
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="px-4 py-2 bg-primary-dark-pink text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Groups;
