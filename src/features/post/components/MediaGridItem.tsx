import { LucideLock, LucidePlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import type { UserMediaProps } from "@/types/Components";
import ImageComponent from "./ImageComponent";
import VideoComponent from "./VideoComponent";

interface MediaGridItemProps {
  media: UserMediaProps;
  index: number;
  data: any;
  canView: boolean;
  mediaLength: number;
  onNonSubscriberClick: (e: React.MouseEvent) => void;
  onMediaClick: (media: {
    url: string;
    media_type: string;
    index: number;
  }) => void;
  isSubscribed: boolean;
}

const MediaGridItem = memo(
  ({
    media,
    index,
    data,
    canView,
    mediaLength,
    onNonSubscriberClick,
    onMediaClick,
    isSubscribed,
  }: MediaGridItemProps) => {
    // Memoized locked overlay component
    const LockedOverlay = memo(
      ({ type }: { type: "price" | "subscribers" }) => (
        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-black/20">
          <span className="flex flex-col items-center justify-center w-full h-full text-white gap-2">
            {type === "price" && index === 0 ? (
              <p className="flex items-center justify-center font-bold text-center gap-2 text-lg lg:text-lg leading-4">
                <Image
                  width={20}
                  height={20}
                  src="/site/coin.svg"
                  className="w-5 h-5 aspect-square"
                  alt=""
                  priority
                />
                {data.post_price}
              </p>
            ) : (
              <LucideLock className="text-lg font-bold" />
            )}
          </span>
        </div>
      ),
    );
    LockedOverlay.displayName = "LockedOverlay";

    // Memoized show more overlay
    const ShowMoreOverlay = memo(() => (
      <Link
        href={data.post_audience === "private" ? "#" : `/posts/${data.post_id}`}
        className="flex flex-col absolute inset-0 items-center justify-center rounded-lg aspect-[3/4] md:aspect-square bg-white/70 cursor-pointer select-none"
      >
        <div>
          <LucidePlus
            size={40}
            fill="#ffffff"
            stroke="#ffffff"
            className="text-white border-4 rounded-full"
          />
        </div>
        <p className="text-lg font-bold text-white select-none">
          {mediaLength - 3} more
        </p>
      </Link>
    ));
    ShowMoreOverlay.displayName = "ShowMoreOverlay";

    return (
      <div
        className={`relative rounded-xl overflow-hidden ${
          data.post_status !== "approved" ? "border-fuchsia-500 border-2" : ""
        }`}
        onClick={onNonSubscriberClick}
      >
        {media.media_type === "video" ? (
          !canView ? (
            <Image
              src={media.blur}
              alt=""
              width={300}
              height={300}
              priority
              blurDataURL={media.blur}
              className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"
            />
          ) : (
            <VideoComponent
              media={{ ...media, index }}
              data={data}
              clickImageEvent={onMediaClick}
              isSubscriber={isSubscribed}
            />
          )
        ) : !canView ? (
          <Image
            src={media.blur}
            alt={data.post}
            width={400}
            height={400}
            priority
            blurDataURL={media.blur}
            className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"
          />
        ) : (
          <ImageComponent
            media={{ ...media, index }}
            data={data}
            clickImageEvent={onMediaClick}
          />
        )}

        {/* Show more overlay */}
        {index === 2 && data.media.length > 3 && <ShowMoreOverlay />}

        {/* Locked overlays */}
        {!canView && data.post_audience === "subscribers" && (
          <LockedOverlay type="subscribers" />
        )}
        {!canView && data.post_audience === "price" && (
          <LockedOverlay type="price" />
        )}
      </div>
    );
  },
);

MediaGridItem.displayName = "MediaGridItem";
export default MediaGridItem;
