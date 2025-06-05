import { create } from "zustand";

type User = {
  id: number;
  email: string;
  name: string;
  fullname: string;
  user_id: string;
  username: string;
  profile_image: string;
  profile_banner: string;
  is_model: boolean;
  bio: string;
  Subscribers: {
    subscriber_id: number;
  }[];
  total_followers: number;
};

type UserMedia = {
  id: number;
  media_id: string;
  post_id: number;
  media_type: string;
  media_state: "completed" | "processing";
  url: string;
  blur: string;
  poster: string;
  locked: boolean;
  accessible_to: string;
  created_at: string;
  updated_at: string;
  userId?: number;
  index: number;
};

type PostLike = {
  id: number;
  like_id: number;
  user_id: number;
  post_id: string;
  created_at: string;
  updated_at: string;
};

type PostComment = {
  id: number;
  comment_id: string;
  user_id: number;
  post_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

type UserRepost = {
  id: number;
  repost_id: string;
  user_id: number;
  post_id: number;
  created_at: string;
  updated_at: string;
};

type Post = {
  id: number;
  post_id: string;
  was_repost: boolean;
  repost_username: string;
  repost_id: string;
  user_id: number;
  content: string;
  media: any[];
  post_status: string;
  post_audience: string;
  post_price: number;
  post_is_visible: boolean;
  post_likes: number;
  post_comments: number;
  post_reposts: number;
  created_at: Date;
  updated_at: string;
  user: User;
  UserMedia: UserMedia[];
  likedByme: boolean;
  isSubscribed: boolean;
  wasReposted: boolean;
  score?: number;
};

type HomeStoreFeed = {
  posts: Post[];
  addToPosts: (posts: Post[]) => void;
};

export const useHomeFeedStore = create<HomeStoreFeed>((set) => ({
  posts: [],
  addToPosts: (posts: Post[]) =>
    set((state) => {
      const uniquePosts = posts.filter(
        (newPost) =>
          !state.posts.some((existingPost) => existingPost.id === newPost.id)
      );
      let currentposts = [...state.posts, ...uniquePosts];
      return { posts: currentposts };
    }),
}));
