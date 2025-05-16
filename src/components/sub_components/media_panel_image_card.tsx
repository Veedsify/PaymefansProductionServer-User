"use client";
import { LucideLoader, LucidePlay } from "lucide-react";
import React, { useEffect } from "react";
import Image from "next/image";
import usePostComponent from "@/contexts/post-component-preview";
import { getToken } from "@/utils/cookie.get";
import { MediaDataType } from "@/types/components";
import HLSVideoPlayer from "./videoplayer";
import { LockedMediaOverlay } from "./sub/locked-media-overlay";
import _, { set } from "lodash";
import { useProfileMediaContext } from "@/contexts/profile-media-context";
import { useInfiniteQuery } from "@tanstack/react-query";

const getUniqueItems = (arr: MediaDataType[]) => {
  const uniqueMap = new Map();
  arr.forEach((item) => uniqueMap.set(item.id, item)); // Assuming 'id' is the unique property
  return Array.from(uniqueMap.values());
};

const MediaPanelImageCard = React.memo(({ sort }: { sort: string }) => {

  const { fullScreenPreview } = usePostComponent();
  const token = getToken();

  const fetchMedia = async ({ pageParam = 1 }) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/media?page=${pageParam}&limit=${process.env.NEXT_PUBLIC_POST_MEDIA_PER_PAGE}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({  
      queryKey: ["media"],
      queryFn: fetchMedia,
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.flatMap((p) => p.data).length;
        if (loaded < lastPage.total) {
          return allPages.length + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
    });

  const allMedia = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data) : []),
    [data]
  );

  const sorted = React.useMemo(() => {
    return sort === "all"
      ? allMedia
      : allMedia.filter((media) => media.media_type === sort);
  }, [allMedia, sort]);

  const PreviewImageHandler = (
    media: string,
    type: string,
    isSubscriber: boolean,
    indexId: number
  ) => {
    if (!isSubscriber) return;

    const medias = sorted
      .filter((item) => item.media_state !== "processing")
      .map((media) => ({
        url: media.url,
        type: media.media_type,
      }));

    fullScreenPreview({
      url: media,
      type,
      open: true,
      ref: indexId,
      otherUrl: medias,
    });
  };

  const fetchAdditionalData = () => {
    fetchNextPage();
  };

  const loading = isLoading || isFetchingNextPage;
  const hasMore = !!hasNextPage;

  return (
    <>
      <div className="grid lg:grid-cols-3 grid-cols-2 overflow-hidden rounded-xl gap-1  select-none">
        {sorted.map((media, index) => (
          <div
            key={index}
            className="aspect-[4/3] md:aspect-square overflow-hidden relative"
          >
            <MediaPanelMediaCard
              isSubscriber={true}
              media={media}
              indexId={index}
              PreviewImageHandler={PreviewImageHandler}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center mb-20 col-span-3 py-2">
        {loading && (
          <div className="flex justify-center col-span-3">
            <LucideLoader size={30} className="animate-spin" stroke="purple" />
          </div>
        )}
        {hasMore && !loading && (
            <button
            className="col-span-3 px-6 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            onClick={fetchAdditionalData}
            >
            Load More
            </button>
        )}
        {!hasMore && !loading && (
          <p className="col-span-3 text-gray-500 italic text-center font-medium">
            No more media
          </p>
        )}
      </div>
    </>
  );
});

interface MediaPanelMediaCardProps {
  media: MediaDataType;
  PreviewImageHandler: (
    media: string,
    type: string,
    isSubscriber: boolean,
    indexId: number
  ) => void;
  isSubscriber: boolean;
  indexId: number;
}

const MediaPanelMediaCard = ({
  media,
  PreviewImageHandler,
  isSubscriber,
  indexId,
}: MediaPanelMediaCardProps) => {
  if (
    media.media_state == "processing" &&
    media.media_type.startsWith("video")
  ) {
    return (
      <div className="h-full select-none shadow-md aspect-square w-full object-cover bg-black flex flex-col gap-2 items-center justify-center text-center text-sm text-white">
        <h1>Your Media is still processing</h1>
        <small>Please wait for a few minutes</small>
      </div>
    );
  }

  return (
    <>
      {media.media_type === "video" ? (
        <div className="relative w-full h-full">
          <HLSVideoPlayer
            streamUrl={media.url}
            autoPlay={false}
            className="w-full h-[400px] cursor-pointer object-cover transition-all duration-300 ease-in-out"
            allOthers={{
              muted: true,
              poster: media.poster,
              onClick: () =>
                PreviewImageHandler(
                  media.url,
                  media.media_type,
                  isSubscriber,
                  indexId
                ),
            }}
          />
          <div
            onClick={() =>
              PreviewImageHandler(
                media.url,
                media.media_type,
                isSubscriber,
                indexId
              )
            }
            className="absolute bg-black/20 w-full h-full inset-0 cursor-pointer flex items-center justify-center"
          >
            <LucidePlay stroke="white" size={30} strokeWidth={2} />
          </div>
        </div>
      ) : (
        <Image
          width={400}
          height={400}
          priority
          onClick={() =>
            PreviewImageHandler(
              media.url,
              media.media_type,
              isSubscriber,
              indexId
            )
          }
          src={isSubscriber ? media.url : media.blur}
          alt=""
          className="w-full h-full cursor-pointer object-cover transition-all duration-300 ease-in-out hover:scale-105"
        />
      )}
      {!isSubscriber && (
        <LockedMediaOverlay
          type="subscribers"
          mediaIsVideo={media.media_type === "video"}
          duration={"00:34"}
        />
      )}
    </>
  );
};

MediaPanelImageCard.displayName = "MediaPanelImageCard";

export default MediaPanelImageCard;
