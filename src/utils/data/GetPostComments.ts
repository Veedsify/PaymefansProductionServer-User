import axios from "axios";
import ROUTE from "@/config/routes";
import { fmt } from "@/constants/path";
import type { PostData } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { getToken } from "../Cookie";

export const getUserComments = async (
  post: PostData,
  page: number,
  userId: number | undefined,
) => {
  try {
    const response = await axiosInstance.post(
      fmt(`/post/%s/comments?page=%s`, post.post_id, page),
      { userId },
    );
    if (!response.data.error) {
      return response.data;
    }
    return [];
  } catch (err: any) {
    console.error(err.message);
  }
};
