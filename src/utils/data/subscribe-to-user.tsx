import axios from "axios"
import {getToken} from "../cookie.get"
import toast from "react-hot-toast"

export const SubscribeToUser = async (profileId: string, id: number) => {
    const token = getToken()
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/subscribe/subscription-to-user/${profileId}`, {
            tier_id: id
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (err) {
        console.log(err)
        toast.error("An error occurred while subscribing to the user")
    }
}
