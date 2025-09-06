"use client";

import React, { memo, useEffect, useMemo } from "react";
import usePostComponent from "@/contexts/PostComponentPreview";
import MediaPreviewModal from "../media/MediaPreviewModal";

// Main Component
const PostComponentPreview = memo(() => {
  const objectRef = usePostComponent((state) => state.ref);
  const otherUrl = usePostComponent((state) => state.otherUrl);
  const open = usePostComponent((state) => state.open);
  const close = usePostComponent((state) => state.close);
  const username = usePostComponent((state) => state.username);
  const userProfile = usePostComponent((state) => state.userProfile);
  const watermarkEnabled = usePostComponent((state) => state.watermarkEnabled);
  const [rendered, setRendered] = React.useState(false);

  const mediaItems = useMemo(() => otherUrl || [], [otherUrl]);
  const userProfileOverlay = useMemo(() => userProfile, [userProfile]);
  const initialIndex = useMemo(
    () => (typeof objectRef === "number" ? objectRef : 0),
    [objectRef]
  );

  useEffect(() => {
    if (open) {
      setRendered(true);
    }
    return () => {
      setRendered(false);
    };
  }, [open]);

  if (!rendered) return null;
  return (
    <MediaPreviewModal
      open={open}
      onClose={close}
      mediaItems={mediaItems}
      initialIndex={initialIndex}
      username={username}
      userProfile={userProfileOverlay || null}
      watermarkEnabled={watermarkEnabled}
    />
  );
});
PostComponentPreview.displayName = "PostComponentPreview";

export default PostComponentPreview;
