import type { SubscriptionTiersProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
export default async function AddSubscriptionTiers({
  tiers,
}: {
  tiers: SubscriptionTiersProps[];
}) {
  try {
    const saveSubscriptions = await axiosInstance.post(
      `/subscribers/create/subscription-tiers`,
      { tiers },
    );
    if (saveSubscriptions.status !== 200)
      return {
        error: true,
      };
    return {
      error: false,
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
    };
  }
}
