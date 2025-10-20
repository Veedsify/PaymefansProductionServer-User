"use client";

import React from "react";
import { AlertCircle, Edit, FileText, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import type { MessageCardProps, MessageType, Attachment } from "../../types";

interface MessageCardComponentProps extends MessageCardProps {
  message: {
    text: string;
    attachments: Attachment[];
    isActive: boolean;
  };
  isEditing: boolean;
  isEmpty: boolean;
  activeUploads: Set<string>;
  uploadProgress: Record<string, number>;
  onTextChange: (type: MessageType, value: string) => void;
  onToggleActive: (type: MessageType) => void;
  onFileUpload: (type: MessageType) => void;
  onEdit: (type: MessageType) => void;
  onCancelEdit: (type: MessageType) => void;
  onDelete: (type: MessageType) => void;
  onRemoveAttachment: (type: MessageType, attachmentId: string) => void;
  formatFileSize: (bytes: number) => string;
}

const MessageCard: React.FC<MessageCardComponentProps> = ({
  type,
  title,
  icon,
  placeholder,
  message,
  isEditing,
  isEmpty,
  activeUploads,
  uploadProgress,
  onTextChange,
  onToggleActive,
  onFileUpload,
  onEdit,
  onCancelEdit,
  onDelete,
  onRemoveAttachment,
  formatFileSize,
}) => {
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
            onChange={() => onToggleActive(type)}
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
            onClick={() => onEdit(type)}
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
              onChange={(e) => onTextChange(type, e.target.value)}
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
                                <div className="text-xs text-white">VIDEO</div>
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
                            onRemoveAttachment(type, attachment.id)
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
                  onClick={() => onFileUpload(type)}
                  className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg gap-2 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                >
                  <Upload size={16} />
                  Attach File
                </button>
                <button
                  onClick={() => onCancelEdit(type)}
                  className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg gap-2 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                >
                  <X size={16} />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onEdit(type)}
                  className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg gap-2 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(type)}
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

export default MessageCard;
