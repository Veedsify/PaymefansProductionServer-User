"use client";

import {
  LucideSearch,
  LucideUsers,
  LucideVerified,
  LucideLoader2,
  LucidePlus,
  MailWarning,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/lib/UserUseContext";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchUserGroups,
  getMainGroup,
  GroupData,
  GroupsResponse,
  joinGroup,
} from "@/utils/data/GroupAPI";
import GroupCover from "@/components/group/GroupCover";
import { formatDate } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const Groups = () => {
  const user = useUserStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
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
  const { data: mainGroup, isLoading: isLoadingMainGroup } = useQuery({
    queryKey: ["main-group"],
    queryFn: getMainGroup,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Redirect to group chat page if user is a member of the group and mainGroup has an id
  useEffect(() => {
    if (
      mainGroup?.groups?.id &&
      groupsData?.data?.userGroups?.some(
        (group: GroupData) => group.id === mainGroup.groups.id
      )
    ) {
      router.push(`/groups/${mainGroup.groups.id}`);
    }
  }, [mainGroup, groupsData, router]);

  // Check if user is properly authenticated
  if (!user && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <h3 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
          Authentication Required
        </h3>
        <p className="mb-4 text-gray-500 dark:text-gray-500">
          Please log in to view your groups.
        </p>
      </div>
    );
  }

  const handleJoinGroup = async () => {
    try {
      await joinGroup(mainGroup?.groups?.id!);
      toast.success("You Have Successfully Joined Creators Group");
      refetch();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send join request";
      toast.error(message);
    }
  };

  const userGroups: GroupData[] = groupsData?.data?.userGroups || [];
  const userGroupsCount = groupsData?.data?.userGroupsCount || 0;

  if (!isLoading && !isLoadingMainGroup && userGroupsCount === 0) {
    return <GroupCover handleJoinGroup={handleJoinGroup} />;
  }

  return (
    <div className="flex items-center justify-center py-8 h-dvh ">
      <LoadingSpinner
        size="lg"
        text="Loading group chat..."
        className="flex-col items-center justify-center h-full"
      />
    </div>
  );
};

export default Groups;
