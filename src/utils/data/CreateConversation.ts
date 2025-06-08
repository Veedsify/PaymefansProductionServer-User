import axios, { AxiosResponse } from "axios"
import axiosInstance from "../Axios"

export const createNewConversation = async ({ userId, profileId }: { userId: string, profileId: string }) => {
    const response: Promise<AxiosResponse<any>> = axiosInstance.post("/conversations/create-new", {
        userId,
        profileId
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${document.cookie.split("token=")[1].split(";")[0]}`
        }
    })
    if (response) {
        return response
    }
    return null
}
