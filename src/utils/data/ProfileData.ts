import { fmt } from "@/constants/path";
import { ProfileUserProps } from "@/features/user/types/user";
import axiosInstance from "../Axios";

type getUserProfileProps = {
  user_id: string;
  viewerId: number | null;
};

const getUserProfile = async ({ user_id, viewerId }: getUserProfileProps) => {
  const username = user_id.startsWith("@") ? user_id : `@${user_id}`;
  const url = fmt(`/profile/user?username=%s`, username);
  const res = await axiosInstance.post(url, { username, viewerId });
  return res.data;
};

export default getUserProfile;
