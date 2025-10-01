"use client";
import { useStoryPause } from "@/contexts/StoryPauseContext";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const StoryDeleteButton = ({
  user,
  authUserId,
  handleDelete,
}: {
  user: Partial<{
    id: number;
    name: string;
    username: string;
  }>;
  handleDelete: () => Promise<void>;
  authUserId: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { setIsPaused } = useStoryPause();

  useEffect(() => {
    if (isOpen) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [isOpen, setIsPaused]);

  useEffect(() => {
    const closeOpen = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", closeOpen);

    return () => {
      document.removeEventListener("click", closeOpen);
    };
  }, []);

  return (
    <div className="relative inline-block ml-auto " ref={ref}>
      {/* More options button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`mr-12 ml-auto cursor-pointer text-nowrap
          flex items-center justify-center w-5 h-5 rounded-full
          transition-all duration-200 ease-in-out
       dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 text-white
          ${isOpen ? " dark:bg-gray-800" : ""}
        `}
        aria-label="More options"
      >
        <MoreVertical
          size={16}
          className={`
            w-5 h-5 text-white
            transition-transform duration-200
            ${isOpen ? "rotate-90" : ""}
          `}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="
              absolute top-8 -translate-x-1/2 -left-1/2 z-20
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              rounded-md shadow-lg
            "
            initial={{
              opacity: 0,
              scale: 0.95,
              y: -10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -10,
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
          >
            {/* Menu content */}
            <div className="p-2 space-y-1.5">
              {/* Add more menu items here if needed */}
              {authUserId === user.id && (
                <>
                  <button
                    onClick={async () => {
                      setIsOpen(false);
                      await handleDelete();
                    }}
                    className="flex cursor-pointer items-center justify-center w-full px-3 py-1 text-sm bg-red-500 dark:text-gray-300 dark:hover:bg-red-500 text-nowrap rounded-md transition-colors duration-150 text-white gap-3 text-center"
                  >
                    <Trash2 size={14} />
                    Delete Story
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryDeleteButton;
