import axios, { type AxiosResponse } from "axios";
import axiosInstance from "../Axios";

export const createNewConversation = async ({
  userId,
  profileId,
}: {
  userId: string;
  profileId: string;
}) => {
  const response: Promise<AxiosResponse<any>> = axiosInstance.post(
    "/conversations/create-new",
    {
      userId,
      profileId,
    },
  );
    return response;
};
