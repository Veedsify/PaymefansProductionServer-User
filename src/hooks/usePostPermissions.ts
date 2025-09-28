import { useMemo } from "react";
import { PostComponentProps } from "@/types/Components";

/**
 * Custom hook to handle all permission logic for posts
 * Memoizes expensive permission calculations with optimized dependency tracking
 */
export const usePostPermissions = (data: any, user: any, authUser: any) => {
  return useMemo(() => {
    // Extract values once to avoid repeated property access
    const { isSubscribed, hasPaid, post_audience } = data;
    const userId = user?.id;
    const authUserId = authUser?.id;
    const isCreator = userId === authUserId;

    // Early return for creator - they can view everything
    if (isCreator) {
      return {
        isSubscribed,
        isCreator: true,
        hasPaid,
        canView: true,
        needsSubscription: false,
        needsPayment: false,
      };
    }

    // Optimize audience checks with early returns
    if (post_audience === "public") {
      return {
        isSubscribed,
        isCreator: false,
        hasPaid,
        canView: true,
        needsSubscription: false,
        needsPayment: false,
      };
    }

    const needsSubscription = post_audience === "subscribers" && !isSubscribed;
    const needsPayment = post_audience === "price" && !hasPaid;
    const canView =
      (post_audience === "subscribers" && isSubscribed) ||
      (post_audience === "price" && hasPaid);

    return {
      isSubscribed,
      isCreator: false,
      hasPaid,
      canView,
      needsSubscription,
      needsPayment,
    };
  }, [
    data.isSubscribed,
    data.hasPaid,
    data.post_audience,
    user?.id,
    authUser?.id,
  ]);
};
