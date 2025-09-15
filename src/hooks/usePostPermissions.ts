import { useMemo } from "react";
import { PostComponentProps } from "@/types/Components";

/**
 * Custom hook to handle all permission logic for posts
 * Memoizes expensive permission calculations
 */
export const usePostPermissions = (data: any, user: any, authUser: any) => {
    return useMemo(() => {
        const isSubscribed = data.isSubscribed;
        const isCreator = user?.id === authUser?.id;
        const hasPaid = data.hasPaid;

        const canView =
            isCreator ||
            data.post_audience === "public" ||
            (data.post_audience === "subscribers" && isSubscribed) ||
            (data.post_audience === "price" && hasPaid);

        const needsSubscription =
            data.post_audience === "subscribers" && !(isSubscribed || isCreator);

        const needsPayment =
            data.post_audience === "price" && !(isCreator || hasPaid);

        return {
            isSubscribed,
            isCreator,
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