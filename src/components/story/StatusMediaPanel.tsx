"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import StoryMediaFetch from "@/components/custom-hooks/StoryMediaFetch";
import { LucideCheck, LucideLoader, LucidePlay } from "lucide-react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { useStoryStore } from "@/contexts/StoryContext";
import VideoPlayer from "../sub_components/videoplayer";

const StatusMediaPanel = () => {
  const [page, setPage] = useState(1);
  const { loading, error, hasMore, media } = StoryMediaFetch({ page });
  const { ref, inView } = useInView({ threshold: 1 });

  useEffect(() => {
    if (inView && hasMore) {
      setPage((prev) => prev + 1); // Prevent stale state issues
    }
  }, [inView, hasMore]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-red-500 font-medium text-center">
          Sorry, an error occurred while fetching your media
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 flex-1 max-h-[calc(70vh-120px)] sm:max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {media.map((data: any, index: number) => (
          <div key={data.id} className="group">
            <StoryMediaItem data={data} />
          </div>
        ))}
        <div ref={ref}></div>
      </div>
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="flex items-center gap-2 text-primary-dark-pink">
            <LucideLoader size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading media...</span>
          </div>
        </div>
      )}
      {media.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-center">
            No media found
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center px-4">
            Upload some photos or videos to get started
          </p>
        </div>
      )}
    </div>
  );
};

const StoryMediaItem = React.memo(({ data }: { data: any }) => {
  const { removeFromStory, addToStory, story } = useStoryStore();

  // Memoize selected state instead of using useState
  const selected = useMemo(
    () => story.some((item) => item.id === data.id),
    [story, data.id],
  );

  const handleSelect = useCallback(() => {
    if (selected) {
      removeFromStory(data.id);
    } else {
      addToStory({
        index: 0,
        id: data.id,
        media_type: data.media_type,
        media_url: data.url,
      });
    }
  }, [
    selected,
    addToStory,
    removeFromStory,
    data.id,
    data.media_type,
    data.url,
  ]);

  return (
    <div
      className={`bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 w-full aspect-square rounded-lg sm:rounded-xl flex items-center justify-center relative transition-all duration-300 ring-2 ${
        selected
          ? "ring-primary-dark-pink shadow-lg shadow-primary-dark-pink/20 transform scale-[1.02]"
          : "ring-transparent hover:ring-primary-dark-pink/30 hover:shadow-md group-hover:transform group-hover:scale-[1.01]"
      }`}
    >
      {data.media_type === "video" ? (
        <>
          {selected && (
            <div className="absolute inset-0 bg-primary-dark-pink/20 rounded-lg sm:rounded-xl flex items-center justify-center z-10">
              <div className="bg-primary-dark-pink rounded-full p-2 sm:p-2.5 shadow-lg">
                <LucideCheck
                  stroke="#fff"
                  size={20}
                  strokeWidth={3}
                  className="cursor-pointer sm:w-6 sm:h-6"
                  onClick={handleSelect}
                />
              </div>
            </div>
          )}
          <VideoPlayer
            allOthers={{ onClick: handleSelect, muted: true }}
            streamUrl={data.url}
            className={`object-cover rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 inset-0 w-full h-full ${
              selected ? "brightness-110" : "brightness-75 hover:brightness-90"
            }`}
          />
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-gradient-to-r from-primary-dark-pink to-purple-600 p-1 sm:p-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <LucidePlay
              fill="#fff"
              strokeWidth={0}
              size={10}
              className="sm:w-3 sm:h-3"
            />
          </div>
        </>
      ) : (
        <>
          {selected && (
            <div className="absolute inset-0 bg-primary-dark-pink/20 rounded-lg sm:rounded-xl flex items-center justify-center z-10">
              <div className="bg-primary-dark-pink rounded-full p-2 sm:p-2.5 shadow-lg">
                <LucideCheck
                  stroke="#fff"
                  size={20}
                  strokeWidth={3}
                  className="cursor-pointer sm:w-6 sm:h-6"
                  onClick={handleSelect}
                />
              </div>
            </div>
          )}
          <Image
            src={data.url}
            alt={data.url}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className={`object-cover rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 ${
              selected ? "brightness-110" : "brightness-75 hover:brightness-90"
            }`}
            onClick={handleSelect}
          />
        </>
      )}
    </div>
  );
});

StoryMediaItem.displayName = "StoryMediaItem";

export default StatusMediaPanel;
