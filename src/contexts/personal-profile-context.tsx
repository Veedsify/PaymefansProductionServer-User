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
  likedByme: boolean;
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
};

type PersonalProfileContext = {
  posts: Post[];
  setPosts: (post: Post[]) => void;
  likePost: (postId: string) => void;
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
    likePost: (postId) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.post_id === postId
            ? {
              ...post,
              post_likes: post.post_likes + 1,
              likedByme: true,
            }
            : post
        ),
      })),
    unlikePost: (postId, _) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.post_id === postId
            ? {
              ...post,
              post_likes: Math.max(0, post.post_likes - 1),
              likedByme: false,
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
  likePost: (postId: string) => void;
  unlikePost: (postId: string, userId: number) => void;
  repostPost: (postId: string) => void;
};

export const useOtherProfilePostsStore = create<OtherProfileContext>((set) => ({
  setPosts: (posts: UserPostPropsOther[]) =>
    set((state) => ({ posts: _.uniqBy([...state.posts, ...posts], "id") })),
  posts: [],
  likePost: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.post_id === postId
          ? {
            ...post,
            post_likes: post.post_likes + 1,
            likedByme: true,
          }
          : post
      ),
    })),
  unlikePost: (postId, _) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.post_id === postId
          ? {
            ...post,
            post_likes: Math.max(0, post.post_likes - 1),
            likedByme: false,
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
}));
