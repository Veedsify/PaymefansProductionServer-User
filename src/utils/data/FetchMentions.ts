import type { MentionUser } from "@/types/Components";
import axiosInstance from "../Axios";

export default async function FetchMentions(
  query: string,
): Promise<MentionUser[]> {
  try {
    // Make sure to import axios at the top of your file: import axios from "axios";
    const response = await axiosInstance.get(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/mentions`,
      {
        params: { query: query },
      },
    );

    const data = response.data;
    return data.mentions || [];
  } catch (error) {
    console.error("Failed to fetch mentions:", error);
    return [];
  }
}
