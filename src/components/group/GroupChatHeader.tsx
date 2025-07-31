import { LucideMoreVertical } from "lucide-react";

const GroupChatHeader = () => {
  return (
    <div className="flex items-center justify-between md:p-6 p-4 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
        <div className="text-lg font-semibold">Group Name</div>
      </div>
      <div className="flex items-center">
        <button className="px-2 py-1">
          <LucideMoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GroupChatHeader;
