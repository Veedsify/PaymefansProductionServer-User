import axiosInstance from "../Axios";
import { getToken } from "../Cookie";

export async function saveUserSettings(userData: any) {
  return await axiosInstance.post(
    `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/update`,
    {
      userData,
    },
  );
}
