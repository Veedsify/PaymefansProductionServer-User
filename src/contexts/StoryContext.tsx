import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CaptionElement {
  id: string;
  type: "text" | "link";
  content: string;
  url?: string;
  position: {
    x: number;
    y: number;
  };
  style: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    color: string;
    textAlign: "left" | "center" | "right";
    fontStyle?: string;
    textDecoration?: string;
  };
}

export type StoryType = {
  id: number;
  index: number;
  media_id: string;
  media_type: string;
  media_state: "completed" | "processing" | "failed" | "uploading" | "pending";
  media_url: string;
  caption?: string;
  duration?: number;
  captionElements?: CaptionElement[];
  mentions?: { id: number; username: string; name: string }[];
  uploadProgress?: number;
  file?: File;
};

type StoryState = {
  story: StoryType[];
  addToStory: (story: StoryType) => void;
  removeFromStory: (id: number) => void;
  addCaptionToStory: (id: number, caption: string) => void;
  updateStorySlide: (media_id: string, data: Partial<StoryType>) => void;
  updateCaptionStyle: (id: number, captionStyle: CaptionElement) => void;
  editingSlideIndex: number | null;
  updateStoryState: (media_id: string, state: StoryType["media_state"]) => void;
  updateUploadProgress: (media_id: string, progress: number) => void;
  setEditingSlide: (index: number) => void;
  clearStory: () => void;
};

export const useStoryStore = create<StoryState>()(
  persist(
    (set) => ({
      story: [],
      addToStory: (story) =>
        set((state) => ({ story: [...state.story, story] })),
      removeFromStory: (id) =>
        set((state) => ({
          story: state.story.filter((storyId) => storyId.id !== id),
        })),
      updateStoryState: (media_id, media_state) =>
        set((state) => ({
          story: state.story.map((slide) =>
            slide.media_id === media_id
              ? { ...slide, media_state: media_state }
              : slide,
          ),
        })),
      updateUploadProgress: (media_id, progress) =>
        set((state) => ({
          story: state.story.map((slide) =>
            slide.media_id === media_id
              ? {
                  ...slide,
                  uploadProgress: progress,
                  media_state: progress === 100 ? "completed" : "uploading",
                }
              : slide,
          ),
        })),
      updateStorySlide: (media_id: string, data: Partial<StoryType>) =>
        set((state) => ({
          story: state.story.map((slide) =>
            slide.media_id === media_id ? { ...slide, ...data } : slide,
          ),
        })),
      addCaptionToStory: (id, caption) => {
        return set((state) => {
          const index = state.story.findIndex((story) => story.id === id);
          state.story[index].caption = caption;
          return { story: state.story };
        });
      },
      updateCaptionStyle: (id, captionStyle) => {
        return set((state) => {
          const index = state.story.findIndex((story) => story.id === id);
          if (index !== -1) {
            if (!state.story[index].captionElements) {
              state.story[index].captionElements = [captionStyle];
            } else {
              state.story[index].captionElements = [
                ...state.story[index].captionElements!,
                captionStyle,
              ];
            }
          }
          return { story: state.story };
        });
      },
      editingSlideIndex: null,
      setEditingSlide: (index: number) =>
        set(() => ({ editingSlideIndex: index })),
      clearStory: () => set({ story: [] }),
    }),
    {
      name: "story-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
