import React, { memo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../lib_components/LoadingAnimation";
import { CONSTANTS } from "./FullComponentPreview";
import Image from "next/image";

type ImagePreviewProps = {
  url: string;
  alt: string;
  index: number;
  username?: string;
  onLoad: (index: number) => void;
  onError: () => void;
  shouldWatermark?: boolean;
};

export const ImagePreview = memo(({ url, alt }: ImagePreviewProps) => {
  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: CONSTANTS.ANIMATION_DURATION_SEC,
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
              className="absolute inset-0 flex items-center justify-center bg-black/20 z-10"
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
          className="w-full h-full flex items-center justify-center overflow-hidden"
        >
          <Image
            src={url.trim()}
            alt={alt}
            fill
            priority
            sizes="100vw"
            quality={100}
            className={`object-contain transition-opacity duration-200 ${
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
        </motion.div>
      </Suspense>
    </motion.div>
  );
});
ImagePreview.displayName = "ImagePreview";
