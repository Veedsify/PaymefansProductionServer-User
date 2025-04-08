import { UserMediaProps, UserPostPropsOther } from "@/types/components";
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
  likePost: (postId: string, likeData: Post["PostLike"][number]) => void;
  unlikePost: (postId: string, userId: number) => void;
  repostPost: (postId: string) => void;
};

export const usePersonalProfileStore = create<PersonalProfileContext>(
  (set) => ({
    posts: [],

    setPosts: (post: Post[]) =>
      set((state) => ({
        posts: _.uniqBy(
          [...state.posts, ...post],
          (item) => `${item.id}-${item.post_likes}`
        ),
      })),

    likePost: (postId, likeData) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                post_likes: post.post_likes + 1,
                PostLike: [...post.PostLike, likeData],
              }
            : post
        ),
      })),

    unlikePost: (postId, userId) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                post_likes: Math.max(0, post.post_likes - 1),
                PostLike: post.PostLike.filter(
                  (like) => like.user_id !== userId
                ),
              }
            : post
        ),
      })),

    repostPost: (postId) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                post_reposts: post.post_reposts + 1,
              }
            : post
        ),
      })),
  })
);

type OtherProfileContext = {
  posts: UserPostPropsOther[];
  setPosts: (posts: UserPostPropsOther[]) => any;
};

export const useOtherProfilePostsStore = create<OtherProfileContext>((set) => ({
  setPosts: (posts: UserPostPropsOther[]) =>
    set((state) => ({ posts: _.uniqBy([...state.posts, ...posts], "id") })),
  posts: [],
}));
