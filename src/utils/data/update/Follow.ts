import axiosInstance from "@/utils/Axios";
export default async function followUser(userId: number, action: "follow" | "unfollow") {
    const response = await axiosInstance(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/action/${action}/${userId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        }
    );
    return response.data
}