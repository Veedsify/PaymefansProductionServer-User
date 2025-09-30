import axios from "axios";
import axiosInstance from "../Axios";

export const fetchConversationReceiver = async ({
  pageParam,
  conversationId,
  cursor,
}: {
  pageParam: number;
  conversationId: string;
  cursor: number;
}) => {
  try {
    const response = await axiosInstance(
      `/conversations/receiver/${conversationId}`,
    );

    if (response.data.error) {
      throw new Error(
        response.data.message || "Failed to retrieve conversation data",
      );
    }

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch conversation data");
  }
};

export const GetConversationMessages = async ({
  conversationId,
  cursor,
}: {
  conversationId: string;
  cursor: number | undefined;
}) => {
  try {
    const pageQuery = new URLSearchParams();
    if (cursor !== undefined) {
      pageQuery.append("cursor", cursor.toString());
    }
    const response = await axiosInstance(
      `/conversations/messages/${conversationId}?${pageQuery.toString()}`,
    );

    if (response.data.error) {
      throw new Error(response.data.message || "Failed to fetch messages");
    }

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch messages");
  }
};
