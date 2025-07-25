import axios from "axios";
import { getToken } from "../Cookie";

export const FetchConversationReceiver = async ({
  pageParam,
  conversationId,
  cursor,
}: {
  pageParam: number;
  conversationId: string;
  cursor: number;
}) => {
  try {

    const token = getToken();
    const response = await axios(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/conversations/receiver/${conversationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.error) {
      throw new Error(response.data.message || "Failed to retrieve conversation data");
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
  cursor: number | undefined
}) => {
  try {
    const token = getToken();
    const pageQuery = new URLSearchParams();
    if (cursor !== undefined) {
      pageQuery.append("cursor", cursor.toString());
    }
    const response = await axios(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/conversations/messages/${conversationId}?${pageQuery.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.error) {
      throw new Error(response.data.message || "Failed to fetch messages");
    }

    return response.data;

  } catch (error) {
    throw new Error("Failed to fetch messages");
  }
}