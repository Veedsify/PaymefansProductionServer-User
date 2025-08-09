import axiosInstance from "@/utils/Axios";
export default async function followUser(userId: number, action: "follow" | "unfollow") {
    const response = await axiosInstance(
        `/profile/action/${action}/${userId}`,
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