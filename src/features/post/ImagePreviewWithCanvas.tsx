import { AnimatePresence, motion } from "framer-motion";
import { LucideUser, LucideUser2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo, Suspense } from "react";
import Loader from "../../components/common/loaders/LoadingAnimation";
import { MEDIA_CONSTANTS, type UserProfile } from "../../providers";
import UserProfileOverlay from "./UserProfileOverlay";

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
    return (
      <Suspense
        fallback={
          <AnimatePresence>
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <Loader />
            </motion.div>
          </AnimatePresence>
        }
      >
        <div className="absolute inset-0 left-0 select-none flex items-center justify-center">
          {userProfile && (
            <div className="absolute bottom-[10%] md:bottom-[5%] left-2 z-20 flex items-center gap-3 p-2 rounded-full">
              <UserProfileOverlay userProfile={userProfile} />
            </div>
          )}
          <Image
            src={url.trim()}
            alt={alt}
            priority
            quality={100}
            width={1080}
            height={1080}
            className={className}
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
  },
);
ImagePreview.displayName = "ImagePreview";
