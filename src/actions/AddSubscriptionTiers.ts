import {SubscriptionTiersProps} from "@/types/Components";
import axiosInstance from "@/utils/Axios";
export default async function AddSubscriptionTiers({tiers}: { tiers: SubscriptionTiersProps[] }) {
    try {
        const saveSubscriptions = await axiosInstance.post(`/subscribers/create/subscription-tiers`, {tiers}, {
           withCredentials: true,
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
