import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  useMemo,
} from "react";
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

const WatermarkedCanvas = memo(
  ({
    url,
    index,
    username,
    onDraw,
  }: {
    url: string;
    index: number;
    username?: string;
    onDraw: (index: number) => void;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const img = new window.Image();
      img.crossOrigin = "anonymous"; // required for CORS-safe CDN images
      img.src = url.trim();

      img.onload = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Calculate aspect ratios
        const imgAspect = img.width / img.height;
        const containerAspect = containerWidth / containerHeight;

        let drawWidth, drawHeight;

        // Fit image within container while maintaining aspect ratio
        if (imgAspect > containerAspect) {
          // Image is wider relative to container
          drawWidth = containerWidth;
          drawHeight = containerWidth / imgAspect;
        } else {
          // Image is taller relative to container
          drawHeight = containerHeight;
          drawWidth = containerHeight * imgAspect;
        }

        // Set canvas size to match the display size
        canvas.width = drawWidth;
        canvas.height = drawHeight;

        // Set canvas display size
        canvas.style.width = `${drawWidth}px`;
        canvas.style.height = `${drawHeight}px`;

        // Draw image scaled to fit
        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

        // Draw watermark
        const watermark = `paymefans.com/${username?.startsWith("@") ? username.slice(1) : username}`;
        const fontSize = Math.floor(drawWidth * 0.04); // Responsive text size based on display width
        ctx.font = `${fontSize}px Arial`;

        // Add shadow
        ctx.shadowColor = "black";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 2;

        ctx.fillStyle = "#ddd";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(watermark, 20, drawHeight - 20);

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        onDraw(index);
      };

      img.onerror = () => {
        console.warn("Canvas failed to load image:", url);
      };
    }, [url, index, onDraw]);

    // Handle resize
    useEffect(() => {
      const handleResize = () => {
        // Trigger image reload to recalculate dimensions
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = url.trim();

        img.onload = () => {
          const canvas = canvasRef.current;
          const container = containerRef.current;
          if (!canvas || !container) return;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const containerRect = container.getBoundingClientRect();
          const containerWidth = containerRect.width;
          const containerHeight = containerRect.height;

          const imgAspect = img.width / img.height;
          const containerAspect = containerWidth / containerHeight;

          let drawWidth, drawHeight;

          if (imgAspect > containerAspect) {
            drawWidth = containerWidth;
            drawHeight = containerWidth / imgAspect;
          } else {
            drawHeight = containerHeight;
            drawWidth = containerHeight * imgAspect;
          }

          canvas.width = drawWidth;
          canvas.height = drawHeight;
          canvas.style.width = `${drawWidth}px`;
          canvas.style.height = `${drawHeight}px`;

          ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

          // Redraw watermark
          const watermark = "http://paymefans.com/@paymefans";
          const fontSize = Math.floor(drawWidth * 0.015);
          ctx.font = `${fontSize}px Arial`;
          ctx.shadowColor = "black";
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.shadowBlur = 2;
          ctx.fillStyle = "#ddd";
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";
          ctx.fillText(watermark, 20, drawHeight - 20);
          ctx.shadowColor = "transparent";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
        };
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [url]);

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    );
  },
);
WatermarkedCanvas.displayName = "WatermarkedCanvas";

export const ImagePreview = memo(
  ({
    url,
    alt,
    index,
    onLoad,
    username,
    onError,
    shouldWatermark = false,
  }: ImagePreviewProps) => {
    const [status, setStatus] = useState<"loading" | "ready" | "error">(
      "loading",
    );

    const isSlowNetwork =
      typeof navigator !== "undefined" &&
      (navigator as any).connection?.saveData;

    const handleImageLoad = useCallback(
      (i: number) => {
        setStatus("ready");
        onLoad(i);
      },
      [onLoad],
    );

    const handleImageError = useCallback(() => {
      setStatus("error");
      onError();
      console.warn(`Image failed to load at index ${index}: ${url}`);
    }, [onError, index, url]);

    const imageQuality = useMemo(
      () =>
        isSlowNetwork
          ? CONSTANTS.IMAGE_QUALITY.LOW
          : index < 3
            ? CONSTANTS.IMAGE_QUALITY.HIGH
            : CONSTANTS.IMAGE_QUALITY.MEDIUM,
      [index, isSlowNetwork],
    );

    return (
      <motion.div
        className="relative flex h-full w-full items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: CONSTANTS.ANIMATION_DURATION_SEC,
          type: "spring",
        }}
      >
        <AnimatePresence>
          {status === "loading" && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/20 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <Loader />
            </motion.div>
          )}
        </AnimatePresence>

        {status !== "error" ? (
          shouldWatermark && username !== undefined ? (
            <WatermarkedCanvas
              url={url}
              index={index}
              username={username}
              onDraw={handleImageLoad}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src={url.trim()}
                onLoad={() => handleImageLoad(index)}
                onError={handleImageError}
                alt={alt}
                fill
                sizes="100vw"
                className={`object-contain transition-opacity duration-200 ${
                  status === "loading" ? "opacity-0" : "opacity-100"
                }`}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            </div>
          )
        ) : (
          <div className="text-red-500 text-center">
            {alt || "Image failed to load"}
          </div>
        )}
      </motion.div>
    );
  },
);
ImagePreview.displayName = "ImagePreview";
