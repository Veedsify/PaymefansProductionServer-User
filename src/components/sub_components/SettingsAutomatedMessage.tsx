"use client";
import { useState, useRef } from "react";
import {
  Edit,
  Paperclip,
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

interface Attachment {
  id: number;
  name: string;
  size: number;
  type: string;
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
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] = useState<MessageType | null>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && currentUploadType) {
      setMessages((prev) => ({
        ...prev,
        [currentUploadType]: {
          ...prev[currentUploadType],
          attachments: [
            ...prev[currentUploadType].attachments,
            ...files.map((file): Attachment => ({
              id: Date.now() + Math.random(),
              name: file.name,
              size: file.size,
              type: file.type,
            })),
          ],
        },
      }));
      setHasChanges(true);
    }
    event.target.value = "";
  };

  const removeAttachment = (type: MessageType, attachmentId: number): void => {
    setMessages((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        attachments: prev[type].attachments.filter(
          (att) => att.id !== attachmentId,
        ),
      },
    }));
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

  const handleDelete = (type: MessageType): void => {
    if (
      window.confirm(`Are you sure you want to delete the ${type} message?`)
    ) {
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
      setHasChanges(true);
    }
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    setHasChanges(false);
    setShowSuccess(true);
    setEditingMode({ followers: false, subscribers: false });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const MessageCard: React.FC<MessageCardProps> = ({ type, title, icon: Icon, placeholder }) => {
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
              <Icon size={20} />
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
                <div className="space-y-2">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeAttachment(type, attachment.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
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

      <div className="space-y-6">
        <MessageCard
          type="followers"
          title="New Followers"
          icon={Users}
          placeholder="Welcome! Thank you for following. I'm excited to share my content with you..."
        />

        <MessageCard
          type="subscribers"
          title="New Subscribers"
          icon={UserPlus}
          placeholder="Welcome to my exclusive content! Thank you for subscribing..."
        />

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Save Changes</h3>
              <p className="text-sm text-gray-500">
                {hasChanges ? "You have unsaved changes" : "All changes saved"}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                hasChanges && !isSaving
                  ? "bg-primary-dark-pink text-white hover:bg-pritext-primary-text-dark-pink shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? "Saving..." : "Save Settings"}
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
