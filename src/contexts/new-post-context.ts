import { create } from "zustand"
import { persist } from "zustand/middleware"

export type NewPostState = {
    postText: string
    visibility: "Public" | "Subscribers" | "Private"
    setVisibility: (visibility: "Public" | "Subscribers" | "Private") => void
    setPostText: (text: string) => void
    clearAll: () => void
}

export const useNewPostStore = create<NewPostState>(
    (set) => ({
        postText: "",
        visibility: "Public",
        clearAll: () => set({ postText: "", visibility: "Public" }),
        setPostText: (text: string) => set({ postText: text }),
        setVisibility: (visibility: "Public" | "Subscribers" | "Private") => set({ visibility }),
    })
)