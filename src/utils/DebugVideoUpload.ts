import * as tus from "tus-js-client";

interface DebugUploadResult {
  success: boolean;
  mediaId?: string;
  error?: string;
  duration: number;
  progressLog: number[];
}

/**
 * Debug helper to test video upload completion issues
 */
const debugVideoUpload = async (
  file: File,
  uploadUrl: string,
): Promise<DebugUploadResult> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const progressLog: number[] = [];
    let mediaId: string | null = null;
    let uploadComplete = false;
    let hasError = false;
    let errorMessage = "";

    console.log("🚀 Starting debug video upload for:", file.name);
    console.log("📁 File size:", file.size, "bytes");
    console.log("🔗 Upload URL:", uploadUrl);

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
        hasError = true;
        errorMessage = error.message || "Unknown error";
        console.error("❌ Upload failed:", error);

        resolve({
          success: false,
          error: errorMessage,
          duration: Date.now() - startTime,
          progressLog,
        });
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = Math.floor((bytesUploaded / bytesTotal) * 100);

        // Log every 10% increment
        if (percentage % 10 === 0 && !progressLog.includes(percentage)) {
          progressLog.push(percentage);
          console.log(
            `📈 Progress: ${percentage}% (${bytesUploaded}/${bytesTotal} bytes)`,
          );
        }
      },
      onSuccess: function () {
        uploadComplete = true;
        console.log("✅ Upload onSuccess called");
        console.log("⏱️  Upload duration:", Date.now() - startTime, "ms");

        // If we already have mediaId, resolve immediately
        if (mediaId) {
          console.log("🎯 Resolving with existing mediaId:", mediaId);
          resolve({
            success: true,
            mediaId,
            duration: Date.now() - startTime,
            progressLog,
          });
        } else {
          console.log("⏳ Waiting for mediaId from onAfterResponse...");

          // Wait up to 10 seconds for mediaId
          setTimeout(() => {
            if (mediaId) {
              console.log("🎯 Delayed mediaId received:", mediaId);
              resolve({
                success: true,
                mediaId,
                duration: Date.now() - startTime,
                progressLog,
              });
            } else {
              console.error("⚠️  No mediaId received after 10 seconds");
              resolve({
                success: false,
                error: "No media ID received after upload completion",
                duration: Date.now() - startTime,
                progressLog,
              });
            }
          }, 10000);
        }
      },
      onAfterResponse: function (req, res) {
        const mediaIdHeader = res.getHeader("Stream-Media-Id");
        console.log("🔄 onAfterResponse called");
        console.log("📋 Response headers:", {
          "Stream-Media-Id": mediaIdHeader,
          "Content-Type": res.getHeader("Content-Type"),
          Status: res.getStatus(),
        });

        if (mediaIdHeader) {
          mediaId = mediaIdHeader;
          console.log("🆔 MediaId received:", mediaId);

          // If upload is complete, resolve immediately
          if (uploadComplete) {
            console.log("🎯 Resolving with mediaId after upload completion");
            resolve({
              success: true,
              mediaId,
              duration: Date.now() - startTime,
              progressLog,
            });
          }
        } else {
          console.warn("⚠️  No Stream-Media-Id header found in response");
        }
      },
    });

    // Start the upload
    upload.start();

    // Safety timeout (15 minutes)
    setTimeout(() => {
      if (!hasError && !mediaId) {
        console.error("⏰ Upload timeout after 15 minutes");
        resolve({
          success: false,
          error: "Upload timeout",
          duration: Date.now() - startTime,
          progressLog,
        });
      }
    }, 900000);
  });
};

/**
 * Test video upload with detailed logging
 */
const testVideoUploadCompletion = async (
  file: File,
  uploadUrl: string,
): Promise<void> => {
  console.log("🧪 Testing video upload completion...");

  try {
    const result = await debugVideoUpload(file, uploadUrl);

    console.log("📊 Upload Test Results:");
    console.log("Success:", result.success);
    console.log("Duration:", result.duration + "ms");
    console.log("Progress Log:", result.progressLog);

    if (result.success) {
      console.log("✅ Upload completed successfully!");
      console.log("Media ID:", result.mediaId);
    } else {
      console.log("❌ Upload failed:");
      console.log("Error:", result.error);
    }
  } catch (error) {
    console.error("🚨 Test failed with exception:", error);
  }
};

/**
 * Monitor upload status in real-time
 */
export const monitorUploadStatus = (
  mediaFiles: any[],
  interval: number = 1000,
): (() => void) => {
  const intervalId = setInterval(() => {
    console.log("📊 Current upload status:");
    mediaFiles.forEach((file) => {
      console.log(
        `  ${file.id}: ${file.uploadStatus} (${file.uploadProgress || 0}%)`,
      );
    });

    const allComplete = mediaFiles.every(
      (file) =>
        file.uploadStatus === "completed" || file.uploadStatus === "error",
    );

    if (allComplete) {
      console.log("🏁 All uploads completed!");
      clearInterval(intervalId);
    }
  }, interval);

  // Return cleanup function
  return () => clearInterval(intervalId);
};
