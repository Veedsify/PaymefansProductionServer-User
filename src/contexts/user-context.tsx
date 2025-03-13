import {create} from "zustand";

type UserContextProps = {
    user: any | null;
    setUser: (user: any) => void
}

const useUserContext = create<UserContextProps>((set) => ({
    user: null,
    setUser: (user: any) => set({user}),
}));

export default useUserContext;