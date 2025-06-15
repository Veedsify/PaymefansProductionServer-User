import { cookies } from "next/headers";
import axios from "axios";
import { redirect } from "next/navigation";

export const getPost = async (postId: string) => {
    try {
        const token = (await cookies()).get("token")?.value;
        const request = await axios.get(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/single/${postId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (request.data.status === false) {
            redirect("/404");
            return {}
        }
        return request.data.data;
    } catch (error) {
        console.log(error);
        redirect("/404");
    }
};
