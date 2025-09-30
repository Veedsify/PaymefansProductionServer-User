"use client";
import { useStoryPause } from "@/contexts/StoryPauseContext";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, MoreVertical, Link as ProfileLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const StoryDeleteButton = ({
  user,
  authUserId,
}: {
  user: Partial<{
    id: number;
    name: string;
    username: string;
  }>;
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
    <div className="relative mr-12" ref={ref}>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More options button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={` cursor-pointer text-nowrap
          flex items-center justify-center w-5 h-5 rounded-full
          transition-all duration-200 ease-in-out
          hover:bg-gray-100 dark:hover:bg-gray-800
          focus:outline-none focus:ring-2
          ${isOpen ? "bg-gray-100 dark:bg-gray-800" : ""}
        `}
        aria-label="More options"
      >
        <MoreVertical
          size={16}
          className={`
            w-5 h-5 text-gray-600 dark:text-gray-400
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
              absolute top-12 right-0 z-20 py-2
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-lg
              backdrop-blur-sm
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
                  <div className="w-full mx-3 my-1  bg-gray-200  dark:bg-gray-700" />
                  <button className="flex items-center justify-center w-full px-3 py-1 text-sm bg-red-500 dark:text-gray-300 dark:hover:bg-red-500 text-nowrap rounded-md transition-colors duration-150 text-white gap-3 text-center">
                    <Ban size={14} />
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
