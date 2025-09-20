"use client";

import { LucideEye, LucideLock, LucideUsers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import usePostComponent from "@/contexts/PostComponentPreview";
import { useAuthContext } from "@/contexts/UserUseContext";
import { usePostActions } from "@/hooks/usePostActions";
import { usePostPermissions } from "@/hooks/usePostPermissions";
import { usePostPreviewState } from "@/hooks/usePostPreviewSelectors";
import type { PostComponentProps, UserMediaProps } from "@/types/Components";
import { getSocket } from "../../components/common/Socket";
import MediaGridItem from "./components/MediaGridItem";
import { PostCompInteractions } from "./PostInteractions";
import QuickPostActions from "./QuickPostActions";

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
  ({ user, data, was_repost, repost_username, repost_id }) => {
    const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
    const fullScreenPreview = usePostComponent(
      (state) => state.fullScreenPreview,
    );
    const { user: authUser } = useAuthContext();
    const socket = getSocket();

    // Custom hooks for complex logic
    const permissions = usePostPermissions(data, user, authUser);
    const actions = usePostActions(data, user, permissions);

    // Memoized user image with fallback
    const userImage = useMemo(
      () => user?.image?.trim() || "/site/avatar.svg",
      [user?.image],
    );

    // Memoized user profile for media preview
    const userProfile = useMemo(
      () => ({
        name: user.name,
        username: user.username,
        avatar: user.image,
      }),
      [user.name, user.username, user.image],
    );

    // Memoized formatted text with permission checks
    const formattedText = useMemo(() => {
      const text = data.post.replace(/\r?\n/g, "<br/>");

      if (permissions.needsSubscription) {
        return "<p class='text-sm text-emerald-500'>This post is only available to subscribers</p>";
      }

      if (permissions.needsPayment) {
        return "<p class='text-sm text-emerald-500'>This post is only available to paid users</p>";
      }

      return text.length >= 1000 ? text.slice(0, 1000) + "..." : text;
    }, [data.post, permissions.needsSubscription, permissions.needsPayment]);

    // Memoized media click handler
    const handleMediaClick = useCallback(
      (media: { url: string; media_type: string; index: number }) => {
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
          otherUrl: data.media
            .filter((item) => item.media_state !== "processing")
            .map((media) => ({
              url: media.url,
              type: media.media_type as "video" | "image",
              isBlob: false,
            })),
        });
      },
      [
        permissions.needsSubscription,
        actions.promptSubscription,
        fullScreenPreview,
        userProfile,
        data.watermark_enabled,
        data.user?.username,
        data.media,
      ],
    );

    // Memoized grid configuration
    const gridConfig = useMemo(() => {
      const mediaCount = data.media.length;
      if (mediaCount === 2) return "grid-cols-2";
      if (mediaCount >= 3) return "grid-cols-3";
      return "grid-cols-1";
    }, [data.media.length]);

    // Track post views
    useEffect(() => {
      if (data.post_status === "approved" && inView && authUser?.id) {
        socket?.emit("post-viewed", {
          userId: authUser.id,
          postId: data.id,
        });
      }
    }, [data.post_status, inView, authUser?.id, data.id, socket]);

    return (
      <div className="px-2 py-6 duration-300 md:px-5">
        <div
          className="cursor-pointer"
          ref={ref}
          onClick={actions.handlePostClick}
          role="link"
          data-href={`/posts/${data.post_id}`}
        >
          {was_repost && (
            <div className="mb-3">
              <Link
                href={`/posts/${repost_id}`}
                className="inline-block px-2 py-1 text-xs font-bold text-purple-700 bg-purple-200 rounded-md"
              >
                Reposted from {repost_username}
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
                  {user.name}
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
            {data.media.slice(0, 3).map((media: UserMediaProps, i) => (
              <MediaGridItem
                key={`${media.url}-${i}`}
                media={media}
                index={i}
                data={data}
                canView={permissions.canView}
                mediaLength={data.media.length}
                onNonSubscriberClick={actions.handleNonSubscriberClick}
                onMediaClick={handleMediaClick}
                isSubscribed={permissions.isSubscribed}
              />
            ))}
          </div>
        </div>
        <PostCompInteractions data={data} />
      </div>
    );
  },
);

PostComponent.displayName = "PostComponent";
export default PostComponent;
