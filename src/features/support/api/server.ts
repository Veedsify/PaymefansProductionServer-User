import axiosInstance from "@/utils/Axios";
import type { HelpCategoryProp } from "@/types/Components";

export async function getHelpCategories(): Promise<HelpCategoryProp[]> {
  try {
    const response = await axiosInstance.get("/help/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching help categories:", error);
    return [];
  }
}

