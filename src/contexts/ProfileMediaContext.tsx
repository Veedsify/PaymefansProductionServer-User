import { uniqBy } from "lodash-es";
import { create } from "zustand";
import type {
  MediaDataType,
  MediaDataTypeOtherProps,
} from "@/types/Components";

type ProfileMediaContext = {
  arData: MediaDataType[];
  setData: (media: MediaDataType[]) => void;
};

export const useProfileMediaContext = create<ProfileMediaContext>((set) => ({
  arData: [],
  setData: (media) =>
    set((state) => ({ arData: uniqBy([...state.arData, ...media], "id") })),
}));

type OtherMediaContext = {
  data: MediaDataTypeOtherProps[];
  setData: (media: MediaDataTypeOtherProps[]) => void;
};

const useOtherMediaContext = create<OtherMediaContext>((set) => ({
  data: [],
  setData: (media: MediaDataTypeOtherProps[]) =>
    set((state) => ({
      data: uniqBy([...state.data, ...media], "id"),
    })),
}));
