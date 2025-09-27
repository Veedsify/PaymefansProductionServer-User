import * as tus from "tus-js-client";

interface UploadOptions {
  file: File;
  uploadUrl: string;
  id: string;
  setProgress: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  setUploadError: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
}

interface UploadResult {
  mediaId: string;
  duration: number;
}

async function UploadWithTus({
  file,
  uploadUrl,
  id,
  setProgress,
  setUploadError,
}: UploadOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    let mediaId: string | null = null;
    let uploadComplete = false;
    let isResolved = false;
    let lastProgress = 0;
    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout;
    let mediaIdTimeoutId: NodeJS.Timeout | null = null;

    // Clear all timers and prevent multiple resolutions
    const cleanupAndReject = (error: Error) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutId);
      if (mediaIdTimeoutId) clearTimeout(mediaIdTimeoutId);
      setUploadError((prev) => ({ ...prev, [id]: true }));
      reject(error);
    };

    // Improved resolve logic with better waiting mechanism
    const tryResolve = () => {
      if (isResolved) return;

      if (uploadComplete && mediaId) {
        isResolved = true;
        clearTimeout(timeoutId);
        if (mediaIdTimeoutId) clearTimeout(mediaIdTimeoutId);
        resolve(mediaId);
      } else if (uploadComplete && !mediaId) {
        let waitTime = 0;
        const maxWaitTime = 30000; // 30 seconds
        const checkInterval = 1000; // Check every second

        const checkForMediaId = () => {
          waitTime += checkInterval;
          console.log(
            `🔍 Checking for mediaId (${waitTime / 1000}s/${maxWaitTime / 1000}s) for ${id}, current mediaId: ${mediaId || "null"}`,
          );

          if (mediaId && !isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);
            console.log(
              `✅ MediaId received after ${waitTime}ms for ${id}: ${mediaId}`,
            );
            resolve(mediaId);
          } else if (waitTime >= maxWaitTime && !isResolved) {
            console.error(
              `❌ MediaId timeout after ${waitTime}ms for ${id}. Upload may still be processing on server.`,
            );
            cleanupAndReject(
              new Error(
                `No media ID received after ${waitTime / 1000} seconds. Upload may still be processing on server. Please wait a moment and try again.`,
              ),
            );
          } else if (!isResolved) {
            mediaIdTimeoutId = setTimeout(checkForMediaId, checkInterval);
          }
        };

        mediaIdTimeoutId = setTimeout(checkForMediaId, checkInterval);
      }
    };

    // Increased timeout to 15 minutes for large video files
    timeoutId = setTimeout(() => {
      console.error(`⏰ Upload timeout after 15 minutes for ${id}`);
      cleanupAndReject(new Error("Upload timeout after 15 minutes"));
    }, 900000);

    const upload = new tus.Upload(file, {
      endpoint: uploadUrl,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: 8388608, // 8MB
      uploadSize: file.size,
      metadata: {
        name: file.name,
        filetype: file.type,
      },

      onError: (error) => cleanupAndReject(error),

      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.floor((bytesUploaded / bytesTotal) * 100);
        // Only update state when progress changes
        if (percentage !== lastProgress) {
          lastProgress = percentage;
          setProgress((prev) => ({ ...prev, [id]: percentage - 1 }));
        }
      },

      onSuccess: () => {
        console.log(`🎯 Upload onSuccess triggered for ${id}`);
        uploadComplete = true;
        setProgress((prev) => ({ ...prev, [id]: 100 }));
        tryResolve();
      },

      onAfterResponse: (_, res) => {
        const mediaIdHeader = res.getHeader("Stream-Media-Id");
        if (mediaIdHeader) {
          mediaId = mediaIdHeader;
          tryResolve();
        }
      },
    });

    upload.start();
  });
}

export default UploadWithTus;
