import { GroupData } from "@/utils/data/GroupAPI";
import { LucideChevronLeft, LucideMoreVertical, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSocket } from "@/components/sub_components/sub/Socket";

interface GroupChatHeaderProps {
  groupData: GroupData | null;
}

const GroupChatHeader = ({ groupData }: GroupChatHeaderProps) => {
  const [activeMembersCount, setActiveMembersCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(false);
  const socket = getSocket();

  useEffect(() => {
    if (!socket || !groupData?.id) return;

    // Request active members count when component mounts or groupData changes
    const requestActiveMembersCount = () => {
      setIsLoadingCount(true);
      socket.emit("group-active-members", { groupId: groupData.id });

      // Set timeout to stop loading state if no response
      setTimeout(() => {
        setIsLoadingCount(false);
      }, 5000); // 5 second timeout
    };

    // Listen for active members response
    const handleActiveMembersResponse = (data: {
      groupId: number;
      members: any[];
    }) => {
      if (data.groupId === groupData.id) {
        setActiveMembersCount(data.members.length);
        setIsLoadingCount(false);
      }
    };

    // Listen for real-time member join/leave events
    const handleMemberJoined = (data: { groupId: number; userId: string }) => {
      if (data.groupId === groupData.id) {
        requestActiveMembersCount(); // Refresh count when someone joins
      }
    };

    const handleMemberLeft = (data: { groupId: number; userId: string }) => {
      if (data.groupId === groupData.id) {
        requestActiveMembersCount(); // Refresh count when someone leaves
      }
    };

    // Listen for successful group room join
    const handleGroupRoomJoined = (data: { groupId: string }) => {
      if (data.groupId === groupData.id.toString()) {
        requestActiveMembersCount(); // Immediately request count when user joins
      }
    };

    // Listen for socket reconnection to refresh member count
    const handleSocketReconnect = () => {
      console.log("Socket reconnected, refreshing group member count");
      requestActiveMembersCount();
    };

    // Listen for socket connection to refresh member count
    const handleSocketConnect = () => {
      console.log("Socket connected, refreshing group member count");
      requestActiveMembersCount();
    };

    // Set up event listeners
    socket.on("group-active-members", handleActiveMembersResponse);
    socket.on("group-member-joined", handleMemberJoined);
    socket.on("group-member-left", handleMemberLeft);
    socket.on("group-room-joined", handleGroupRoomJoined);
    socket.on("connect", handleSocketConnect);
    socket.on("reconnect", handleSocketReconnect);

    // Initial request
    requestActiveMembersCount();

    // Request count periodically to keep it updated
    const interval = setInterval(requestActiveMembersCount, 30000); // Update every 30 seconds

    return () => {
      socket.off("group-active-members", handleActiveMembersResponse);
      socket.off("group-member-joined", handleMemberJoined);
      socket.off("group-member-left", handleMemberLeft);
      socket.off("group-room-joined", handleGroupRoomJoined);
      socket.off("connect", handleSocketConnect);
      socket.off("reconnect", handleSocketReconnect);
      clearInterval(interval);
    };
  }, [socket, groupData?.id]);
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-300 md:p-6 dark:bg-gray-800 dark:border-gray-700">
      <Link href={`/`} className="mr-4">
        <LucideChevronLeft
          size={24}
          className="text-gray-600 cursor-pointer dark:text-gray-400 hover:text-primary-dark-pink transition-colors"
        />
      </Link>
      <div className="flex mr-auto items-center">
        <div className="flex items-center justify-center w-12 h-12 mr-4 overflow-hidden bg-gray-300 rounded-full">
          {groupData?.groupIcon ? (
            <Image
              src={groupData.groupIcon}
              alt={groupData.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <Users className="w-6 h-6 text-gray-600" />
          )}
        </div>
        <div>
          <div className="text-lg font-semibold">
            {groupData?.name || "Loading..."}
          </div>
          {groupData && (
            <div className="flex items-center text-sm text-gray-500 gap-2">
              <span>
                {isLoadingCount ? (
                  <span className="text-gray-400">Loading...</span>
                ) : activeMembersCount > 0 ? (
                  <>
                    {activeMembersCount}{" "}
                    {activeMembersCount === 1 ? "Member" : "Members"}{" "}
                    <span className="text-green-500">online</span>
                    {groupData.membersCount > activeMembersCount && (
                      <span className="text-gray-400">
                        {" "}
                        of {groupData.membersCount}
                      </span>
                    )}
                  </>
                ) : (
                  `${groupData.membersCount} ${
                    groupData.membersCount === 1 ? "Member" : "Members"
                  }`
                )}
              </span>
              <span>•</span>
              <span className="capitalize">
                {groupData.groupType.toLowerCase()}
              </span>
              {groupData.userRole !== "MEMBER" && (
                <>
                  <span>•</span>
                  <span className="font-medium text-primary-dark-pink">
                    {groupData.userRole}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <Link
          href={`/groups/settings/${groupData?.id}`}
          className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <LucideMoreVertical className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default GroupChatHeader;
