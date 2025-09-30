"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideEyeOff,
  LucideGlobe,
  LucideImage,
  LucideLoader,
  LucideLock,
  LucideSettings,
  LucideShield,
  LucideUsers,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  type ApiResponse,
  type Group,
  GroupType,
} from "@/features/group/types/group";
import axiosInstance from "@/utils/Axios";
import { fetchGroupMembers } from "@/utils/data/GroupAPI";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

const GroupSettingsPage = () => {
  const params = useParams();
  const groupId = params.groupid as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  const groupTypes = [
    {
      value: GroupType.PUBLIC,
      label: "Public",
      description: "Anyone can join and see the group",
      icon: LucideGlobe,
      color: "text-green-500",
    },
    {
      value: GroupType.PRIVATE,
      label: "Private",
      description: "Only members can see the group, requests required to join",
      icon: LucideLock,
      color: "text-yellow-500",
    },
    {
      value: GroupType.SECRET,
      label: "Secret",
      description: "Invitation only, completely hidden from search",
      icon: LucideEyeOff,
      color: "text-red-500",
    },
  ];

  const tabs = [
    { id: "general", label: "General", icon: LucideSettings },
    { id: "privacy", label: "Privacy", icon: LucideShield },
    { id: "members", label: "Members", icon: LucideUsers },
  ];

  // Fetch group data
  const fetchGroup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/groups/${groupId}`);

      const result: ApiResponse<Group> = response.data;

      if (result.success && result.data) {
        const groupData = result.data;
        setGroup(groupData);
      } else {
        throw new Error(result.message || "Failed to fetch group");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching group:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
    }
  }, [groupId, fetchGroup]);

  if (error && !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Error Loading Group
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchGroup}
            className="px-4 py-2 text-white bg-primary-dark-pink rounded-md hover:bg-primary-text-dark-pink transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-black">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center max-w-4xl mx-auto">
          <Link href={`/groups/${groupId}`} className="mr-4">
            <LucideChevronLeft
              size={24}
              className="text-gray-600 cursor-pointer dark:text-gray-400 hover:text-primary-dark-pink transition-colors"
            />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                className="object-cover rounded-full aspect-square"
                width={40}
                height={40}
                priority
                src={
                  group?.groupIcon ||
                  "https://images.pexels.com/photos/30612850/pexels-photo-30612850/free-photo-of-outdoor-portrait-of-a-man-relaxing-on-swing-in-abuja.jpeg?auto=compress&cs=tinysrgb&w=600"
                }
                alt={group?.name || "Group"}
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {group?.name}
              </h1>
              <div className="flex items-center text-sm text-gray-500 gap-1 dark:text-gray-400">
                <LucideUsers className="w-3 h-3" />
                <span>{group?._count.members} members</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl px-4 py-4 mx-auto">
          <div className="p-4 border border-red-100 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl px-4 py-6 mx-auto">
        {/* Mobile Tab Navigation */}
        <div className="mb-6 lg:hidden">
          <div className="overflow-hidden bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary-dark-pink/5 text-primary-dark-pink"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  <LucideChevronRight className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:w-64">
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary-dark-pink/5 text-primary-dark-pink border-r-2 border-r-primary-dark-pink"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "general" && (
              <div className="space-y-4">
                {/* Group Icon Section */}
                <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Group Photo
                    </h3>
                  </div>
                  <div className="px-6 py-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="flex items-center justify-center w-24 h-24 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700">
                          {group?.groupIcon ? (
                            <Image
                              width={96}
                              height={96}
                              src={group.groupIcon}
                              alt="Group icon"
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <LucideImage className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Name */}
                <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Group Name
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-lg text-gray-900 dark:text-white">
                      {group?.name}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Description
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white">
                      {group?.description || "No description provided"}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Creator Group Chat Rules and Policy
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white">
                      By participating in this group chat, you agree to abide by
                      these rules and policies. Let&apos;s work together to
                      create a positive and supportive community for all content
                      creators!
                    </p>
                    <div className="mt-4 space-y-2">
                      <strong>Benefits:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                          Stay updated on group news, announcements, and
                          resources.
                        </li>
                        <li>
                          Share knowledge, experiences, and best practices.
                        </li>
                        <li>
                          Connect with fellow content creators from around the
                          world.
                        </li>
                      </ul>
                    </div>
                    <div className="mt-4 space-y-2">
                      <strong>Consequences:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                          Failure to comply with these rules may result in
                          removal from the group chat.
                        </li>
                        <li>
                          Repeated offenses may lead to a permanent ban from the
                          group.
                        </li>
                      </ul>
                    </div>
                    <div className="mt-4 space-y-2">
                      <strong>Group-Relevant Content:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>
                          Keep conversations focused on topics relevant to
                          content creation and the group&apos;s purpose.
                        </li>
                        <li>
                          <strong>No External Links:</strong> No external links
                          are allowed in the group chat except for links
                          specifically related to Paymefans itself (e.g. Profile
                          links). Posting external websites, social media, or
                          other platform links to the group is not permitted.
                        </li>
                        <li>
                          <strong>Respectful Communication:</strong> Treat
                          others with kindness and respect, even if you
                          disagree. No insults, harassment, or discriminatory
                          language will be tolerated.
                        </li>
                      </ol>
                    </div>
                    <div className="mt-4">
                      <strong>Rules:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>
                          This group chat is designed to facilitate
                          communication and collaboration among content creators
                          from around the world.
                        </li>
                        <li>
                          Our goal is to provide a supportive and respectful
                          community where creators can share ideas, ask
                          questions, and learn from each other.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-4">
                {/* Group Type */}
                <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Group Type
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    {groupTypes.map((type) => {
                      if (group?.groupType === type.value) {
                        const IconComponent = type.icon;
                        return (
                          <div
                            key={type.value}
                            className="flex items-start p-4 border border-primary-dark-pink/40 rounded-lg gap-4 bg-primary-dark-pink/5"
                          >
                            <IconComponent
                              className={`h-5 w-5 mt-0.5 ${type.color}`}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {type.label}
                              </h4>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Permission Settings */}
                <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Member Permissions
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    <div className="flex items-center justify-between px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Allow member invites
                        </span>
                        <p className="mt-1 text-sm text-gray-500">
                          Members can invite others to join the group
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          group?.settings?.allowMemberInvites
                            ? "bg-primary-dark-pink border-primary-dark-pink text-white"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        {group?.settings?.allowMemberInvites && "✓"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Allow media sharing
                        </span>
                        <p className="mt-1 text-sm text-gray-500">
                          Members can share images and videos in messages
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          group?.settings?.allowMediaSharing
                            ? "bg-primary-dark-pink border-primary-dark-pink text-white"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        {group?.settings?.allowMediaSharing && "✓"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Allow file sharing
                        </span>
                        <p className="mt-1 text-sm text-gray-500">
                          Members can share documents and other files
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          group?.settings?.allowFileSharing
                            ? "bg-primary-dark-pink border-primary-dark-pink text-white"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        {group?.settings?.allowFileSharing && "✓"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Moderate messages
                        </span>
                        <p className="mt-1 text-sm text-gray-500">
                          All messages require approval before being posted
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          group?.settings?.moderateMessages
                            ? "bg-primary-dark-pink border-primary-dark-pink text-white"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        {group?.settings?.moderateMessages && "✓"}
                      </div>
                    </div>

                    {group?.groupType !== GroupType.PUBLIC && (
                      <div className="flex items-center justify-between px-6 py-4">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            Auto-approve join requests
                          </span>
                          <p className="mt-1 text-sm text-gray-500">
                            Automatically approve requests to join the group
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            group?.settings?.autoApproveJoinReqs
                              ? "bg-primary-dark-pink border-primary-dark-pink text-white"
                              : "border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          {group?.settings?.autoApproveJoinReqs && "✓"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <MembersTab groupId={groupId} adminId={group?.adminId!} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Members Tab Component with TanStack Query
const MembersTab: React.FC<{ groupId: string; adminId: number }> = ({
  groupId,
  adminId,
}) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: ({ pageParam }) => fetchGroupMembers(groupId, pageParam, 20),
    getNextPageParam: (lastPage) => {
      return lastPage.data?.pagination?.hasNextPage
        ? lastPage.data.pagination.nextCursor
        : undefined;
    },
    initialPageParam: undefined as number | undefined,
  });

  const allMembers =
    data?.pages.flatMap((page) => page.data?.members || []) || [];

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Members
          </h3>
        </div>
        <div className="px-6 py-12 text-center">
          <LoadingSpinner text="Loading members..." size="md" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Members
          </h3>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="mb-4 text-red-500">⚠️</div>
          <p className="text-red-600 dark:text-red-400">
            {error?.message || "Failed to load members"}
          </p>
        </div>
      </div>
    );
  }

  const totalMembers = data?.pages[0]?.data?.pagination?.total || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Members
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalMembers} total
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {allMembers.map((member) => (
          <div key={member.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    className="object-cover rounded-full aspect-square"
                    width={40}
                    height={40}
                    src={
                      member.user?.profile_image ||
                      "https://images.pexels.com/photos/30612850/pexels-photo-30612850/free-photo-of-outdoor-portrait-of-a-man-relaxing-on-swing-in-abuja.jpeg?auto=compress&cs=tinysrgb&w=600"
                    }
                    alt={member.user?.username || "User"}
                  />
                  {member.role === "ADMIN" && (
                    <div className="absolute flex items-center justify-center w-4 h-4 bg-yellow-500 rounded-full -top-1 -right-1">
                      <span className="text-xs text-white">👑</span>
                    </div>
                  )}
                  {member.role === "MODERATOR" && (
                    <div className="absolute flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full -top-1 -right-1">
                      <span className="text-xs text-white">🛡️</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {member.user?.name || member.user?.username}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.user?.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium uppercase ${
                    member.userId === adminId
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : member.role === "MODERATOR"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {member.userId === adminId ? "Admin" : member.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg gap-2 text-primary-dark-pink hover:bg-primary-dark-pink/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? (
              <LoadingSpinner
                className="w-4 h-4 animate-spin"
                text="Loading more..."
              />
            ) : (
              <>
                <LucideUsers className="w-4 h-4" />
                Load more members
              </>
            )}
          </button>
        </div>
      )}

      {allMembers.length === 0 && (
        <div className="px-6 py-12 text-center">
          <LucideUsers className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No Members Found
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            This group doesn&apos;t have any members yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupSettingsPage;
