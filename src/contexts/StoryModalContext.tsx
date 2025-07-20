"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type StoryModalContextType = {
  isOpen: boolean;
  storyData: any | null;
  openStoryModal: (storyData: any) => void;
  closeStoryModal: () => void;
};

const StoryModalContext = createContext<StoryModalContextType | undefined>(
  undefined
);

export const useStoryModal = () => {
  const context = useContext(StoryModalContext);
  if (!context) {
    throw new Error("useStoryModal must be used within a StoryModalProvider");
  }
  return context;
};

export const StoryModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storyData, setStoryData] = useState<any | null>(null);

  const openStoryModal = (data: any) => {
    setStoryData(data);
    setIsOpen(true);
  };

  const closeStoryModal = () => {
    setIsOpen(false);
    setStoryData(null);
  };

  return (
    <StoryModalContext.Provider
      value={{
        isOpen,
        storyData,
        openStoryModal,
        closeStoryModal,
      }}
    >
      {children}
    </StoryModalContext.Provider>
  );
};
