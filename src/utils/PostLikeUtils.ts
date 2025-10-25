// utils/PostLikeUtils.ts
import axiosInstance from "@/utils/Axios";

interface PostLikeData {
  postId: string;
  likeCount: number;
  isLiked: boolean;
}

interface LikePostResponse {
  success: boolean;
  isLiked: boolean;
  likeCount: number;
  message: string;
}

interface MultipleLikeDataResponse {
  success: boolean;
  data: Record<string, { count: number; isLiked: boolean }>;
}

/**
 * Like or unlike a post using Redis-backed endpoint
 */
export const likePost = async (postId: string): Promise<LikePostResponse> => {
  try {
    const response = await axiosInstance.post(`/post/like/${postId}`, {});
    return response.data;
  } catch (error: any) {
    console.error("Error liking post:", error);
    throw new Error(error?.response?.data?.message || "Failed to like post");
  }
};

/**
 * Get like data for a single post
 */
const getPostLikeData = async (
  postId: string,
): Promise<PostLikeData> => {
  try {
    const response = await axiosInstance.get(`/post/like-data/${postId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error("Failed to fetch like data");
  } catch (error: any) {
    console.error("Error getting post like data:", error);
    // Fallback to default values
    return {
      postId,
      likeCount: 0,
      isLiked: false,
    };
  }
};

/**
 * Get like data for multiple posts efficiently
 */
const getMultiplePostsLikeData = async (
  postIds: string[],
): Promise<Record<string, { count: number; isLiked: boolean }>> => {
  try {
    if (postIds.length === 0) return {};

    const response = await axiosInstance.post(`/post/like-data/multiple`, {
      postIds,
    });

    if (response.data.success) {
      return response.data.data;
    }

    // Fallback to empty data
    const fallback: Record<string, { count: number; isLiked: boolean }> = {};
    postIds.forEach((id) => {
      fallback[id] = { count: 0, isLiked: false };
    });
    return fallback;
  } catch (error: any) {
    console.error("Error getting multiple posts like data:", error);
    // Fallback to empty data
    const fallback: Record<string, { count: number; isLiked: boolean }> = {};
    postIds.forEach((id) => {
      fallback[id] = { count: 0, isLiked: false };
    });
    return fallback;
  }
};
