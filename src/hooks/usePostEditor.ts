import { useCallback, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useConfigContext } from "@/contexts/ConfigContext";
import { usePostContext } from "@/contexts/PostContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import type {
  RemovedMediaIdProps,
  UploadedImageProp,
  UserMediaProps,
} from "@/types/Components";

export const usePostEditor = (posts?: any) => {
  const { user } = useAuthContext();
  const { config } = useConfigContext();
  const {
    postText,
    setPostText,
    visibility,
    setVisibility,
    mediaUploadComplete,
    setMediaUploadComplete,
    isWaterMarkEnabled,
  } = usePostContext();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [content, setContent] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [nairaDisplayValue, setNairaDisplayValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [editedMedia, setEditedMedia] = useState<UserMediaProps[]>([]);
  const [removedIds, setRemovedIds] = useState<RemovedMediaIdProps[]>([]);
  const [media, setMedia] = useState<UploadedImageProp[] | null>(null);
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setPostText(newContent);
    },
    [setPostText],
  );

  const setPriceHandler = useCallback(
    (value: string) => {
      setNairaDisplayValue(value);
      const nairaValue = parseInt(value.replace(/[^0-9.]/g, ""));

      if (nairaValue < 0) {
        toast.error("Price cannot be negative.", { id: "post-price-error" });
        return;
      }
      if (isNaN(nairaValue)) {
        setPrice(0);
        return;
      }
      if (nairaValue > 10000000) {
        toast.error("Price cannot exceed ₦10,000,000.", {
          id: "post-price-error",
        });
        return;
      }

      const pointsValue = config?.point_conversion_rate_ngn
        ? Math.floor(nairaValue / config.point_conversion_rate_ngn)
        : 0;
      setPrice(pointsValue);
    },
    [config],
  );

  const handleMediaAttachment = useCallback((image: UploadedImageProp) => {
    console.log("Media attachment received:", image);
    setMedia((prevMedia) => {
      const newMedia = [...(prevMedia || []), image];
      console.log("Updated media state:", newMedia);
      return newMedia;
    });
  }, []);
  const removeThisMedia = useCallback(
    (id: string, type: string) => {
      startTransition(() => {
        setMedia((prevMedia) =>
          prevMedia ? prevMedia.filter((file) => file.fileId !== id) : null,
        );
        const removeId = media?.find((med) => med.fileId === id);
        if (removeId) {
          setRemovedIds((prevIds) => [...prevIds, { id: removeId.id, type }]);
        }
      });
    },
    [media],
  );

  const removeExistingMedia = useCallback(
    (mediaId: string, mediaType: string) => {
      startTransition(() => {
        setEditedMedia((prevMedia) =>
          prevMedia.filter((item) => item.media_id !== mediaId),
        );
        setRemovedIds((prevIds) => [
          ...prevIds,
          { id: mediaId, type: mediaType },
        ]);
      });
    },
    [],
  );

  return {
    // Refs and state
    textareaRef,
    content,
    price,
    nairaDisplayValue,
    isSubmitting,
    isPending,
    editedMedia,
    removedIds,
    media, // Setters
    setContent,
    setPrice,
    setNairaDisplayValue,
    setIsSubmitting,
    setEditedMedia,
    setRemovedIds,
    setMedia,
    setMediaUploadComplete,

    // Handlers
    handleContentChange,
    setPriceHandler,
    handleMediaAttachment,
    removeThisMedia,
    removeExistingMedia,

    // Context values
    user,
    config,
    visibility,
    setVisibility,
    postText,
    setPostText,
    mediaUploadComplete,
    isWaterMarkEnabled,
    posts,
  };
};
