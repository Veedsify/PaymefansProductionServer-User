import { GroupData } from "@/utils/data/GroupAPI";
import { LucideMoreVertical, Users } from "lucide-react";
import Image from "next/image";

interface GroupChatHeaderProps {
  groupData: GroupData | null;
}

const GroupChatHeader = ({ groupData }: GroupChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between md:p-6 p-4 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex items-center justify-center overflow-hidden">
          {groupData?.groupIcon ? (
            <Image
              src={groupData.groupIcon}
              alt={groupData.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
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
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>{groupData.membersCount} Members</span>
              <span>•</span>
              <span className="capitalize">
                {groupData.groupType.toLowerCase()}
              </span>
              {groupData.userRole !== "MEMBER" && (
                <>
                  <span>•</span>
                  <span className="text-primary-dark-pink font-medium">
                    {groupData.userRole}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <button className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <LucideMoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GroupChatHeader;
