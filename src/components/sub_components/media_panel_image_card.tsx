"use client";
import { LucideLoader, LucideLock, LucidePlay } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import usePostComponent from "@/contexts/post-component-preview";
import { getToken } from "@/utils/cookie.get";
import { MediaDataType } from "@/types/components";
import HLSVideoPlayer from "./videoplayer";

const getUniqueItems = (arr: MediaDataType[]) => {
  const uniqueMap = new Map();
  arr.forEach((item) => uniqueMap.set(item.id, item)); // Assuming 'id' is the unique property
  return Array.from(uniqueMap.values());
};

const MediaPanelImageCard = React.memo(({ sort }: { sort: string }) => {
  const [arData, setData] = useState<MediaDataType[]>([]);
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
    const medias = sorted.map((media) => ({
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
        `${process.env.NEXT_PUBLIC_EXPRESS_URL}/user/media?page=1`,
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
  }, [token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchAdditionalData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_EXPRESS_URL}/user/media?page=${page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setData((prev) => getUniqueItems([...prev, ...data.data]));
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
    <div className="grid grid-cols-3 gap-1 mb-20 select-none">
      {sorted.map((media, index) => (
        <div key={index} className="aspect-square overflow-hidden relative">
          <MediaPanelMediaCard
            isSubscriber={true}
            media={media}
            indexId={index}
            PreviewImageHandler={PreviewImageHandler}
          />
        </div>
      ))}
      <div className="flex flex-col items-center justify-center col-span-3 py-4">
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
          <p className="col-span-3 py-4 text-center dark:text-white">
            No more media
          </p>
        )}
      </div>
    </div>
  );
});

const LockedMediaOverlay = () => {
  return (
    <div className="lock-icon absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900 bg-opacity-40 cursor-not-allowed">
      <LucideLock stroke="white" size={30} strokeWidth={2} />
    </div>
  );
};

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
  return (
    <>
      {media.media_type === "video" ? (
        <div className="relative w-full h-full">
          <HLSVideoPlayer
            streamUrl={media.url}
            className="w-full h-full cursor-pointer object-cover transition-all duration-300 ease-in-out"
            allOthers={{
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
            className="absolute bg-black w-full h-full inset-0 bg-opacity-20 cursor-pointer flex items-center justify-center"
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
      {!isSubscriber && <LockedMediaOverlay />}
    </>
  );
};

MediaPanelImageCard.displayName = "MediaPanelImageCard";

export default MediaPanelImageCard;
