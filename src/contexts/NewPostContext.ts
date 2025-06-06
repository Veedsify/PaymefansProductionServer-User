import { create } from "zustand"
import { persist } from "zustand/middleware"

type NewPostState = {
  postText: string
  visibility: "Public" | "Subscribers" | "Price"
  setVisibility: (visibility: "Public" | "Subscribers" | "Price") => void
  setPostText: (text: string) => void
  clearAll: () => void
}

export const useNewPostStore = create<NewPostState>(
  (set) => ({
    postText: "",
    visibility: "Public",
    clearAll: () => set({ postText: "", visibility: "Public" }),
    setPostText: (text: string) => {
      set((state) => {
        // Only update if the text is actually different
        return state.postText !== text ? { postText: text } : state;
      });
    },
    setVisibility: (visibility: "Public" | "Subscribers" | "Price") => set({ visibility }),
  })
)
