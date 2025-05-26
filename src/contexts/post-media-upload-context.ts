import { create } from
    "zustand";

type PostMediaUploadContextProps = {
    mediaCount: number;
    mediaUploadComplete: boolean;
    setMediaCount: (count: number) => void;
    setMediaUploadComplete: (complete: boolean) => void;
}

export const usePostMediaUploadContext = create<PostMediaUploadContextProps>((set) => ({
    mediaCount: 0,
    mediaUploadComplete: false,
    setMediaCount: (count) => set({ mediaCount: count }),
    setMediaUploadComplete: (complete) => set({ mediaUploadComplete: complete }),
}));