import * as tus from "tus-js-client";

async function UploadWithTus(
  file: File,
  uploadUrl: string,
  id: string,
  setProgress: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
  setUploadError: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let mediaId: string | null = null;
    let uploadComplete = false;
    let resolved = false;
    let lastProgress = 0;
    const startTime = Date.now();

    console.log("🚀 Starting TUS upload for:", file.name, "ID:", id);
    console.log("📁 File size:", file.size, "bytes");
    console.log("🔗 Upload URL:", uploadUrl);

    // Timeout after 10 minutes for large files
    const timeout = setTimeout(() => {
      if (!resolved) {
        const duration = Date.now() - startTime;
        console.error(
          "⏰ Upload timeout after",
          duration,
          "ms for:",
          file.name,
        );
        console.log(
          "📊 Final state - uploadComplete:",
          uploadComplete,
          "mediaId:",
          mediaId,
        );
        setUploadError((prev) => ({
          ...prev,
          [id]: true,
        }));
        reject(new Error("Upload timeout"));
      }
    }, 600000); // 10 minutes

    const tryResolve = () => {
      if (resolved) {
        console.log("⚠️ tryResolve called but already resolved");
        return;
      }

      console.log(
        "🔄 tryResolve called - uploadComplete:",
        uploadComplete,
        "mediaId:",
        !!mediaId,
      );

      // Only resolve when BOTH upload is complete AND we have mediaId
      if (uploadComplete && mediaId) {
        resolved = true;
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        console.log(
          "✅ Upload fully completed:",
          file.name,
          "Duration:",
          duration,
          "ms",
        );
        console.log("🆔 MediaId:", mediaId);
        setProgress({
          [id]: 100,
        });
        resolve(mediaId);
      } else {
        // Log what we're still waiting for
        if (!uploadComplete) {
          console.log("⏳ Still waiting for upload completion...");
        }
        if (!mediaId) {
          console.log("⏳ Still waiting for media ID...");
        }

        // If we have both but something went wrong, wait a bit and try again
        if (uploadComplete && !mediaId) {
          setTimeout(() => {
            if (!resolved) {
              if (mediaId) {
                tryResolve(); // Try again now that we might have mediaId
              } else {
                resolved = true;
                clearTimeout(timeout);
                const duration = Date.now() - startTime;
                console.error(
                  "❌ Upload completed but no media ID received for:",
                  file.name,
                  "Duration:",
                  duration,
                  "ms",
                );
                setUploadError((prev) => ({
                  ...prev,
                  [id]: true,
                }));
                reject(new Error("No media ID received"));
              }
            }
          }, 5000); // Wait 5 seconds for media ID
        }
      }
    };

    const upload = new tus.Upload(file, {
      endpoint: uploadUrl,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: 8388608,
      uploadSize: file.size,
      metadata: {
        name: file.name,
        filetype: file.type,
      },
      onError: function (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          const duration = Date.now() - startTime;
          console.error(
            "❌ Upload failed:",
            error,
            "Duration:",
            duration,
            "ms",
          );
          console.log(
            "📊 Error state - uploadComplete:",
            uploadComplete,
            "mediaId:",
            mediaId,
            "lastProgress:",
            lastProgress,
          );
          setUploadError((prev) => ({
            ...prev,
            [id]: true,
          }));
          reject(error);
        }
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = parseFloat(
          ((bytesUploaded / bytesTotal) * 100).toFixed(2),
        );
        const roundedPercentage = Math.floor(percentage);

        // Only update if progress changed
        if (roundedPercentage !== lastProgress) {
          lastProgress = roundedPercentage;
          setProgress((prev) => ({
            ...prev,
            [id]: roundedPercentage,
          }));

          // Log every 10% but don't log 100% here (wait for completion)
          if (roundedPercentage % 10 === 0 && roundedPercentage < 100) {
            console.log(
              "📈",
              file.name,
              "progress:",
              roundedPercentage + "%",
              `(${bytesUploaded}/${bytesTotal})`,
            );
          }
        }
      },
      onSuccess: function () {
        const duration = Date.now() - startTime;
        console.log(
          "✅ onSuccess called for:",
          file.name,
          "Duration:",
          duration,
          "ms",
        );
        console.log(
          "📊 Success state - mediaId:",
          !!mediaId,
          "uploadComplete:",
          uploadComplete,
        );
        uploadComplete = true;

        // Set progress to 99% to show upload is done but processing
        setProgress((prev) => ({
          ...prev,
          [id]: 99,
        }));

        console.log(
          "📡 Upload finished (99%), waiting for media ID before completion...",
        );
        tryResolve();
      },
      onAfterResponse: function (req, res) {
        const mediaIdHeader = res.getHeader("Stream-Media-Id");
        const status = res.getStatus();
        const contentType = res.getHeader("Content-Type");

        console.log("🔄 onAfterResponse called for:", file.name);
        console.log("📋 Response status:", status);
        console.log("📋 Content-Type:", contentType);
        console.log("🆔 Stream-Media-Id header:", mediaIdHeader);

        if (mediaIdHeader) {
          console.log("🆔 MediaId received:", mediaIdHeader);
          mediaId = mediaIdHeader;
          console.log(
            "📡 Media ID received, checking if upload is complete...",
          );
          tryResolve();
        } else {
          console.warn("⚠️ No Stream-Media-Id header found in response");
          console.log(
            "📋 All response headers:",
            "Header inspection not available in TUS client",
          );
        }
      },
    });

    console.log("🎬 Starting upload...");
    upload.start();
  });
}
export default UploadWithTus;
