"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Edit,
  Trash2,
  Save,
  X,
  Check,
  Upload,
  FileText,
  Users,
  UserPlus,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { automatedMessagesAPI } from "@/utils/data/AutomatedMessages";
import { GetUploadUrl } from "@/utils/GetMediaUploadUrl";
import UploadImageToCloudflare from "@/utils/CloudflareImageUploader";
import UploadWithTus from "@/utils/TusUploader";
import { useUserAuthContext } from "@/lib/UserUseContext";
import path from "path";
import Image from "next/image";

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
  const { user } = useUserAuthContext();
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
            const mediaId = await UploadWithTus(
              file,
              uploadResponse.uploadUrl,
              tempId,
              setUploadProgress,
              () => {}, // Error callback
            );

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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            ? "border-blue-200 bg-blue-50/50"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                message.isActive
                  ? "bg-blue-100 text-primary-dark-pink"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {React.createElement(icon, { size: 20 })}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-dark-pink"></div>
          </label>
        </div>

        {isEmpty && !isEditing ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No message configured</p>
            <button
              onClick={() => handleEdit(type)}
              className="mt-3 text-primary-dark-pink hover:text-primary-text-dark-pink text-sm font-medium"
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
                    ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    : "border-transparent bg-gray-50 cursor-default"
                } resize-none`}
              />
            </div>

            {message.attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Attachments ({message.attachments.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {message.attachments.map((attachment) => {
                    const isUploading = activeUploads.has(attachment.id);
                    const progress = uploadProgress[attachment.id] || 0;

                    return (
                      <div
                        key={attachment.id}
                        className="relative group bg-gray-50 rounded-lg p-2 border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex flex-col items-center">
                          {/* Image preview or file icon */}
                          <div
                            className="mb-2 flex items-center justify-center relative"
                            style={{ width: "60px", height: "60px" }}
                          >
                            {attachment.type === "image" ? (
                              <Image
                                height={60}
                                width={60}
                                priority
                                src={attachment.preview || attachment.url}
                                alt={attachment.name}
                                className={`object-cover rounded-md border border-gray-200 ${
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
                                  <div className="text-white text-xs">
                                    VIDEO
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-4 h-4 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                                    <div className="w-0 h-0 border-l-2 border-l-gray-800 border-y-1 border-y-transparent ml-0.5"></div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`bg-gray-200 rounded-md flex items-center justify-center ${
                                  isUploading ? "opacity-50" : ""
                                }`}
                                style={{ width: "60px", height: "60px" }}
                              >
                                <FileText size={24} className="text-gray-400" />
                              </div>
                            )}

                            {/* Upload progress overlay */}
                            {isUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                                <div className="text-white text-xs font-medium">
                                  {Math.round(progress)}%
                                </div>
                              </div>
                            )}
                          </div>

                          {/* File info */}
                          <div className="text-center w-full">
                            <p
                              className="text-xs font-medium text-gray-900 truncate"
                              title={attachment.name}
                            >
                              {attachment.name.length > 15
                                ? `${attachment.name.substring(0, 12)}...`
                                : attachment.name}
                            </p>
                            <p className="text-xs text-gray-500">
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
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload size={16} />
                    Attach File
                  </button>
                  <button
                    onClick={() => handleCancelEdit(type)}
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(type)}
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(type)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
        <div className="w-8 h-8 border-2 border-primary-dark-pink border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">
          Loading automated messages...
        </span>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          Automated Messages
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Boost engagement with automated messages! Set up triggers to send
          personalized messages to your fans when they subscribe or follow you.
          Share exclusive content, or simply say thank you to build a loyal
          community.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
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

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Save Changes</h3>
              <p className="text-sm text-gray-500">
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
                  ? "bg-primary-dark-pink text-white hover:bg-primary-text-dark-pink shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSaving
                ? "Saving..."
                : activeUploads.size > 0
                  ? "Uploading..."
                  : "Save Settings"}
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Check size={20} className="text-green-600" />
            <p className="text-green-800 font-medium">
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
