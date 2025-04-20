import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { generatePosterFromVideo } from "@/lib/video-poster";
import { imageTypes, videoTypes } from "@/lib/filetypes";
import { MediaContextState, MediaFile } from "@/types/message-components";

const MediaContext = createContext<MediaContextState | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const addFiles = useCallback(async (files: FileList) => {
    const newMediaFiles: MediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);

      if (imageTypes.includes(file.type)) {
        newMediaFiles.push({
          file,
          type: "image",
          previewUrl,
          posterUrl: previewUrl,
        });
      } else if (videoTypes.includes(file.type)) {
        const posterUrl = await generatePosterFromVideo(file);
        newMediaFiles.push({
          file,
          type: "video",
          previewUrl,
          posterUrl,
        });
      }
    }

    setMediaFiles((prev) => [...prev, ...newMediaFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setMediaFiles((prev) => {
      const newFiles = [...prev];
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(newFiles[index].previewUrl);
      if (
        newFiles[index].posterUrl &&
        newFiles[index].posterUrl !== newFiles[index].previewUrl
      ) {
        URL.revokeObjectURL(newFiles[index].posterUrl!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const resetAll = useCallback(() => {
    // Clean up URLs to prevent memory leaks
    mediaFiles.forEach((file) => {
      URL.revokeObjectURL(file.previewUrl);
      if (file.posterUrl && file.posterUrl !== file.previewUrl) {
        URL.revokeObjectURL(file.posterUrl);
      }
    });

    setMediaFiles([]);
    setMessage("");
    setIsModalOpen(false);
  }, [mediaFiles]);

  return (
    <MediaContext.Provider
      value={{
        mediaFiles,
        message,
        isModalOpen,
        addFiles,
        removeFile,
        setMessage,
        openModal,
        closeModal,
        resetAll,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMediaContext = (): MediaContextState => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error("useMediaContext must be used within a MediaProvider");
  }
  return context;
};
