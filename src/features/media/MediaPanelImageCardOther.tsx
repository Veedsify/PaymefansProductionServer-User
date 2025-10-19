"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LucidePlay } from "lucide-react";
import Image from "next/image";
import React from "react";
import usePostComponent from "@/contexts/PostComponentPreview";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { ProfileUserProps } from "@/features/user/types/user";
import type { MediaDataTypeOtherProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { LockedMediaOverlay } from "./LockedMediaOverlay";
import HLSVideoPlayer from "./videoplayer";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import { useMediaActions } from "@/hooks";

interface MediaPanelMediaCardProps {
  media: MediaDataTypeOtherProps;
  PreviewImageHandler: (
    media: MediaDataTypeOtherProps,
    type: string,
    isSubscriber: boolean,
    indexId: number
  ) => void;
  indexId: number;
  profileUserId: number;
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
      const filteredMedias = allMedia
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
          {allMedia.map((media, index) => (
            <div
              key={index}
              className="aspect-[4/3] md:aspect-square overflow-hidden relative"
            >
              <MediaPanelMediaCard
                media={media}
                PreviewImageHandler={PreviewImageHandler}
                indexId={index}
                profileUserId={userdata.id}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center py-2 mb-20 col-span-3">
          {loading && <LoadingSpinner />}
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
  profileUserId,
}: MediaPanelMediaCardProps) => {
  const { user: authUser } = useAuthContext();
  const isCreator = media.post.user.id === authUser?.id;
  // const isAdmin = user.role === "admin";
  const isSubscribed = media.isSubscribed;
  const hasPaid = media.hasPaid;

  // Use the media actions hook
  const { handleLockedMediaClick } = useMediaActions(media, profileUserId);

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
          onClick={handleLockedMediaClick}
          price={media.post.post_price}
        />
      )}
    </>
  );
};
MediaPanelImageCardOther.displayName = "MediaPanelImageCardOther";
export default MediaPanelImageCardOther;
