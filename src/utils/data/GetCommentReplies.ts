import axios from "axios";
import ROUTE from "@/config/routes";
import { getToken } from "../Cookie";

export const getCommentReplies = async (
  commentId: string,
  page: number = 1,
  limit: number = 10,
) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${ROUTE.GET_COMMENT_REPLIES(commentId)}?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.data.error) {
      return response.data;
    }

    return {
      error: true,
      message: response.data.message || "Failed to load replies",
      data: [],
      hasMore: false,
      total: 0,
    };
  } catch (error) {
    console.error("Error fetching comment replies:", error);
    return {
      error: true,
      message: "Network error while loading replies",
      data: [],
      hasMore: false,
      total: 0,
    };
  }
};

// Function to load more replies for a specific comment
const loadMoreCommentReplies = async (
  commentId: string,
  currentReplies: any[],
  page: number = 2,
) => {
  const response = await getCommentReplies(commentId, page);

  if (!response.error) {
    return {
      ...response,
      data: [...currentReplies, ...response.data],
    };
  }

  return response;
};
