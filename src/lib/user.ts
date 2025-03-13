import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type UserState = {
  user: any | null;
  setUser: (user: any | null) => void;
};

export const getUser = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "user_register_context",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
