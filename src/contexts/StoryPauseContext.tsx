"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

interface StoryPauseContextType {
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

const StoryPauseContext = createContext<StoryPauseContextType | undefined>(
  undefined
);

export const useStoryPause = () => {
  const context = useContext(StoryPauseContext);
  if (!context) {
    throw new Error("useStoryPause must be used within a StoryPauseProvider");
  }
  return context;
};

interface StoryPauseProviderProps {
  children: ReactNode;
}

export const StoryPauseProvider = ({ children }: StoryPauseProviderProps) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <StoryPauseContext.Provider value={{ isPaused, setIsPaused }}>
      {children}
    </StoryPauseContext.Provider>
  );
};
