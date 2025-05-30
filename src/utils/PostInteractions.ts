import { AuthUserProps } from "@/types/User";
import axios from "axios";
import { getToken } from "./Cookie";
import { PostData } from "@/types/Components";
let token = getToken();

const axionsIns = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TS_EXPRESS_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

export const LikeThisPost = async ({
  data,
}: {
  data: PostData;
}): Promise<
  | {
      id: number;
      like_id: number;
      user_id: number;
      post_id: string;
      created_at: string;
      updated_at: string;
      isLiked: boolean;
    }
  | undefined
> => {
  const postId = data.id;
  const res = await axionsIns.post(`/post/like/${postId}`);
  if (res.status === 200) {
    return res.data;
  }
};
