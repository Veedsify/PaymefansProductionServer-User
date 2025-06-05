import { create } from "zustand";
import { UserRegisterType } from "../types/User";
import { createJSONStorage, persist } from "zustand/middleware";

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
    }
  )
);
