import axios from "axios";
import axiosInstance from "../Axios";
import { getToken } from "../Cookie";

export async function saveUserSettings(userData: any) {
  return await axios.post(
    `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/update`,
    userData,
    {
      withCredentials: true,
    }
  );
}
