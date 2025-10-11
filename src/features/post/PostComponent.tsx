"use client";

import {
  LucideEye,
  LucideLock,
  LucideRepeat2,
  LucideUsers,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import usePostComponent from "@/contexts/PostComponentPreview";
import { useAuthContext } from "@/contexts/UserUseContext";
import { usePostActions } from "@/hooks/usePostActions";
import { usePostPermissions } from "@/hooks/usePostPermissions";
import type { PostComponentProps, UserMediaProps } from "@/types/Components";
import { getSocket } from "../../components/common/Socket";
import MediaGridItem from "./components/MediaGridItem";
import { PostCompInteractions } from "./PostInteractions";
import QuickPostActions from "./QuickPostActions";
import FormatName from "@/lib/FormatName";
import { cn } from "@/components/ui/cn";
import { useGuestModal } from "@/contexts/GuestModalContext";

// Cache socket instance to prevent recreation on every render
let socketInstance: ReturnType<typeof getSocket> | null = null;
const getSocketInstance = () => {
  if (!socketInstance) {
    socketInstance = getSocket();
  }
  return socketInstance;
};

// Memoized audience icon component
const AudienceIcon = memo(({ audience }: { audience: string }) => {
  switch (audience) {
    case "public":
      return <LucideEye size={15} />;
    case "private":
      return <LucideLock size={15} />;
    case "subscribers":
      return <LucideUsers size={15} />;
    case "price":
      return (
        <Image src="/site/coin.svg" priority alt="" width={15} height={15} />
      );
    default:
      return null;
  }
});
AudienceIcon.displayName = "AudienceIcon";

const PostComponent = memo<PostComponentProps>(
  ({ user, data, was_repost, repost_username, isLast = false, repost_id }) => {
    const { user: authUser, isGuest } = useAuthContext();
    const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
    const { toggleModalOpen } = useGuestModal();
    const fullScreenPreview = usePostComponent(
      (state) => state.fullScreenPreview
    );

    // Use cached socket instance
    const socketRef = useRef(getSocketInstance());
    const socket = socketRef.current;

    // Custom hooks for complex logic
    const permissions = usePostPermissions(data, user, authUser);
    const actions = usePostActions(data, user, permissions);

    // Memoized user image with fallback - more stable reference
    const userImage = useMemo(
      () => user?.image?.trim() || "/site/avatar.svg",
      [user?.image]
    );

    // Memoized user profile for media preview - using stable keys
    const userProfile = useMemo(
      () => ({
        name: user.name,
        username: user.username,
        avatar: user.image,
      }),
      [user.name, user.username, user.image]
    );

    // Memoized post text processing - optimize string operations
    const { formattedText, needsProcessing } = useMemo(() => {
      // if (permissions.needsSubscription) {
      //   return {
      //     formattedText:
      //       "<p class='text-sm text-emerald-500'>This post is only available to subscribers</p>",
      //     needsProcessing: false,
      //   };
      // }

      // if (permissions.needsPayment) {
      //   return {
      //     formattedText:
      //       "<p class='text-sm text-emerald-500'>This post is only available to paid users</p>",
      //     needsProcessing: false,
      //   };
      // }

      const text = data.post.replace(/\r?\n/g, "<br/>");
      return {
        formattedText: text.length >= 1000 ? text.slice(0, 1000) + "..." : text,
        needsProcessing: true,
      };
    }, [data.post, permissions.needsSubscription, permissions.needsPayment]);

    // Memoized filtered media for better performance
    const filteredMediaUrls = useMemo(
      () =>
        data.media
          .filter((item) => item.media_state !== "processing")
          .map((media) => ({
            url: media.url,
            type: media.media_type as "video" | "image",
            isBlob: false,
          })),
      [data.media]
    );

    // Optimized media click handler with reduced dependencies
    const handleMediaClick = useCallback(
      (media: { url: string; media_type: string; index: number }) => {
        if (isGuest) {
          return toggleModalOpen("Please login to view this content");
        }

        if (permissions.needsSubscription) {
          return actions.promptSubscription();
        }

        fullScreenPreview({
          url: media.url,
          type: media.media_type,
          open: true,
          ref: media.index,
          userProfile,
          watermarkEnabled: !!data.watermark_enabled,
          username: data.user?.username,
          otherUrl: filteredMediaUrls,
        });
      },
      [
        permissions.needsSubscription,
        actions.promptSubscription,
        fullScreenPreview,
        userProfile,
        data.watermark_enabled,
        data.user?.username,
        filteredMediaUrls,
      ]
    );

    // Memoized grid configuration with better performance
    const { gridConfig, displayMedia } = useMemo(() => {
      const mediaCount = data.media.length;
      let config: string;

      if (mediaCount === 2) config = "grid-cols-2";
      else if (mediaCount >= 3) config = "grid-cols-3";
      else config = "grid-cols-1";

      return {
        gridConfig: config,
        displayMedia: data.media.slice(0, 3), // Pre-slice media array
      };
    }, [data.media]);

    // Optimize post view tracking with stable references
    useEffect(() => {
      if (data.post_status === "approved" && inView && authUser?.id && socket) {
        socket.emit("post-viewed", {
          userId: authUser.id,
          postId: data.id,
        });
      }
    }, [data.post_status, inView, authUser?.id, data.id, socket]);

    const repostMessage = useMemo(() => {
      if (was_repost && repost_username === authUser?.username) {
        return "You reposted";
      } else {
        return `${repost_username} reposted`;
      }
    }, [was_repost, repost_username]);

    return (
      <div
        className={cn(
          "px-2 pb-3 duration-300 md:px-5 relative",
          isLast && "border-b border-gray-300 dark:border-gray-700"
        )}
        key={data.post_id}
        ref={ref}
      >
        <div
          className="absolute inset-0 -z-10 cursor-pointer w-full h-full"
          onClick={actions.handlePostClick}
          role="link"
          data-href={`/posts/${data.post_id}`}
        ></div>
        <div
          className="cursor-pointer pt-12"
          onClick={actions.handlePostClick}
          role="link"
          data-href={`/posts/${data.post_id}`}
        >
          {was_repost && (
            <div className="mb-3 flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <LucideRepeat2 size={18} className="text-primary-dark-pink" />
              <Link
                href={`/posts/${repost_username}`}
                className="text-sm font-medium hover:text-emerald-500 transition-colors"
              >
                {repostMessage}
              </Link>
            </div>
          )}
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            <div className="flex items-center gap-1 md:gap-3 dark:text-white">
              <Image
                width={50}
                height={50}
                priority
                src={userImage}
                alt=""
                className="object-cover w-8 rounded-full md:w-10 aspect-square"
              />
              <Link
                href={user?.link}
                className="flex items-center text-xs gap-1 md:text-sm"
              >
                <p className="font-bold text-gray-800 dark:text-white ">
                  {FormatName(user.name)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 font-bold  hidden md:inline-block">
                  {user.username}
                </p>
              </Link>
              <small className="ml-auto">{data.time}</small>
              <div className="text-black dark:text-white">
                <AudienceIcon audience={data.post_audience} />
              </div>
            </div>
            <QuickPostActions
              options={{
                content: data.content,
                post_id: data.post_id,
                username: user.username,
                price: data?.post_price,
                post_audience: data.post_audience,
              }}
            />
          </div>
          <div
            className="py-2 leading-loose text-gray-700 dark:text-white"
            dangerouslySetInnerHTML={{ __html: formattedText as TrustedHTML }}
          />
          {/* Optimized Media Grid */}
          <div className={`grid gap-3 ${gridConfig}`}>
            {displayMedia.map((media: UserMediaProps, i) => (
              <MediaGridItem
                key={`${media.url}-${i}`}
                media={media}
                index={i}
                data={data}
                isSingle={displayMedia.length === 1}
                canView={permissions.canView}
                mediaLength={data.media.length}
                onNonSubscriberClick={
                  isGuest
                    ? actions.handlePostClick
                    : actions.handleNonSubscriberClick
                }
                onMediaClick={handleMediaClick}
                isSubscribed={permissions.isSubscribed}
              />
            ))}
          </div>
        </div>
        <PostCompInteractions data={data} />
      </div>
    );
  }
);

PostComponent.displayName = "PostComponent";
export default PostComponent;
