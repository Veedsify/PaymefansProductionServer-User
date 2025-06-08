import { getToken } from "@/utils/Cookie";

export default async function followUser(userId: number, action: "follow" | "unfollow") {
    const token = getToken();
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/action/${action}/${userId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to follow/unfollow user");
    }

    return response.json();
}