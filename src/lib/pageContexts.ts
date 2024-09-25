import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SideBarContextType = {
  sideBarState: boolean;
  setSideBar: (value: boolean) => void;
};

export const useSideBarContext = create<SideBarContextType>()(
  // persist(
  (set) => ({
    sideBarState: false,
    setSideBar: (value: boolean) =>
      set(() => ({
        sideBarState: value,
      })),
  })
  // {
  //   name: "sideBar-context",
  //   storage: createJSONStorage(() => localStorage),
  // }
  // )
);

// MODAL CONTEXT
export type ModalContextType = {
  modalState: boolean;
  setModal: () => void;
};

export const useModalContext = create<ModalContextType>((set) => ({
  modalState: false,
  setModal: () =>
    set((state) => ({
      modalState: !state.modalState,
    })),
}));

type CameraMode = "user" | "environment";
type CameraModeContextType = {
  cameraState: CameraMode;
  setCameraMode: (value: CameraMode) => void;
};

export const useCameraModeContext = create<CameraModeContextType>()(
  persist(
    (set) => ({
      cameraState: "environment",
      setCameraMode: (value: CameraMode) =>
        set(() => ({
          cameraState: value,
        })),
    }),
    {
      name: "camera",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
