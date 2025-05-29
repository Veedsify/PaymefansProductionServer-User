const compressVideo = async (file: File): Promise<File> => {
    // Check if running on client side
    if (typeof window === 'undefined') {
        throw new Error('Video compression only works in browser');
    }

    // Dynamic import to avoid SSR issues
    const [{ FFmpeg }, { toBlobURL, fetchFile }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util")
    ]);

    const ffmpeg = new FFmpeg();

    // FIXED: Updated loading logic for newer FFmpeg.wasm versions
    if (!ffmpeg.loaded) {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
    }

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    // FIXED: Updated file writing syntax
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Compress: lower bitrate, re-encode, etc.
    await ffmpeg.exec([
        "-i", inputFileName,
        "-vcodec", "libx264",
        "-crf", "28", // adjust for compression level (28 is reasonable, 23 is default)
        "-preset", "veryfast",
        "-movflags", "faststart",
        outputFileName
    ]);

    // FIXED: Updated file reading syntax
    const data = await ffmpeg.readFile(outputFileName);

    // Clean up files from FFmpeg filesystem
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    // FIXED: Handle Uint8Array data properly - use the Uint8Array directly
    const uint8Array = data as Uint8Array;
    return new File([uint8Array], file.name, { type: "video/mp4" });
};

export default compressVideo;