import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LivestreamState = {
  isLive: boolean;
  streamData: {
    title: string;
    userId: string;
    callId: string;
    streamId: string;
    token: string;
    name: string;
  };
  setIsLive: (isLive: boolean) => void;
  setStreamData: (streamData: {
    title: string;
    userId: string;
    callId: string;
    streamId: string;
    token: string;
    name: string;
  }) => void;
};

const useLivestreamStore = create<LivestreamState>()(
  persist(
    (set) => ({
      isLive: false,
      streamData: {
        title: "",
        userId: "",
        callId: "",
        streamId: "",
        token: "",
        name: "",
      },
      setIsLive: (isLive) => set({ isLive }),
      setStreamData: (streamData) => set({ streamData }),
    }),
    {
      name: "livestream-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useLivestreamStore;
