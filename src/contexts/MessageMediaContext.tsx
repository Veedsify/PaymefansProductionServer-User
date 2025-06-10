import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import { generatePosterFromVideo } from "@/lib/VideoPoster";
import { imageTypes, videoTypes } from "@/lib/FileTypes";
import { MediaContextState, MediaFile } from "@/types/MessageComponents";

// Define stricter types for MediaFile
interface StrictMediaFile extends MediaFile {
  file: File;
  type: "image" | "video";
  previewUrl: string;
  posterUrl?: string;
}

const MediaContext = createContext<MediaContextState | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mediaFiles, setMediaFiles] = useState<StrictMediaFile[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Add files with concurrent poster generation and error handling
  const addFiles = useCallback(async (files: FileList) => {
    try {
      const newMediaFilesPromises = Array.from(files).map(async (file) => {
        if (
          !imageTypes.includes(file.type) &&
          !videoTypes.includes(file.type)
        ) {
          throw new Error(`Unsupported file type: ${file.type}`);
        }

        const previewUrl = URL.createObjectURL(file);
        let mediaFile: StrictMediaFile = {
          file,
          type: imageTypes.includes(file.type) ? "image" : "video",
          previewUrl,
          posterUrl: imageTypes.includes(file.type) ? previewUrl : undefined,
        };

        if (videoTypes.includes(file.type)) {
          try {
            const posterUrl = await generatePosterFromVideo(file);
            mediaFile = { ...mediaFile, posterUrl };
          } catch (error) {
            console.error(`Failed to generate poster for ${file.name}:`, error);
            URL.revokeObjectURL(previewUrl); // Clean up on failure
            throw error;
          }
        }

        return mediaFile;
      });

      const newMediaFiles = await Promise.all(newMediaFilesPromises);
      setMediaFiles((prev) => [...prev, ...newMediaFiles]);
    } catch (error) {
      console.error("Error adding files:", error);
      // Notify user (e.g., via toast, not included here)
    }
  }, []);

  // Remove file with proper cleanup
  const removeFile = useCallback((index: number, id: string) => {
    setMediaFiles((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const newFiles = [...prev];
      const file = newFiles[index];
      URL.revokeObjectURL(file.previewUrl);
      if (file.posterUrl && file.posterUrl !== file.previewUrl) {
        URL.revokeObjectURL(file.posterUrl);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  // Modal controls
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Revoke all URLs
  const revokeUrls = useCallback(() => {
    mediaFiles.forEach((file) => {
      URL.revokeObjectURL(file.previewUrl);
      if (file.posterUrl && file.posterUrl !== file.previewUrl) {
        URL.revokeObjectURL(file.posterUrl);
      }
    });
    setMediaFiles([]);
  }, [mediaFiles]);

  // Reset all state
  const resetAll = useCallback(() => {
    revokeUrls();
    setMessage("");
    setIsModalOpen(false);
  }, [revokeUrls]);

  // Clean up URLs on unmount or mediaFiles change
  useEffect(() => {
    return () => {
      mediaFiles.forEach((file) => {
        URL.revokeObjectURL(file.previewUrl);
        if (file.posterUrl && file.posterUrl !== file.previewUrl) {
          URL.revokeObjectURL(file.posterUrl);
        }
      });
    };
  }, [mediaFiles]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      mediaFiles,
      message,
      isModalOpen,
      addFiles,
      removeFile,
      setMessage,
      openModal,
      closeModal,
      resetAll,
      revokeUrls,
    }),
    [
      mediaFiles,
      message,
      isModalOpen,
      addFiles,
      removeFile,
      openModal,
      closeModal,
      resetAll,
      revokeUrls,
    ]
  );

  return (
    <MediaContext.Provider value={contextValue}>
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
