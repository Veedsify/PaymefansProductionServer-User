import { create } from "zustand";

type URL = string;
type FullScreenPreviewType = {
    url: string, type: string, open: boolean, withOptions?: boolean
    ref: number, otherUrl: {
        url: URL;
        type: string;
    }[]
}
type PostComponentType = {
    url: URL;
    ref: number
    otherUrl: {
        url: URL;
        type: string;
    }[];
    open: boolean;
    type: string | null
    close: () => void;
    withOptions?: boolean;
    fullScreenPreview: ({ url, open, type, withOptions, ref, otherUrl }: FullScreenPreviewType) => void
};

const usePostComponent = create<PostComponentType>((set) => ({
    url: "",
    ref: 0,
    open: false,
    type: "",
    otherUrl: [],
    withOptions: false,
    close: () => set({ open: false, withOptions: false, url: "", type: "", ref: 0, otherUrl: [] }),
    fullScreenPreview: ({ url, type, open, ref, otherUrl, withOptions }) => set({ url, type, open, withOptions, ref, otherUrl: otherUrl })
}));

export default usePostComponent;