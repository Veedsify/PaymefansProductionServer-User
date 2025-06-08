import { getToken } from "../Cookie";

export default async function FetchActiveSubscribers(cursor: number | null): Promise<{
    error: boolean;
    status: boolean;
    data?: any[];
    nextCursor?: number | undefined;
    message?: string;
}> {
    try {
        const queryParams = cursor && cursor > 0 ? `?cursor=${cursor}` : "";
        const token = getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/subscribers/active-subscribers${queryParams}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            return {
                error: true,
                status: false,
                message: errorData.message || "Failed to fetch active subscribers",
            };
        }
        const data = await response.json();
        return data
    }
    catch (error) {
        console.error("Error fetching active subscribers:", error);
        throw new Error("An error occurred while fetching active subscribers");
    }
}