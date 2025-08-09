import ROUTE from "@/config/routes";
import { PostData } from "@/types/Components";
import axios from "axios";
import { getToken } from "../Cookie";
import axiosInstance from "@/utils/Axios";

export const getUserComments = async (post: PostData, page: number) => {
  try {
    const response = await axiosInstance.get(
      `${ROUTE.GET_COMMENTS(post.post_id)}?page=${page}`,
    );
    if (!response.data.error) {
      return response.data;
    }
    return [];
  } catch (err: any) {
    console.error(err.message);
  }
};
