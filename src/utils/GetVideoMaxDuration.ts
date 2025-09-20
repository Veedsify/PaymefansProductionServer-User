function getMaxDurationBase64(file: File): Promise<Base64URLString> {
  if (!file) {
    return Promise.reject(new Error("No file provided."));
  }
  if (!file.type.startsWith("video/")) {
    return Promise.reject(new Error("File is not a video."));
  }
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = Math.ceil(video.duration);
      const base64Duration = btoa(duration.toString());
      resolve(base64Duration);
    };

    video.onerror = () => {
      reject(new Error("Failed to load video metadata."));
    };

    video.src = URL.createObjectURL(file);
  });
}

export { getMaxDurationBase64 };
