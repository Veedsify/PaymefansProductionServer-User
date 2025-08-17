import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axiosInstance from "../Axios";

export const getPost = async (postId: string) => {
    try {
        const token = (await cookies()).get("token")?.value;
        const request = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/single/${postId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (request.data.status === false) {
            return redirect("/404");
        }
        return request.data.data;
    } catch (error) {
        console.log(error);
        redirect("/404");
    }
};
