import axios from "axios";
import axiosInstance from "../Axios";
import { getToken } from "../Cookie";

export async function saveUserSettings(userData: any) {
  return await axiosInstance.post(
    `/profile/update`,
    userData,
    {
      withCredentials: true,
    }
  );
}
