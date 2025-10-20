"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import UploadImageToCloudflare from "@/utils/CloudflareImageUploader";
import { automatedMessagesAPI } from "@/utils/data/AutomatedMessages";
import { GetUploadUrl } from "@/utils/GetMediaUploadUrl";
import UploadWithTus from "@/utils/TusUploader";
import type { Messages, MessageType, Attachment } from "../types";

export const useAutomatedMessages = () => {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Messages>({
    followers: {
      text: "",
      attachments: [],
      isActive: false,
    },
    subscribers: {
      text: "",
      attachments: [],
      isActive: false,
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] =
    useState<MessageType | null>(null);

  // Load automated messages on component mount
  useEffect(() => {
    loadAutomatedMessages();
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up all preview URLs when component unmounts
      Object.values(messages).forEach((messageData) => {
        messageData.attachments.forEach((attachment: Attachment) => {
          if (attachment.preview) {
            URL.revokeObjectURL(attachment.preview);
          }
        });
      });
    };
  }, [messages]);

  const loadAutomatedMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await automatedMessagesAPI.getMessages();

      if (response.status && response.data) {
        setMessages(response.data);
        console.log("Automated messages loaded successfully:", response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load automated messages");
      console.error("Error loading automated messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = useCallback(
    (type: MessageType, value: string): void => {
      setMessages((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          text: value,
        },
      }));
    },
    []
  );

  const handleToggleActive = useCallback((type: MessageType): void => {
    setMessages((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        isActive: !prev[type].isActive,
      },
    }));
  }, []);

  const handleFileUpload = useCallback((type: MessageType): void => {
    setCurrentUploadType(type);
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = Array.from(event.target.files || []);
      if (files.length > 0 && currentUploadType && user) {
        for (const file of files) {
          // Create temporary attachment with preview
          const tempId = `temp_${Date.now()}_${Math.random()}`;
          const tempAttachment: Attachment = {
            id: tempId,
            name: file.name,
            size: file.size,
            type: file.type.startsWith("image/") ? "image" : "video",
            extension: file.name.split(".").pop() || "",
            url: "",
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined,
          };

          // Add temporary attachment to show preview
          setMessages((prev) => ({
            ...prev,
            [currentUploadType]: {
              ...prev[currentUploadType],
              attachments: [
                ...prev[currentUploadType].attachments,
                tempAttachment,
              ],
            },
          }));

          try {
            // Add to active uploads
            setActiveUploads((prev) => new Set([...prev, tempId]));

            // Get upload URL
            const uploadResponse = await GetUploadUrl(file, {
              username: user.username || "unknown",
              shouldUseSignedUrls: false,
            });

            let finalAttachment: Attachment;

            if (file.type.startsWith("image/")) {
              // Upload image
              const imgRes = await UploadImageToCloudflare({
                file,
                id: tempId,
                uploadUrl: uploadResponse.uploadUrl,
                setProgress: setUploadProgress,
                setUploadError: () => {},
              });

              finalAttachment = {
                id: imgRes.result?.id || tempId,
                name: imgRes.result?.id || file.name,
                size: file.size,
                type: "image",
                extension: file.name.split(".").pop() || "",
                url:
                  imgRes.result?.variants.find((v: string) =>
                    v.includes("/public")
                  ) || "",
                poster: "",
              };
            } else {
              // Upload video
              const mediaId = await UploadWithTus({
                file: file,
                uploadUrl: uploadResponse.uploadUrl,
                id: tempId,
                setProgress: setUploadProgress,
                setUploadError: () => {},
              });

              finalAttachment = {
                id: mediaId || tempId,
                name: mediaId || file.name,
                size: file.size,
                type: "video",
                extension: file.name.split(".").pop() || "",
                url: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${mediaId}/manifest/video.m3u8`,
                poster: "", // You can generate poster for videos if needed
              };
            }

            // Replace temporary attachment with final one
            setMessages((prev) => ({
              ...prev,
              [currentUploadType]: {
                ...prev[currentUploadType],
                attachments: prev[currentUploadType].attachments.map((att) =>
                  att.id === tempId ? finalAttachment : att
                ),
              },
            }));

            // Remove from active uploads and progress
            setActiveUploads((prev) => {
              const newSet = new Set(prev);
              newSet.delete(tempId);
              return newSet;
            });
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[tempId];
              return newProgress;
            });
          } catch (error) {
            console.error("Upload failed:", error);
            // Remove failed upload
            setMessages((prev) => ({
              ...prev,
              [currentUploadType]: {
                ...prev[currentUploadType],
                attachments: prev[currentUploadType].attachments.filter(
                  (att) => att.id !== tempId
                ),
              },
            }));

            // Clean up upload state
            setActiveUploads((prev) => {
              const newSet = new Set(prev);
              newSet.delete(tempId);
              return newSet;
            });
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[tempId];
              return newProgress;
            });

            setError("Failed to upload file. Please try again.");
          }
        }
      }
      event.target.value = "";
    },
    [currentUploadType, user]
  );

  const removeAttachment = useCallback(
    (type: MessageType, attachmentId: string): void => {
      setMessages((prev) => {
        const attachmentToRemove = prev[type].attachments.find(
          (att) => att.id === attachmentId
        );

        // Clean up preview URL if it exists
        if (attachmentToRemove?.preview) {
          URL.revokeObjectURL(attachmentToRemove.preview);
        }

        return {
          ...prev,
          [type]: {
            ...prev[type],
            attachments: prev[type].attachments.filter(
              (att) => att.id !== attachmentId
            ),
          },
        };
      });

      // Clean up upload state if it's an active upload
      setActiveUploads((prev) => {
        const newSet = new Set(prev);
        newSet.delete(attachmentId);
        return newSet;
      });
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[attachmentId];
        return newProgress;
      });
    },
    []
  );

  const handleDelete = useCallback(async (type: MessageType): Promise<void> => {
    if (
      window.confirm(`Are you sure you want to delete the ${type} message?`)
    ) {
      try {
        setError(null);
        const response = await automatedMessagesAPI.deleteMessage(type);

        if (response.status) {
          setMessages((prev) => ({
            ...prev,
            [type]: {
              text: "",
              attachments: [],
              isActive: false,
            },
          }));
        } else {
          setError(response.message || "Failed to delete automated message");
        }
      } catch (err: any) {
        setError(err.message || "Failed to delete automated message");
        console.error("Error deleting automated message:", err);
      }
    }
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const response = await automatedMessagesAPI.updateMessages(messages);

      if (!response.status) {
        setError(response.message || "Failed to save automated messages");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save automated messages");
      console.error("Error saving automated messages:", err);
    }
  }, [messages]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  }, []);

  return {
    messages,
    setMessages,
    isLoading,
    error,
    setError,
    uploadProgress,
    activeUploads,
    fileInputRef,
    currentUploadType,
    setCurrentUploadType,
    handleTextChange,
    handleToggleActive,
    handleFileUpload,
    handleFileSelect,
    removeAttachment,
    handleDelete,
    handleSave,
    formatFileSize,
  };
};
