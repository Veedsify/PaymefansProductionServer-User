import axiosInstance from "../axios";
import { getToken } from "../cookie.get";

export default async function GetConversationMessages(conversationId: string) {
    const token = getToken()
    const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/conversation/get-messages/${conversationId}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        cache: "no-store"
    })
    if (response.ok) {
        const result = await response.json()
        return result
    }
    return null
}