import type { HelpCategoryProp } from "@/types/Components";
import axios from "axios";

export async function getHelpCategories(): Promise<HelpCategoryProp[]> {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/help/categories`,
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching help categories:", error);
        return [];
    }
}
