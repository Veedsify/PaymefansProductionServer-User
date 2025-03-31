import { UserMediaProps } from "@/types/components";
import { create } from "zustand";
import _ from "lodash";

type Post = {
  id: number;
  content: string;
  post_id: string;
  post_audience: string;
  post_likes: number;
  post_comments: number;
  post_shares: number;
  post_status: string;
  post_reposts: number;
  is_model: boolean;
  UserMedia: UserMediaProps[];
  created_at: Date;
  user: {
    id: number;
    user_id: string;
    name: string;
    username: string;
    profile_image: string;
    is_model: boolean;
    Subscribers: {
      subscriber_id: number;
    }[];
  };
  PostLike: {
    id: number;
    like_id: number;
    user_id: number;
    post_id: string;
    created_at: string;
    updated_at: string;
  }[];
};
type PersonalProfileContext = {
  posts: Post[];
  setPosts: (post: Post[]) => void;
};

export const usePersonalProfileStore = create<PersonalProfileContext>(
  (set) => ({
    posts: [],
    setPosts: (post: Post[]) =>
      set((state) => ({ posts: _.uniqBy([...state.posts, ...post], "id") })),
  })
);
