import axiosInstance from "@/utils/Axios";

export interface PageData {
  title: string;
  content: string;
}

export interface ErrorData {
  error: boolean;
  message: string;
}

export async function getPageData(
  page: string
): Promise<PageData | ErrorData | null> {
  try {
    const res = await axiosInstance(`/pages/${page}`);
    const response = res.data;
    if (!response.error) {
      return response as PageData;
    }
    return {
      error: true,
      message: "No data found",
    } as ErrorData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

