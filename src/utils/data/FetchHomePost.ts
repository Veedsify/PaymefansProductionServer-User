import axios, { AxiosError } from "axios";
import { getToken } from "../Cookie";

interface ApiResponse<T> {
  posts: T;
  hasMore: boolean;
  nextCursor?: string;
}

export const fetchHomePosts = async (API_URL: string) => {
  try {
    const response = await axios.get(API_URL);

    return response.data as ApiResponse<any>;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.message || "Failed to fetch posts");
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response received from server");
      }
    }
    // Something happened in setting up the request that triggered an Error
    throw new Error("Error fetching posts");
  }
};
