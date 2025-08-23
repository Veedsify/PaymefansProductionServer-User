"use client";

import React, { memo } from "react";
import usePostComponent from "@/contexts/PostComponentPreview";
import MediaPreviewModal from "../common/MediaPreviewModal";

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
  } = usePostComponent();

  return (
    <MediaPreviewModal
      open={open}
      onClose={close}
      mediaItems={otherUrl || []}
      initialIndex={typeof objectRef === "number" ? objectRef : 0}
      username={username}
      userProfile={userProfile}
      watermarkEnabled={watermarkEnabled}
    />
  );
});
PostComponentPreview.displayName = "PostComponentPreview";

export default PostComponentPreview;
