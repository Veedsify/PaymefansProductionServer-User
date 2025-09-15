"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

// Types
interface PostContextState {
  // Post content
  postText: string;
  setPostText: (text: string) => void;

  // Post visibility
  visibility: "Public" | "Subscribers" | "Price";
  setVisibility: (visibility: "Public" | "Subscribers" | "Price") => void;

  // Media upload state
  mediaUploadComplete: boolean;
  setMediaUploadComplete: (complete: boolean) => void;

  // Post editor settings
  isWaterMarkEnabled: boolean;
  setWatermarkEnabled: (enabled: boolean) => void;

  // Clear all state
  clearAll: () => void;
}

// Context
const PostContext = createContext<PostContextState | undefined>(undefined);

// Provider Component
interface PostProviderProps {
  children: ReactNode;
}

export const PostProvider: React.FC<PostProviderProps> = ({ children }) => {
  // State
  const [postText, setPostText] = useState<string>("");
  const [visibility, setVisibility] = useState<
    "Public" | "Subscribers" | "Price"
  >("Public");
  const [mediaUploadComplete, setMediaUploadComplete] =
    useState<boolean>(false);
  const [isWaterMarkEnabled, setIsWaterMarkEnabled] = useState<boolean>(false);

  // Handlers
  const setWatermarkEnabled = (enabled: boolean) => {
    setIsWaterMarkEnabled(enabled);
  };

  const clearAll = () => {
    setPostText("");
    setVisibility("Public");
    setMediaUploadComplete(false);
    setIsWaterMarkEnabled(false);
  };

  const value: PostContextState = {
    postText,
    setPostText,
    visibility,
    setVisibility,
    mediaUploadComplete,
    setMediaUploadComplete,
    isWaterMarkEnabled,
    setWatermarkEnabled,
    clearAll,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

// Hook
export const usePostContext = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};
