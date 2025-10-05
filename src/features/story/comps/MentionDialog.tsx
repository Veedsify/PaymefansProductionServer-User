import { X } from "lucide-react";
import Image from "next/image";
import FormatName from "@/lib/FormatName";

interface MentionDialogProps {
  showMentionDialog: boolean;
  mentionQuery: string;
  setMentionQuery: (query: string) => void;
  selectedMentions: { id: number; username: string; name: string }[];
  searchedUsers: any[];
  isSearchingUsers: boolean;
  onAddMention: (user: { id: number; username: string; name: string }) => void;
  onRemoveMention: (userId: number) => void;
  onClose: () => void;
}

export const MentionDialog = ({
  showMentionDialog,
  mentionQuery,
  setMentionQuery,
  selectedMentions,
  searchedUsers,
  isSearchingUsers,
  onAddMention,
  onRemoveMention,
  onClose,
}: MentionDialogProps) => {
  if (!showMentionDialog) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[90]">
      <div className="w-full max-w-md p-6 mx-4 border shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl border-white/20">
        <h3 className="mb-4 text-xl font-bold text-gray-800">Tag Users</h3>

        {/* Selected Mentions */}
        {selectedMentions.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-gray-600">
              Tagged Users:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedMentions.map((mention) => (
                <div
                  key={mention.id}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full"
                >
                  <span className="text-sm text-blue-800">
                    {mention.username}
                  </span>
                  <button
                    onClick={() => onRemoveMention(mention.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search users to tag..."
          value={mentionQuery}
          onChange={(e) => setMentionQuery(e.target.value)}
          className="w-full p-3 mb-4 text-gray-800 border-2 border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
          autoFocus
        />

        {/* Search Results */}
        {mentionQuery && (
          <div className="mb-4">
            {isSearchingUsers ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : searchedUsers.length > 0 ? (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {searchedUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onAddMention(user)}
                    disabled={selectedMentions.some((m) => m.id === user.id)}
                    className="flex items-center w-full gap-3 p-3 text-left transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                      {user.profile_image ? (
                        <Image
                          src={user.profile_image}
                          alt={user.username}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className=" text-gray-800">
                        {FormatName(user.name)}
                      </div>
                      <div className="font-medium text-sm text-gray-500">
                        {user.username}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 font-medium text-white shadow-lg bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
