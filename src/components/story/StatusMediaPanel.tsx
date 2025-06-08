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
      <div className="p-5 text-red-500">
        Sorry, an error occurred while fetching your media
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 p-3 md:p-5 pb-10 max-h-[500px] overflow-auto">
        {media.map((data: any, index: number) => (
          <div key={data.id}>
            <StoryMediaItem data={data} />
          </div>
        ))}
        <div ref={ref}></div>
      </div>
      {loading && (
        <div className="px-4">
          <LucideLoader size={30} className="animate-spin" fill="#CC0DF8" />
        </div>
      )}
      {media.length === 0 && !loading && (
        <div className="p-5 text-center text-gray-500">No media found</div>
      )}
    </>
  );
};

const StoryMediaItem = React.memo(({ data }: { data: any }) => {
  const { removeFromStory, addToStory, story } = useStoryStore();

  // Memoize selected state instead of using useState
  const selected = useMemo(
    () => story.some((item) => item.id === data.id),
    [story, data.id]
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
      className={`bg-gray-200 w-full aspect-square rounded-xl flex items-center justify-center relative duration-500 outline ${
        selected ? "outline-primary-dark-pink" : "outline-transparent"
      }`}
    >
      {data.media_type === "video" ? (
        <>
          {selected && (
            <LucideCheck
              stroke="#fff"
              size={45}
              className="z-10 absolute"
              onClick={handleSelect}
            />
          )}
          <VideoPlayer
            allOthers={{ onClick: handleSelect, muted: true }}
            streamUrl={data.url}
            className={`object-cover rounded-xl cursor-pointer ${
              selected ? "p-[2px] saturate-100" : "saturate-0"
            } ease-in-out duration-300 inset-0 w-full h-full`}
          ></VideoPlayer>
          <span className="absolute top-0 left-0 bg-primary-dark-pink p-1 rounded-full m-1 shadow-lg shadow-white">
            <LucidePlay fill="#fff" strokeWidth={0} size={15} />
          </span>
        </>
      ) : (
        <>
          {selected && (
            <LucideCheck
              stroke="#fff"
              size={45}
              className="z-10"
              onClick={handleSelect}
            />
          )}
          <Image
            src={data.url}
            alt={data.url}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className={`object-cover rounded-xl cursor-pointer ${
              selected ? "p-[2px] saturate-100" : "saturate-0"
            } ease-in-out duration-300`}
            onClick={handleSelect}
          />
        </>
      )}
    </div>
  );
});

StoryMediaItem.displayName = "StoryMediaItem";

export default StatusMediaPanel;
