"use client";
import React from "react";
import { StoryModalProvider } from "@/contexts/StoryModalContext";
import GlobalStoryModal from "@/components/modals/GlobalStoryModal";

type StoryModalWrapperProps = {
  children: React.ReactNode;
};

const StoryModalWrapper: React.FC<StoryModalWrapperProps> = ({ children }) => {
  return (
    <StoryModalProvider>
      {children}
      <GlobalStoryModal />
    </StoryModalProvider>
  );
};

export default StoryModalWrapper;
