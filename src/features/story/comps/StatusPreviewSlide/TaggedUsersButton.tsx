import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { LucideLoader, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import { useStoryPause } from "@/contexts/StoryPauseContext";
import type { Story } from "@/types/Components";
import {
  fetchStoryMentions,
  type StoryMention,
} from "@/utils/data/FetchStoryMentions";
import FormatName from "@/lib/FormatName";

type TaggedUsersButtonProps = {
  story: Story;
};

const TaggedUsersButton = ({ story }: TaggedUsersButtonProps) => {
  const [showTaggedUsers, setShowTaggedUsers] = useState(false);
  const { user } = useAuthContext();
  const { setIsPaused } = useStoryPause();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["storyMentions", story.media_id],
    queryFn: async () => await fetchStoryMentions(story.media_id),
    enabled: showTaggedUsers,
    staleTime: 1000 * 60,
  });

  const mentions: StoryMention[] = data?.data?.mentions || [];

  useEffect(() => {
    setIsPaused(showTaggedUsers);
  }, [showTaggedUsers, setIsPaused]);

  const fetchMentions = useCallback(async () => {
    setShowTaggedUsers(true);
  }, []);

  return (
    <>
      <div className="absolute z-[400] bottom-0 right-2">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={fetchMentions}
          disabled={isLoading}
          className="flex cursor-pointer items-center px-3 py-2 text-white rounded-full bg-black/50 backdrop-blur-sm gap-2 hover:bg-black/70 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <LucideLoader className="w-4 h-4 animate-spin" />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="text-sm">Tagged</span>
        </motion.button>
      </div>

      {/* Tagged Users Modal */}
      <AnimatePresence>
        {showTaggedUsers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-110"
            onClick={() => setShowTaggedUsers(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-sm mx-4 p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Tagged Users
                </h3>
                <button
                  onClick={() => setShowTaggedUsers(false)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {mentions.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No users tagged in this story
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {mentions.map((mention) => (
                    <Link
                      key={mention.id}
                      href={`/${mention.mentioned_user.username}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                        {mention.mentioned_user.profile_image ? (
                          <Image
                            src={mention.mentioned_user.profile_image}
                            alt={mention.mentioned_user.username}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600">
                              {mention.mentioned_user.username
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </span>
                        )}
                      </span>
                      <div className="flex-1">
                        <div className=" text-gray-800">
                          {FormatName(mention.mentioned_user.name)}
                        </div>
                        <div className="font-medium text-sm text-gray-500">
                          {mention.mentioned_user.username}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaggedUsersButton;
