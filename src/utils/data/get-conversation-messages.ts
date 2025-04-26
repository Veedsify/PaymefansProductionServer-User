import { getToken } from "../cookie.get";

export const fetchConversationMessages = async ({
  pageParam,
  conversationId,
}: {
  pageParam: number;
  conversationId: string;
}) => {
  const token = getToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/conversations/messages/${conversationId}?page=${pageParam}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (response.ok) {
    const result = await response.json();
    console.log("Fetched messages:", result);
    return result;
  }

  throw new Error("Failed to fetch messages");
};
