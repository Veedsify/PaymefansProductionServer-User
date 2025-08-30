"use client";
import { LucideLoader, LucidePlay } from "lucide-react";
import React, { useEffect } from "react";
import Image from "next/image";
import usePostComponent from "@/contexts/PostComponentPreview";
import { getToken } from "@/utils/Cookie";
import { MediaDataType } from "@/types/Components";
import HLSVideoPlayer from "./videoplayer";
import { LockedMediaOverlay } from "./LockedMediaOverlay";
import _, { set } from "lodash";
import { useProfileMediaContext } from "@/contexts/ProfileMediaContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/UserUseContext";
import axiosInstance from "@/utils/Axios";

const getUniqueItems = (arr: MediaDataType[]) => {
  const uniqueMap = new Map();
  arr.forEach((item) => uniqueMap.set(item.id, item)); // Assuming 'id' is the unique property
  return Array.from(uniqueMap.values());
};

const PrivateMediaImageCard = React.memo(({ sort }: { sort: string }) => {
  const { fullScreenPreview } = usePostComponent();
  const { user } = useAuthContext();

  const fetchMedia = async ({ pageParam = 1 }) => {
    const res = await axiosInstance.get(
      `/post/personal/private-media?page=${pageParam}&limit=${process.env.NEXT_PUBLIC_POST_MEDIA_PER_PAGE}`,
    );
    return res.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["private-media"],
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
    [data],
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
    _: number,
    watermarkEnabled: boolean,
  ) => {
    if (!isSubscriber) return;

    const medias = sorted
      .filter((item) => item.media_state !== "processing")
      .map((media) => ({
        url: media.url,
        type: media.media_type,
      }));

    const newIndexId = medias.findIndex((item) => item.url === media);
    fullScreenPreview({
      username: user?.username,
      watermarkEnabled: watermarkEnabled,
      url: media,
      userProfile: null,
      type,
      open: true,
      ref: newIndexId,
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
      <div className="overflow-hidden select-none grid lg:grid-cols-3 grid-cols-2 rounded-xl gap-1 ">
        {sorted.map((media, index) => (
          <div
            key={index}
            className="aspect-[4/3] md:aspect-square overflow-hidden relative"
          >
            <PrivateMediaPanelMediaCard
              isSubscriber={true}
              media={media}
              indexId={index}
              PreviewImageHandler={PreviewImageHandler}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center py-2 mb-20 col-span-3">
        {loading && (
          <div className="flex justify-center col-span-3">
            <LucideLoader size={30} className="animate-spin" stroke="purple" />
          </div>
        )}
        {hasMore && !loading && (
          <button
            className="px-6 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg shadow-md col-span-3 hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
            onClick={fetchAdditionalData}
          >
            Load More
          </button>
        )}
        {!hasMore && !loading && (
          <p className="italic font-medium text-center text-gray-500 col-span-3">
            No more private media
          </p>
        )}
      </div>
    </>
  );
});

interface PrivateMediaPanelMediaCardProps {
  media: MediaDataType;
  PreviewImageHandler: (
    media: string,
    type: string,
    isSubscriber: boolean,
    indexId: number,
    watermarkEnabled: boolean,
  ) => void;
  isSubscriber: boolean;
  indexId: number;
}

const PrivateMediaPanelMediaCard = ({
  media,
  PreviewImageHandler,
  isSubscriber,
  indexId,
}: PrivateMediaPanelMediaCardProps) => {
  if (
    media.media_state == "processing" &&
    media.media_type.startsWith("video")
  ) {
    return (
      <div className="flex flex-col items-center justify-center object-cover w-full h-full text-sm text-center text-white bg-black shadow-md select-none aspect-square gap-2">
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
                  indexId,
                  media.post.watermark_enabled,
                ),
            }}
          />
          <div
            onClick={() =>
              PreviewImageHandler(
                media.url,
                media.media_type,
                isSubscriber,
                indexId,
                media.post.watermark_enabled,
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
          onClick={() =>
            PreviewImageHandler(
              media.url,
              media.media_type,
              isSubscriber,
              indexId,
              media.post.watermark_enabled,
            )
          }
          src={isSubscriber ? media.url : media.blur}
          alt=""
          className="object-cover w-full h-full cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
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

PrivateMediaImageCard.displayName = "PrivateMediaImageCard";

export default PrivateMediaImageCard;
