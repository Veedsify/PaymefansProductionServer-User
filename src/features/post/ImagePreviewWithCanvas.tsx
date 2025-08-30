import React, { memo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/common/loaders/LoadingAnimation";
import Image from "next/image";
import { MEDIA_CONSTANTS, UserProfile } from "../../providers";
import { LucideUser, LucideUser2 } from "lucide-react";
import Link from "next/link";
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
};

export const ImagePreview = memo(
  ({ url, alt, userProfile }: ImagePreviewProps) => {
    return (
      <motion.div
        className="relative flex items-center justify-center w-full h-full overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: MEDIA_CONSTANTS.ANIMATION_DURATION_SEC,
          type: "spring",
        }}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center w-full h-full overflow-hidden relative"
          >
            <div className="relative w-full h-full select-none object-contain">
              {userProfile && (
                <div className="absolute bottom-10 left-2 z-20 flex items-center gap-3 p-2 rounded-full">
                  <UserProfileOverlay userProfile={userProfile} />
                </div>
              )}
              <Image
                src={url.trim()}
                alt={alt}
                priority
                quality={100}
                width={1920}
                height={1920}
                className={`object-contain w-full h-full transition-opacity duration-200 ${
                  status === "loading" ? "opacity-0" : "opacity-100"
                }`}
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
          </motion.div>
        </Suspense>
      </motion.div>
    );
  }
);
ImagePreview.displayName = "ImagePreview";
