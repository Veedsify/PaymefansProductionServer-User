import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserRegisterType } from "../features/user/types/user";

type UserState = {
  user: UserRegisterType | null;
  setUser: (user: UserRegisterType | null) => void;
};

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "user_register_context",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
