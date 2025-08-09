import axiosInstance from "../Axios";
import { getToken } from "../Cookie";

export default async function FetchActiveSubscribers(
  cursor: number | null,
): Promise<{
  error: boolean;
  status: boolean;
  data?: any[];
  nextCursor?: number | undefined;
  message?: string;
}> {
  try {
    const queryParams = cursor && cursor > 0 ? `?cursor=${cursor}` : "";
    const response = await axiosInstance.get(
      `/subscribers/active-subscribers${queryParams}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching active subscribers:", error);
    throw new Error("An error occurred while fetching active subscribers");
  }
}
