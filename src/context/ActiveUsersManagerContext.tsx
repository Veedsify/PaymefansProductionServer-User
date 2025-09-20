// ActiveUsersManagerContext.ts
// Context and singleton manager for active users
import { create } from "zustand";

type handleActiveUsersProps = {
  username: string;
  last_active: number;
  socket_id: string;
};

interface ActiveUsersState {
  activeUsers: handleActiveUsersProps[]; // Array of active users with their last active time
  updateActiveUsers: (users: handleActiveUsersProps[]) => void;
  isActive: (username: string) => boolean;
}

export const useActiveUsersManager = create<ActiveUsersState>((set, get) => ({
  activeUsers: [],
  updateActiveUsers: (users: handleActiveUsersProps[]) => {
    set({ activeUsers: users });
  },
  isActive: (username: string) => {
    return (
      get().activeUsers.find((user) => user.username === username) !== undefined
    );
  },
}));
