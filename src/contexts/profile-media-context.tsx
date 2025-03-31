import { MediaDataType } from "@/types/components";
import { create } from "zustand";
import _ from "lodash";

type ProfileMediaContext = {
  arData: MediaDataType[];
  setData: (media: MediaDataType[]) => void;
};

export const useProfileMediaContext = create<ProfileMediaContext>((set) => ({
  arData: [],
  setData: (media) =>
    set((state) => ({ arData: _.uniqBy([...state.arData, ...media], "id") })),
}));
