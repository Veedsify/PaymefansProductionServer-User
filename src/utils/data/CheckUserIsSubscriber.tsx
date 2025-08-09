import { AuthUserProps } from "@/types/User";
import axios from "axios";
import { getToken } from "../Cookie";
import axiosInstance from "../Axios";

type PostComponentUser = {
  id: number;
  name: string;
  link: string;
  username: string;
  image: string;
};

export const checkUserIsSubscriber = async (
  user: PostComponentUser,
  authUser?: AuthUserProps,
) => {
  try {
    const res = await axiosInstance.post(`/subscribers/check`, {
      main_user_id: user.id,
      user_id: authUser?.id,
    });
    return res.data.isSubscriber;
  } catch (error) {
    console.error(error);
    return false;
  }
};
