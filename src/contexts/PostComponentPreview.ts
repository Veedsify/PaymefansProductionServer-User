import { create } from "zustand";

type OtherUrl = {
  url: URL;
  type: "video" | "image";
  isBlob?: boolean;
};
type UserProfile = {
  name: string;
  username: string;
  avatar?: string;
} | null;
type URL = string;
type FullScreenPreviewType = {
  url: string;
  type: string;
  open: boolean;
  withOptions?: boolean;
  ref: number;
  isBlob?: boolean;
  otherUrl: OtherUrl[];
  username?: string;
  userProfile: UserProfile;
  watermarkEnabled?: boolean;
};
type PostComponentType = {
  url: URL;
  ref: number;
  otherUrl: {
    url: URL;
    type: "video" | "image";
    isBlob?: boolean;
  }[];
  open: boolean;
  type: string | null;
  watermarkEnabled?: boolean;
  userProfile: {
    name: string;
    username: string;
    avatar?: string;
  } | null;
  close: () => void;
  username?: string;
  withOptions?: boolean;
  fullScreenPreview: ({
    url,
    open,
    type,
    withOptions,
    ref,
    otherUrl,
    username,
    watermarkEnabled,
    userProfile,
  }: FullScreenPreviewType) => void;
};

const usePostComponent = create<PostComponentType>((set) => ({
  url: "",
  ref: 0,
  open: false,
  type: "",
  otherUrl: [],
  username: "",
  watermarkEnabled: false,
  userProfile: null,
  withOptions: false,
  close: () =>
    set({
      open: false,
      withOptions: false,
      url: "",
      type: "",
      ref: 0,
      otherUrl: [],
    }),
  fullScreenPreview: ({
    url,
    type,
    open,
    ref,
    otherUrl,
    withOptions,
    username,
    watermarkEnabled,
    userProfile,
  }) =>
    set({
      url,
      type,
      open,
      withOptions,
      ref,
      otherUrl: otherUrl,
      watermarkEnabled,
      username,
      userProfile,
    }),
}));

export default usePostComponent;
