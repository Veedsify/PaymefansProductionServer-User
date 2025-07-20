"use client";
import React from "react";
import { useStoryModal } from "@/contexts/StoryModalContext";
import StatusModal from "../story/StatusModal";

const GlobalStoryModal: React.FC = () => {
  const { isOpen, storyData, closeStoryModal } = useStoryModal();

  if (!isOpen || !storyData) return null;

  return (
    <StatusModal
      open={isOpen}
      stories={storyData}
      setStoriesOpen={(open: boolean) => {
        if (!open) closeStoryModal();
      }}
    />
  );
};

export default GlobalStoryModal;
