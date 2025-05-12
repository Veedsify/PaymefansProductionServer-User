"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BellOff,
  Images,
  Star,
  Search,
  Ban,
  Trash2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const ConversationSettingsPage = () => {
  const [isBlocking, setIsBlocking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  return (
    <div className="flex flex-col items-center min-h-dvh">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-white overflow-hidden"
      >
        {/* Profile Section */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center shadow-md text-xl font-bold text-white">
              <span>JD</span>
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="font-semibold text-lg text-gray-800">John Doe</h2>
            <div className="text-sm text-gray-500">
              Last seen today at 2:45 PM
            </div>
            <div className="mt-1 flex items-center text-xs text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Online
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm uppercase text-gray-500 font-medium px-2 mb-2">
              Notifications & Media
            </h3>
            <SettingsAction
              icon={<BellOff className="text-blue-600" />}
              label="Mute notifications"
              description="Turn off notifications for this chat"
            />
            <SettingsAction
              icon={<Images className="text-indigo-600" />}
              label="Media & documents"
              description="View shared media, links and files"
              badge="23"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-sm uppercase text-gray-500 font-medium px-2 mb-2">
              Chat Options
            </h3>
            <SettingsAction
              icon={<Star className="text-amber-500" />}
              label="Starred messages"
              description="View messages you've starred"
            />
            <SettingsAction
              icon={<Search className="text-gray-700" />}
              label="Search in conversation"
              description="Find specific messages or content"
              onClick={() => setIsSearching(true)}
            />
          </div>

          <div>
            <h3 className="text-sm uppercase text-gray-500 font-medium px-2 mb-2">
              Privacy & Support
            </h3>
            <SettingsAction
              icon={<Ban className="text-red-500" />}
              label="Block user"
              description="You won't receive messages from this user"
              danger
              onClick={() => setIsBlocking(true)}
            />
            <SettingsAction
              icon={<Trash2 className="text-red-600" />}
              label="Delete conversation"
              description="Permanently delete all messages"
              danger
              onClick={() => setIsDeleting(true)}
            />
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modals */}
      {isBlocking && <BlockUserModal onClose={() => setIsBlocking(false)} />}
      {isDeleting && <DeleteChatModal onClose={() => setIsDeleting(false)} />}
      {isSearching && <SearchModal onClose={() => setIsSearching(false)} />}
    </div>
  );
};

type SettingsActionProps = {
  icon: React.ReactNode;
  label: string;
  description?: string;
  danger?: boolean;
  badge?: string;
  onClick?: () => void;
};

const SettingsAction: React.FC<SettingsActionProps> = ({
  icon,
  label,
  description,
  danger,
  badge,
  onClick,
}) => (
  <motion.button
    whileHover={{ x: 4 }}
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-xl transition text-left
                        ${danger ? "hover:bg-red-50" : "hover:bg-gray-50"}
                        group
                `}
  >
    <div className="text-2xl mr-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1">
      <div
        className={`font-medium ${danger ? "text-red-600" : "text-gray-800"}`}
      >
        {label}
      </div>
      {description && (
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      )}
    </div>
    {badge && (
      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
        {badge}
      </div>
    )}
    <ChevronRight className="text-gray-400 ml-1 h-5 w-5" />
  </motion.button>
);

const BlockUserModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
    >
      <h3 className="text-xl font-bold text-gray-800">Block this user?</h3>
      <p className="text-gray-600 mt-2">
        You won&apos;t receive messages or calls from this user anymore. They
        won&apos;t be notified that you&apos;ve blocked them.
      </p>
      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700">
          Block User
        </button>
      </div>
    </motion.div>
  </div>
);

const DeleteChatModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
        <AlertTriangle className="text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 text-center">
        Delete Conversation
      </h3>
      <p className="text-gray-600 mt-2 text-center">
        This will permanently delete all messages in this conversation. This
        action cannot be undone.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700">
          Delete
        </button>
      </div>
    </motion.div>
  </div>
);

const SearchModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-black/50 flex lg:py-4 lg:items-center lg:justify-center z-50"
    onClick={onClose}
  >
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white lg:rounded-xl p-6 max-w-xl w-full lg:mx-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Search</h3>
        <button onClick={onClose} className="text-gray-500">
          <Trash2 />
        </button>
      </div>
      <input
        type="text"
        placeholder="Search in conversation"
        className="w-full border border-gray-300 rounded-lg p-2 mt-4"
      />
    </motion.div>
  </div>
);

export default ConversationSettingsPage;
