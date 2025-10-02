import type { SubscriptionTiersProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { AxiosError } from "axios";
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
        message: saveSubscriptions.data.message || "Save failed.",
      };
    return {
      error: false,
      message: saveSubscriptions.data.message || "Save failed.",
    };
  } catch (error) {
    console.log(error);
    if (error instanceof AxiosError) {
      return {
        error: true,
        message: error?.response?.data.message || "Save failed.",
      };
    }
  }
}
