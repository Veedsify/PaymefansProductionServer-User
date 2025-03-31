"use client";
import { LucideLoader, LucideLock, LucidePlay } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import usePostComponent from "@/contexts/post-component-preview";
import { getToken } from "@/utils/cookie.get";
import { MediaDataType } from "@/types/components";
import HLSVideoPlayer from "./videoplayer";
import { LockedMediaOverlay } from "./sub/locked-media-overlay";
import _, { set } from "lodash";
import { useProfileMediaContext } from "@/contexts/profile-media-context";

const getUniqueItems = (arr: MediaDataType[]) => {
  const uniqueMap = new Map();
  arr.forEach((item) => uniqueMap.set(item.id, item)); // Assuming 'id' is the unique property
  return Array.from(uniqueMap.values());
};

const MediaPanelImageCard = React.memo(({ sort }: { sort: string }) => {
  const {arData, setData} = useProfileMediaContext()
  const [sorted, setSorted] = useState<MediaDataType[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { fullScreenPreview } = usePostComponent();
  const token = getToken();
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sortData = (data: MediaDataType[]) => {
      return sort === "all"
        ? data
        : data.filter((media) => media.media_type === sort);
    };
    setSorted(sortData(arData));
  }, [arData, sort]);

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

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/media?page=1&limit=${process.env.NEXT_PUBLIC_POST_MEDIA_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setData(data.data);
      setTotalPages(data.total);
      setHasMore(data.data.length < data.total);
      setLoading(false);
      setPage(2); // Start with the next page
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  }, [token, setData]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchAdditionalData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/media?page=${page}&limit=${process.env.NEXT_PUBLIC_POST_MEDIA_PER_PAGE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setData(data.data);
      setHasMore(sorted.length + data.data.length < data.total);
      setPage((prev) => prev + 1); // Increment the page after fetching data
      setLoading(false);
    } catch (error) {
      console.error("Error fetching additional data:", error);
    } finally {
      setLoading(false);
    }
  };

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
            className="col-span-3 px-4 py-2 rounded-lg text-sm font-bold bg-gray-200"
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
      <div className="h-full select-none shadow-md aspect-square w-full object-cover bg-black flex flex-col gap-2 items-center justify-center text-white">
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
              poster:media.poster,
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
