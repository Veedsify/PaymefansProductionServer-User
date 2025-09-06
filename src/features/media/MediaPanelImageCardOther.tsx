"use client";
import { LucideLoader, LucideLock, LucidePlay } from "lucide-react";
import { BiSolidLock } from "react-icons/bi";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import usePostComponent from "@/contexts/PostComponentPreview";
import { getToken } from "@/utils/Cookie";
import { ProfileUserProps } from "@/features/user/types/user";
import { useAuthContext } from "@/contexts/UserUseContext";
import { MediaDataTypeOtherProps } from "@/types/Components";
import HLSVideoPlayer from "./videoplayer";
import { LockedMediaOverlay } from "./LockedMediaOverlay";
import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/Axios";
const getUniqueItems = (arr: MediaDataTypeOtherProps[]) => {
  const uniqueMap = new Map();
  arr.forEach((item) => uniqueMap.set(item.id, item)); // Replace 'id' with the unique property
  return Array.from(uniqueMap.values());
};
interface MediaPanelMediaCardProps {
  media: MediaDataTypeOtherProps;
  PreviewImageHandler: (
    media: MediaDataTypeOtherProps,
    type: string,
    isSubscriber: boolean,
    indexId: number
  ) => void;
  indexId: number;
}
const MediaPanelImageCardOther = React.memo(
  ({ sort, userdata }: { sort: string; userdata: ProfileUserProps }) => {
    const fullScreenPreview = usePostComponent(
      (state) => state.fullScreenPreview
    );
    const fetchMedia = async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get(
        `/post/other/media/${userdata.id}?page=${pageParam}&limit=${process.env.NEXT_PUBLIC_POST_MEDIA_PER_PAGE}`
      );
      return res.data;
    };
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
      useInfiniteQuery({
        queryKey: ["mediaOther"],
        queryFn: fetchMedia,
        getNextPageParam: (lastPage, allPages) => {
          if (lastPage.hasMore) {
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
    const fetchAdditionalData = () => {
      fetchNextPage();
    };
    const PreviewImageHandler = (
      media: MediaDataTypeOtherProps,
      type: string,
      isSubscriber: boolean,
      indexId: number
    ) => {
      if (media.accessible_to === "subscribers" && !isSubscriber) return;
      const filteredMedias = sorted
        .filter((item) => item.media_state !== "processing")
        .filter((media) => {
          // Don't filter out paid content if user has paid for it
          if (media.accessible_to === "price") {
            return media.hasPaid;
          }
          return true;
        })
        .filter(
          (media) => !(media.accessible_to === "subscribers" && !isSubscriber)
        );
      // Get the new index after filtering
      const newIndexId = filteredMedias.findIndex(
        (item) => item.id === media.id
      );
      const medias = filteredMedias.map((media) => ({
        url: media.url,
        type: media.media_type,
      }));
      fullScreenPreview({
        url: media.url,
        type,
        userProfile: null,
        open: true,
        ref: newIndexId, // Use new index
        otherUrl: medias,
      });
    };
    const loading = isLoading || isFetchingNextPage;
    const hasMore = !!hasNextPage;
    return (
      <>
        <div className="overflow-hidden select-none grid grid-cols-2 rounded-xl lg:grid-cols-3 gap-1">
          {sorted.map((media, index) => (
            <div
              key={index}
              className="aspect-[4/3] md:aspect-square overflow-hidden relative"
            >
              <MediaPanelMediaCard
                media={media}
                PreviewImageHandler={PreviewImageHandler}
                indexId={index}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center py-2 mb-20 col-span-3">
          {loading && (
            <div className="flex justify-center col-span-3">
              <LucideLoader
                size={30}
                className="animate-spin"
                stroke="purple"
              />
            </div>
          )}
          {hasMore && !loading && (
            <button
              className="px-4 py-2 text-sm font-bold bg-gray-200 rounded-lg col-span-3"
              onClick={fetchAdditionalData}
            >
              Load More
            </button>
          )}
          {!hasMore && !loading && (
            <p className="text-sm font-medium text-center text-gray-500">
              No Media Found
            </p>
          )}
        </div>
      </>
    );
  }
);
export const MediaPanelMediaCard = ({
  media,
  PreviewImageHandler,
  indexId,
}: MediaPanelMediaCardProps) => {
  const { user: authUser } = useAuthContext();
  const isCreator = media.post.user.id === authUser?.id;
  // const isAdmin = user.role === "admin";
  const isSubscribed = media.isSubscribed;
  const hasPaid = media.hasPaid;
  // Determine visibility
  const canView =
    // isAdmin || // Admin sees all
    isCreator || // Creator sees their own posts
    media.accessible_to === "public" || // Public posts are visible to all
    (media.accessible_to === "subscribers" && isSubscribed) || // Subscriber-only post for subscribed users
    (media.accessible_to === "price" && hasPaid); // Paid posts if the user has paid
  return (
    <>
      {media.media_type === "video" ? (
        <>
          {canView ? (
            <div className="relative w-full h-full">
              <HLSVideoPlayer
                streamUrl={media.url}
                autoPlay={false}
                className="w-[400px] h-[400px] cursor-pointer object-cover transition-all duration-300 ease-in-out"
                allOthers={{
                  width: 400,
                  height: 400,
                  poster: media.poster,
                  onClick: () =>
                    PreviewImageHandler(
                      media,
                      media.media_type,
                      isSubscribed as boolean,
                      indexId
                    ),
                }}
              />
              <div
                onClick={() =>
                  PreviewImageHandler(
                    media,
                    media.media_type,
                    isSubscribed as boolean,
                    indexId
                  )
                }
                className="absolute inset-0 flex items-center justify-center w-full h-full cursor-pointer bg-black/20"
              >
                <LucidePlay stroke="white" size={30} strokeWidth={2} />
              </div>
            </div>
          ) : (
            <Image
              width={400}
              height={400}
              priority
              src={media?.blur}
              alt="Blured Video Image"
              className="object-cover w-full h-full cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
            />
          )}
        </>
      ) : (
        <>
          {!canView ? (
            <Image
              width={400}
              height={400}
              priority
              src={media.blur}
              alt="Blured Image"
              className="object-cover w-full h-full cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
            />
          ) : (
            <Image
              width={400}
              height={400}
              priority
              onClick={() =>
                PreviewImageHandler(
                  media,
                  media.media_type,
                  isSubscribed as boolean,
                  indexId
                )
              }
              src={media.url}
              alt=""
              className="object-cover w-full h-full cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
            />
          )}
        </>
      )}
      {!canView && (
        <LockedMediaOverlay
          type={media.accessible_to === "price" ? "price" : "subscribers"}
          mediaIsVideo={media.media_type === "video"}
          duration={media.duration}
        />
      )}
    </>
  );
};
MediaPanelImageCardOther.displayName = "MediaPanelImageCardOther";
export default MediaPanelImageCardOther;
