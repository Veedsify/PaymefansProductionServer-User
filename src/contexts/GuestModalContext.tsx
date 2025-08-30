import { create } from "zustand";

type GuesModalState = {
  open: boolean;
  toggleModalOpen: (message?: string) => void;
  toggleModalClose: () => void;
  message?: string;
};

export const useGuestModal = create<GuesModalState>((set) => ({
  open: false,
  message: "",
  toggleModalOpen: (message?: string) =>
    set((state) => ({
      open: true,
      message: message || "You need to be logged in to perform this action",
    })),
  toggleModalClose: () =>
    set((state) => ({
      open: false,
    })),
}));
