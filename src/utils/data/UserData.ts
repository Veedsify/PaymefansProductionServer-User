
import { AuthUserProps } from "@/features/user/types/user";
import axiosInstance from "../Axios";
const getUserData = async (): Promise<Partial<AuthUserProps>> => {
  try {
    const res = await axiosInstance.get(`/auth/retrieve`);
    return res.data.user as AuthUserProps;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
export default getUserData;
