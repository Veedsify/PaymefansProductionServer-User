import ROUTE from "@/config/routes";
import { PostData } from "@/types/Components";
import axios from "axios";
import { getToken } from "../Cookie";
import axiosInstance from "@/utils/Axios";
import { fmt } from "@/constants/path";

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
