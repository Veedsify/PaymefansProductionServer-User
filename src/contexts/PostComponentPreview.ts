import { create } from "zustand";

type URL = string;
type FullScreenPreviewType = {
    url: string, type: string, open: boolean, withOptions?: boolean
    ref: number,
    isBlob?: boolean,
    otherUrl: {
        url: URL;
        type: "video" | "image";
        isBlob?: boolean;
    }[],
    username?: string;
    watermarkEnabled?: boolean;
}
type PostComponentType = {
    url: URL;
    ref: number
    otherUrl: {
        url: URL;
        type: "video" | "image";
        isBlob?: boolean;
    }[];
    open: boolean;
    type: string | null
    watermarkEnabled?: boolean;
    close: () => void;
    username?: string;
    withOptions?: boolean;
    fullScreenPreview: ({ url, open, type, withOptions, ref, otherUrl, username, watermarkEnabled }: FullScreenPreviewType) => void
};

const usePostComponent = create<PostComponentType>((set) => ({
    url: "",
    ref: 0,
    open: false,
    type: "",
    otherUrl: [],
    username: "",
    watermarkEnabled: false,
    withOptions: false,
    close: () => set({ open: false, withOptions: false, url: "", type: "", ref: 0, otherUrl: [] }),
    fullScreenPreview: ({ url, type, open, ref, otherUrl, withOptions, username, watermarkEnabled }) => set({ url, type, open, withOptions, ref, otherUrl: otherUrl, watermarkEnabled, username})
}));

export default usePostComponent;