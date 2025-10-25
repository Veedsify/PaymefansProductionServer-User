// Removed framer-motion import to reduce bundle size
import Image from "next/image";
import React, { memo, Suspense } from "react";
import Loader from "../../components/common/loaders/LoadingAnimation";
import type { UserProfile } from "../media/mediaPreviewTypes";
import UserProfileOverlay from "./UserProfileOverlay";
import { cn } from "@/components/ui/cn";

type ImagePreviewProps = {
  url: string;
  alt: string;
  index: number;
  username?: string;
  onLoad: (index: number) => void;
  onError: () => void;
  userProfile?: UserProfile | null;
  shouldWatermark?: boolean;
  className?: string;
};

export const ImagePreview = memo(
  ({ url, alt, userProfile, className }: ImagePreviewProps) => {
    const [showProfile, setShowProfile] = React.useState(false);
    return (
      <Suspense
        fallback={
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 animate-in fade-in duration-200">
            <Loader />
          </div>
        }
      >
        <div
          onMouseEnter={() => setShowProfile(true)}
          onMouseLeave={() => setShowProfile(false)}
          onTouchStart={() => setShowProfile((prev) => !prev)} // Toggle on touch
        >
          {userProfile && showProfile && (
            <div className="absolute bottom-[5%] md:bottom-[5%] left-2 z-20 flex items-center gap-3 p-2 rounded-full">
              <UserProfileOverlay userProfile={userProfile} />
            </div>
          )}
          <Image
            src={url.trim()}
            alt={alt}
            priority
            width={1080}
            height={1080}
            className={cn(className, "h-auto")}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          />
        </div>
      </Suspense>
    );
  }
);
ImagePreview.displayName = "ImagePreview";
