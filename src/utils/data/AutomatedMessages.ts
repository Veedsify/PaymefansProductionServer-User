import { getToken } from "@/utils/Cookie";
import axiosInstance from "../Axios";

interface AutomatedMessageData {
  followers?: {
    text: string;
    attachments: any[];
    isActive: boolean;
  };
  subscribers?: {
    text: string;
    attachments: any[];
    isActive: boolean;
  };
}

export const automatedMessagesAPI = {
  // Get automated messages
  getMessages: async () => {
    const response = await axiosInstance.get(`/automated-messages`, {
      method: "GET",
    });
    return response.data;
  },

  // Update automated messages
  updateMessages: async (data: AutomatedMessageData) => {
    const response = await axiosInstance.post(
      `/automated-messages/update`,
      data,
    );

    return response.data;
  },

  // Delete automated message
  deleteMessage: async (messageType: "followers" | "subscribers") => {
    const token = getToken();
    const response = await axiosInstance.delete(
      `/automated-messages/${messageType}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },
};
