import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  media_type: string;
  media_url: string;
  caption?: string;
  captionElements?: CaptionElement[];
};

type StoryState = {
  story: StoryType[];
  addToStory: (story: StoryType) => void;
  removeFromStory: (id: number) => void;
  addCaptionToStory: (id: number, caption: string) => void;
  updateStorySlide: (id: number, data: Partial<StoryType>) => void;
  updateCaptionStyle: (id: number, captionStyle: CaptionElement) => void;
  editingSlideIndex: number | null;
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
      updateStorySlide: (index: number, data: Partial<StoryType>) =>
        set((state) => ({
          story: state.story.map((slide, i) =>
            i === index ? { ...slide, ...data } : slide
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
    }
  )
);
