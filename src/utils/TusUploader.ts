import * as tus from "tus-js-client";

interface UploadOptions {
  file: File;
  uploadUrl: string;
  id: string;
  setProgress: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  setUploadError: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
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
  setUploadError
}: UploadOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    let mediaId: string | null = null;
    let uploadComplete = false;
    let isResolved = false;
    let lastProgress = 0;
    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout;

    // Clear all timers and prevent multiple resolutions
    const cleanupAndReject = (error: Error) => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(timeoutId);
      setUploadError(prev => ({ ...prev, [id]: true }));
      reject(error);
    };

    // Resolve when both conditions are met
    const tryResolve = () => {
      if (isResolved) return;

      if (uploadComplete && mediaId) {
        isResolved = true;
        clearTimeout(timeoutId);
        resolve(mediaId);
      } else if (uploadComplete && !mediaId) {
        // Wait a bit more for media ID
        setTimeout(() => {
          if (!isResolved) {
            cleanupAndReject(new Error("No media ID received after upload completion"));
          }
        }, 5000);
      }
    };

    // Set 10-minute timeout
    timeoutId = setTimeout(() => {
      cleanupAndReject(new Error("Upload timeout after 10 minutes"));
    }, 600000);

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
          setProgress(prev => ({ ...prev, [id]: percentage }));
        }
      },

      onSuccess: () => {
        uploadComplete = true;
        setProgress(prev => ({ ...prev, [id]: 100 }));
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