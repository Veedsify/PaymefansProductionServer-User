import axios from "axios";
import toast from "react-hot-toast";
import {SubscriptionTiersProps} from "@/types/Components";
import {getToken} from "@/utils/Cookie";
export default async function AddSubscriptionTiers({tiers}: { tiers: SubscriptionTiersProps[] }) {
    const token = getToken()
    try {
        const saveSubscriptions = await axios.post(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/subscribers/create/subscription-tiers`, {tiers}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        if (saveSubscriptions.status !== 200) return {
            error: true,
        }
        return {
            error: false,
        }
    } catch (e: any) {
        console.log(e)
        return {
            error: true,
        }
    }
}
