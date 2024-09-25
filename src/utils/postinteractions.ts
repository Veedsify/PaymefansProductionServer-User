import { AuthUserProps } from "@/types/user";
import axios from "axios";
import { getToken } from "./cookie.get";
import { PostData } from "@/types/components";
let token = getToken()

const axionsIns = axios.create({
    baseURL: process.env.NEXT_PUBLIC_EXPRESS_URL,
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
})

export const LikeThisPost = async ({ data }: { data: PostData }) => {
    const postId = data.id
    const res = await axionsIns.post(`/post/like/${postId}`)
    if (res.status === 200) {
        return res.data.isLiked
    }
    return false
}