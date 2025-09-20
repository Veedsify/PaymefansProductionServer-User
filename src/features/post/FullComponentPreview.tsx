"use client";

import { LucideLoader } from "lucide-react";
import dynamic from "next/dynamic";
import React, { lazy, memo, Suspense, useCallback, useMemo } from "react";
import MediaPreviewErrorBoundary from "@/components/error-boundaries/MediaPreviewErrorBoundary";
import { usePostPreviewState } from "@/hooks/usePostPreviewSelectors";

// Lazy load the heavy MediaPreviewModal component
const MediaPreviewModal = dynamic(() => import("../media/MediaPreviewModal"));

// Optimized loading fallback
const ModalLoader = memo(() => (
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-90"
    role="dialog"
    aria-modal="true"
    aria-label="Loading media preview"
  >
    {/* <div className="flex items-center space-x-2 text-white">
      <div
        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
        aria-hidden="true"
      />
      <span>
        <LucideLoader className="w-6 h-6 animate-spin" aria-hidden="true" />
      </span>
    </div> */}
  </div>
));
ModalLoader.displayName = "ModalLoader";

// Main Component
const PostComponentPreview = memo(() => {
  const {
    ref: objectRef,
    otherUrl,
    open,
    close,
    username,
    userProfile,
    watermarkEnabled,
  } = usePostPreviewState();

  // Stable close handler to prevent re-renders
  const handleClose = useCallback(() => {
    close();
  }, [close]);

  // Memoize modal props with validation
  const modalProps = useMemo(() => {
    if (!open || !otherUrl?.length) return null;

    // Validate initial index
    const validIndex =
      typeof objectRef === "number" && objectRef >= 0
        ? Math.min(objectRef, otherUrl.length - 1)
        : 0;

    return {
      open,
      onClose: handleClose,
      mediaItems: otherUrl,
      initialIndex: validIndex,
      username: username || "",
      userProfile: userProfile || null,
      watermarkEnabled: watermarkEnabled ?? false,
    };
  }, [
    open,
    otherUrl,
    objectRef,
    handleClose,
    username,
    userProfile,
    watermarkEnabled,
  ]);

  // Early return if modal should not be rendered
  if (!open || !modalProps) {
    return null;
  }

  return (
    <MediaPreviewErrorBoundary>
      <Suspense fallback={<ModalLoader />}>
        <MediaPreviewModal {...modalProps} />
      </Suspense>
    </MediaPreviewErrorBoundary>
  );
});
PostComponentPreview.displayName = "PostComponentPreview";

export default PostComponentPreview;
