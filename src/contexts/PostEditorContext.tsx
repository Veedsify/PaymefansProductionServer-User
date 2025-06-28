import { create } from "zustand";

type PostEditorContextProps = {
  isWaterMarkEnabled: boolean;
  setWatermarkEnabled: (value: boolean) => void;
};

export const usePostEditorContext = create<PostEditorContextProps>((set) => ({
  isWaterMarkEnabled: false,
  setWatermarkEnabled: (value: boolean) =>
    set(() => ({
      isWaterMarkEnabled: value,
    })),
}));
