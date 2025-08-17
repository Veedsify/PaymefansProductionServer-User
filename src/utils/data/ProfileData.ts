import { ProfileUserProps } from "@/types/User";
import { getToken } from "../Cookie";
import axios from "axios";
import axiosInstance from "../Axios";

type getUserProfileProps = {
  user_id: string;
};

const getUserProfile = async ({ user_id }: getUserProfileProps) => {
  const username = user_id.startsWith("@") ? user_id : `@${user_id}`;
  const url = `/profile/user?username=${username}`;
  try {
    const res = await axiosInstance.post(url,{username});
    const data = res.data;
    if (data.status) {
      return data.user as ProfileUserProps;
    }
    return null;
  } catch (error) {
    throw new Error("Failed to fetch user profile");
  }
};

export default getUserProfile;
