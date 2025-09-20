// Helper function to generate video poster/thumbnail
const GenerateVideoPoster = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    video.addEventListener("loadedmetadata", () => {
      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to 1 second or 10% of duration, whichever is smaller
      video.currentTime = Math.min(1, video.duration * 0.1);
    });

    video.addEventListener("seeked", () => {
      // Draw the current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and create URL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error("Failed to create poster blob"));
          }
        },
        "image/jpeg",
        0.8,
      );

      // Clean up
      video.remove();
      canvas.remove();
    });

    video.addEventListener("error", () => {
      reject(new Error("Failed to load video"));
      video.remove();
      canvas.remove();
    });

    video.src = URL.createObjectURL(file);
    video.load();
  });
};

export default GenerateVideoPoster;
