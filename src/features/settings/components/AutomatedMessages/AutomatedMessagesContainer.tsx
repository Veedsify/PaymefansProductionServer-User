"use client";

import React, { useState } from "react";
import { AlertCircle, Check, Save, UserPlus, Users, X } from "lucide-react";
import { useAutomatedMessages } from "../../hooks/useAutomatedMessages";
import MessageCard from "./MessageCard";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

const AutomatedMessagesContainer: React.FC = () => {
  const {
    messages,
    setMessages,
    isLoading,
    error,
    setError,
    uploadProgress,
    activeUploads,
    fileInputRef,
    handleTextChange,
    handleToggleActive,
    handleFileUpload,
    handleFileSelect,
    removeAttachment,
    handleDelete,
    handleSave,
    formatFileSize,
  } = useAutomatedMessages();

  const [editingMode, setEditingMode] = useState({
    followers: false,
    subscribers: false,
  });
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleEdit = (type: keyof typeof editingMode): void => {
    setEditingMode((prev) => ({
      ...prev,
      [type]: true,
    }));
  };

  const handleCancelEdit = (type: keyof typeof editingMode): void => {
    setEditingMode((prev) => ({
      ...prev,
      [type]: false,
    }));
  };

  const handleTextChangeWithTracking = (
    type: keyof typeof messages,
    value: string
  ): void => {
    handleTextChange(type, value);
    setHasChanges(true);
  };

  const handleToggleActiveWithTracking = (
    type: keyof typeof messages
  ): void => {
    handleToggleActive(type);
    setHasChanges(true);
  };

  const handleRemoveAttachmentWithTracking = (
    type: keyof typeof messages,
    attachmentId: string
  ): void => {
    removeAttachment(type, attachmentId);
    setHasChanges(true);
  };

  const handleDeleteWithTracking = async (
    type: keyof typeof messages
  ): Promise<void> => {
    await handleDelete(type);
    setEditingMode((prev) => ({
      ...prev,
      [type]: false,
    }));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveWithTracking = async (): Promise<void> => {
    try {
      setIsSaving(true);
      await handleSave();
      setHasChanges(false);
      setShowSuccess(true);
      setEditingMode({ followers: false, subscribers: false });
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setIsSaving(false);
    }
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
        <MessageCard
          type="followers"
          title="New Followers"
          icon={Users}
          placeholder="Welcome! Thank you for following. I'm excited to share my content with you..."
          message={messages.followers}
          isEditing={editingMode.followers}
          isEmpty={
            !messages.followers.text &&
            messages.followers.attachments.length === 0
          }
          activeUploads={activeUploads}
          uploadProgress={uploadProgress}
          onTextChange={handleTextChangeWithTracking}
          onToggleActive={handleToggleActiveWithTracking}
          onFileUpload={handleFileUpload}
          onEdit={handleEdit}
          onCancelEdit={handleCancelEdit}
          onDelete={handleDeleteWithTracking}
          onRemoveAttachment={handleRemoveAttachmentWithTracking}
          formatFileSize={formatFileSize}
        />

        <MessageCard
          type="subscribers"
          title="New Subscribers"
          icon={UserPlus}
          placeholder="Welcome to my exclusive content! Thank you for subscribing..."
          message={messages.subscribers}
          isEditing={editingMode.subscribers}
          isEmpty={
            !messages.subscribers.text &&
            messages.subscribers.attachments.length === 0
          }
          activeUploads={activeUploads}
          uploadProgress={uploadProgress}
          onTextChange={handleTextChangeWithTracking}
          onToggleActive={handleToggleActiveWithTracking}
          onFileUpload={handleFileUpload}
          onEdit={handleEdit}
          onCancelEdit={handleCancelEdit}
          onDelete={handleDeleteWithTracking}
          onRemoveAttachment={handleRemoveAttachmentWithTracking}
          formatFileSize={formatFileSize}
        />

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
              onClick={handleSaveWithTracking}
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

export default AutomatedMessagesContainer;
