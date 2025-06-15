import { MentionUser } from "@/types/Components";
import { getToken } from "../Cookie";

export default async function FetchMentions(query: string): Promise<MentionUser[]> {
    try {
        const token = getToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/mentions?query=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching mentions: ${response.statusText}`);
        }

        const data = await response.json();
        return data.mentions || [];
    } catch (error) {
        console.error("Failed to fetch mentions:", error);
        return [];
    }
}