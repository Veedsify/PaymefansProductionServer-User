import React, { useState } from "react";
import { Copy, Facebook, Twitter, MessageCircle, Link2, X } from "lucide-react";
import { PostShareModalProps } from "@/types/Components";

const PostShareModal = ({
  isOpen,
  onClose,
  url = "https://example.com/post/123",
  title = "Check out this amazing post!",
}: PostShareModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        ),
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Twitter",
      icon: Twitter,
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`,
          "_blank"
        ),
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
          "_blank"
        ),
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 loaderFade"
    >
      <div
        className="w-full max-w-lg bg-white shadow-xl rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Share</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Share options */}
        <div className="p-6 space-y-6">
          {/* Social share buttons */}
          <div className="flex flex-wrap gap-4">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.onClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors ${option.color}`}
              >
                <option.icon className="w-5 h-5" />
                <span>{option.name}</span>
              </button>
            ))}
          </div>

          {/* Copy link section */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600">Copy link</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 truncate bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">{url}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className={`p-3 rounded-lg transition-colors ${
                  copied
                    ? "bg-green-100 text-green-600"
                    : "bg-primary-dark-pink text-white hover:bg-primary-text-dark-pink"
                }`}
              >
                {copied ? (
                  <span className="flex items-center space-x-1">
                    <Link2 className="w-5 h-5" />
                    <span className="text-sm">Copied!</span>
                  </span>
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostShareModal;
