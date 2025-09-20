import axios from "axios";
import toast from "react-hot-toast";
import axiosInstance from "../Axios";
import { getToken } from "../Cookie";

export const SubscribeToUser = async (profileId: string, id: number) => {
  try {
    const response = await axiosInstance.post(
      `/subscribers/subscription-to-user/${profileId}`,
      {
        tier_id: id,
      },
    );
    return response.data;
  } catch (err) {
    console.log(err);
    toast.error("An error occurred while subscribing to the user");
  }
};
