"use client"
export const generatePosterFromVideo = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.currentTime = 5; // Capture the thumbnail at 1 second
        video.crossOrigin = "anonymous"; // For handling cross-origin if necessary
        video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(URL.createObjectURL(blob));
                    } else {
                        reject(new Error("Canvas to blob conversion failed"));
                    }
                }, 'image/jpeg');
            } else {
                reject(new Error("Canvas context is null"));
            }
        };
        video.onerror = (error) => {
            reject(error);
        };
    });
};
