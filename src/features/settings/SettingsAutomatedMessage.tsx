"use client";
import {
  AlertCircle,
  Check,
  Edit,
  FileText,
  type LucideIcon,
  LucideLoader,
  Save,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import path from "path";
import React, { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import UploadImageToCloudflare from "@/utils/CloudflareImageUploader";
import { automatedMessagesAPI } from "@/utils/data/AutomatedMessages";
import { GetUploadUrl } from "@/utils/GetMediaUploadUrl";
import UploadWithTus from "@/utils/TusUploader";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

interface Attachment {
  type: "image" | "video";
  extension: string;
  id: string;
  poster?: string;
  size: number;
  name: string;
  url: string;
  preview?: string; // For local preview before upload
}

interface MessageData {
  text: string;
  attachments: Attachment[];
  isActive: boolean;
}

interface Messages {
  followers: MessageData;
  subscribers: MessageData;
}

interface EditingMode {
  followers: boolean;
  subscribers: boolean;
}

type MessageType = keyof Messages;

interface MessageCardProps {
  type: MessageType;
  title: string;
  icon: LucideIcon;
  placeholder: string;
}

const SettingsAutomatedMessage: React.FC = () => {
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

  const [editingMode, setEditingMode] = useState<EditingMode>({
    followers: false,
    subscribers: false,
  });

  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
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

  const handleTextChange = (type: MessageType, value: string): void => {
    setMessages((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        text: value,
      },
    }));
    setHasChanges(true);
  };

  const handleToggleActive = (type: MessageType): void => {
    setMessages((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        isActive: !prev[type].isActive,
      },
    }));
    setHasChanges(true);
  };

  const handleFileUpload = (type: MessageType): void => {
    setCurrentUploadType(type);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
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
          extension: path.extname(file.name),
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
              extension: path.extname(file.name),
              url:
                imgRes.result?.variants.find((v: string) =>
                  v.includes("/public"),
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
              extension: path.extname(file.name),
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
                att.id === tempId ? finalAttachment : att,
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

          setHasChanges(true);
        } catch (error) {
          console.error("Upload failed:", error);
          // Remove failed upload
          setMessages((prev) => ({
            ...prev,
            [currentUploadType]: {
              ...prev[currentUploadType],
              attachments: prev[currentUploadType].attachments.filter(
                (att) => att.id !== tempId,
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
  };

  const removeAttachment = (type: MessageType, attachmentId: string): void => {
    setMessages((prev) => {
      const attachmentToRemove = prev[type].attachments.find(
        (att) => att.id === attachmentId,
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
            (att) => att.id !== attachmentId,
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

    setHasChanges(true);
  };

  const handleEdit = (type: MessageType): void => {
    setEditingMode((prev) => ({
      ...prev,
      [type]: true,
    }));
  };

  const handleCancelEdit = (type: MessageType): void => {
    setEditingMode((prev) => ({
      ...prev,
      [type]: false,
    }));
  };

  const handleDelete = async (type: MessageType): Promise<void> => {
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
          setEditingMode((prev) => ({
            ...prev,
            [type]: false,
          }));
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          setError(response.message || "Failed to delete automated message");
        }
      } catch (err: any) {
        setError(err.message || "Failed to delete automated message");
        console.error("Error deleting automated message:", err);
      }
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await automatedMessagesAPI.updateMessages(messages);

      if (response.status) {
        setHasChanges(false);
        setShowSuccess(true);
        setEditingMode({ followers: false, subscribers: false });
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(response.message || "Failed to save automated messages");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save automated messages");
      console.error("Error saving automated messages:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  };

  const renderMessageCard = (
    type: MessageType,
    title: string,
    icon: LucideIcon,
    placeholder: string,
  ) => {
    const message = messages[type];
    const isEditing = editingMode[type];
    const isEmpty = !message.text && message.attachments.length === 0;

    return (
      <div
        className={`border rounded-xl p-6 transition-all duration-200 ${
          message.isActive
            ? "border-purple-200 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20"
            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                message.isActive
                  ? "bg-purple-100 text-primary-dark-pink dark:bg-purple-800 dark:text-purple-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {React.createElement(icon, { size: 20 })}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {message.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={message.isActive}
              onChange={() => handleToggleActive(type)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-dark-pink"></div>
          </label>
        </div>

        {isEmpty && !isEditing ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <AlertCircle
              size={48}
              className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
            />
            <p className="text-sm">No message configured</p>
            <button
              onClick={() => handleEdit(type)}
              className="mt-3 text-sm font-medium text-primary-dark-pink hover:text-primary-text-dark-pink dark:text-purple-400 dark:hover:text-purple-300"
            >
              Set up message
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <textarea
                value={message.text}
                onChange={(e) => handleTextChange(type, e.target.value)}
                placeholder={placeholder}
                rows={4}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 ${
                  isEditing
                    ? "border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:border-gray-600 dark:focus:ring-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    : "border-transparent bg-gray-50 cursor-default dark:bg-gray-700 text-gray-900 dark:text-white"
                } resize-none`}
              />
            </div>

            {message.attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attachments ({message.attachments.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {message.attachments.map((attachment) => {
                    const isUploading = activeUploads.has(attachment.id);
                    const progress = uploadProgress[attachment.id] || 0;

                    return (
                      <div
                        key={attachment.id}
                        className="relative p-2 border border-gray-200 rounded-lg group bg-gray-50 hover:border-gray-300 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          {/* Image preview or file icon */}
                          <div
                            className="relative flex items-center justify-center mb-2"
                            style={{ width: "60px", height: "60px" }}
                          >
                            {attachment.type === "image" ? (
                              <Image
                                height={60}
                                width={60}
                                priority
                                src={attachment.preview || attachment.url}
                                alt={attachment.name}
                                className={`object-cover rounded-md border border-gray-200 dark:border-gray-600 ${
                                  isUploading ? "opacity-50" : ""
                                }`}
                                style={{ width: "60px", height: "60px" }}
                              />
                            ) : attachment.type === "video" ? (
                              <div
                                className={`bg-gray-800 rounded-md flex items-center justify-center relative ${
                                  isUploading ? "opacity-50" : ""
                                }`}
                                style={{ width: "60px", height: "60px" }}
                              >
                                {attachment.poster ? (
                                  <Image
                                    width={60}
                                    height={60}
                                    priority
                                    src={attachment.poster}
                                    alt={attachment.name}
                                    className="object-cover rounded-md"
                                    style={{ width: "60px", height: "60px" }}
                                  />
                                ) : (
                                  <div className="text-xs text-white">
                                    VIDEO
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="flex items-center justify-center w-4 h-4 bg-white rounded-full bg-opacity-80">
                                    <div className="w-0 h-0 border-l-2 border-l-gray-800 border-y-1 border-y-transparent ml-0.5"></div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center ${
                                  isUploading ? "opacity-50" : ""
                                }`}
                                style={{ width: "60px", height: "60px" }}
                              >
                                <FileText
                                  size={24}
                                  className="text-gray-400 dark:text-gray-300"
                                />
                              </div>
                            )}

                            {/* Upload progress overlay */}
                            {isUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                                <div className="text-xs font-medium text-white">
                                  {Math.round(progress)}%
                                </div>
                              </div>
                            )}
                          </div>

                          {/* File info */}
                          <div className="w-full text-center">
                            <p
                              className="text-xs font-medium text-gray-900 dark:text-white truncate"
                              title={attachment.name}
                            >
                              {attachment.name.length > 15
                                ? `${attachment.name.substring(0, 12)}...`
                                : attachment.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {isUploading
                                ? `Uploading... ${Math.round(progress)}%`
                                : formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>

                        {/* Remove button */}
                        {isEditing && !isUploading && (
                          <button
                            onClick={() =>
                              removeAttachment(type, attachment.id)
                            }
                            className="absolute flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full opacity-0 -top-2 -right-2 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => handleFileUpload(type)}
                    className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg gap-2 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                  >
                    <Upload size={16} />
                    Attach File
                  </button>
                  <button
                    onClick={() => handleCancelEdit(type)}
                    className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg gap-2 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(type)}
                    className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg gap-2 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(type)}
                    className="flex items-center px-4 py-2 text-sm text-white bg-red-500 rounded-lg gap-2 hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner text="Loading automated messages..." />
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="mb-4 text-lg font-bold text-gray-900 md:text-xl dark:text-white">
          Automated Messages
        </h1>
        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
          Boost engagement with automated messages! Set up triggers to send
          personalized messages to your fans when they subscribe or follow you.
          Share exclusive content, or simply say thank you to build a loyal
          community.
        </p>
      </div>

      {error && (
        <div className="flex items-center p-4 mb-6 border border-red-200 rounded-lg gap-3 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {renderMessageCard(
          "followers",
          "New Followers",
          Users,
          "Welcome! Thank you for following. I'm excited to share my content with you...",
        )}

        {renderMessageCard(
          "subscribers",
          "New Subscribers",
          UserPlus,
          "Welcome to my exclusive content! Thank you for subscribing...",
        )}

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Save Changes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeUploads.size > 0
                  ? `Uploading ${activeUploads.size} file${
                      activeUploads.size > 1 ? "s" : ""
                    }...`
                  : hasChanges
                    ? "You have unsaved changes"
                    : "All changes saved"}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || activeUploads.size > 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                hasChanges && !isSaving && activeUploads.size === 0
                  ? "bg-primary-dark-pink text-white hover:bg-primary-text-dark-pink shadow-sm dark:bg-purple-600 dark:hover:bg-purple-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
              }`}
            >
              {isSaving ? <LoadingSpinner /> : <Save size={16} />}
              {isSaving
                ? "Saving..."
                : activeUploads.size > 0
                  ? "Uploading..."
                  : "Save Settings"}
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="flex items-center p-4 border border-green-200 rounded-lg gap-3 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <Check size={20} className="text-green-600 dark:text-green-400" />
            <p className="font-medium text-green-800 dark:text-green-300">
              Settings saved successfully!
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
      />
    </div>
  );
};

export default SettingsAutomatedMessage;
