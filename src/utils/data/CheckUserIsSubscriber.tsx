import { AuthUserProps } from "@/types/User";
import axios from "axios";
import { getToken } from "../Cookie";

type PostComponentUser = {
  id: number;
  name: string;
  link: string;
  username: string;
  image: string;
};

export const checkUserIsSubscriber = async (
  user: PostComponentUser,
  authUser?: AuthUserProps
) => {
  try {
    const token = getToken();
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/subscribers/check`,
      {
        main_user_id: user.id,
        user_id: authUser?.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.isSubscriber;
  } catch (error) {
    console.error(error);
    return false;
  }
};
