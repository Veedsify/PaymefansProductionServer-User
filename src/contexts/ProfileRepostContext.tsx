import {create} from "zustand"
import {UserPostProps} from "@/types/Components";
import _ from "lodash";

type ProfileRepostContext = {
    posts: UserPostProps[],
    setPosts: (posts: UserPostProps[]) => void,
}

export const useProfileRepostContext = create<ProfileRepostContext>((set)=>({
    posts: [],
    setPosts: (posts: UserPostProps[]) => set(state =>({
        posts: _.uniqBy([...state.posts, ...posts], 'id'),
    })),
}))