import { useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import swal from "sweetalert";
import payForPost from "@/utils/data/PayForPost";
import { useQueryClient } from "@tanstack/react-query";
import { usePointsStore } from "@/contexts/PointsContext";

/**
 * Custom hook for handling post interaction actions
 * Separates complex action logic from the main component
 */
export const usePostActions = (data: any, user: any, permissions: any) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const points = usePointsStore((state) => state.points);

    const promptSubscription = useCallback(() => {
        return swal({
            title: "You need to be a subscriber to view this post",
            icon: "warning",
            buttons: {
                cancel: true,
                confirm: {
                    text: "Subscribe",
                    className: "bg-primary-dark-pink text-white",
                },
            },
        }).then((willSubscribe) => {
            if (willSubscribe) router.push(`/subscribe/${user.user_id}`);
        });
    }, [router, user.user_id]);

    const promptPayment = useCallback(async () => {
        return await swal({
            title: "This post is locked",
            text: `You need to pay ${data.post_price} points to view this post.`,
            icon: "warning",
            buttons: {
                cancel: true,
                confirm: {
                    text: "Pay",
                    className: "bg-primary-dark-pink text-white",
                },
            },
        }).then(async (willPay) => {
            if (willPay) {
                const price = Number(data.post_price);
                if (price > points) {
                    return toast.error(
                        "You don't have enough points to pay for this post",
                        { id: "pay-for-post" }
                    );
                }
                const pay = await payForPost({ price, postId: data.id });
                if (pay.error) {
                    return toast.error(pay.message, { id: "pay-for-post" });
                }
                toast.success(pay.message, { id: "pay-for-post" });
                await queryClient.invalidateQueries({
                    queryKey: ["user-points", user.id],
                });
                router.refresh();
            }
        });
    }, [data.post_price, data.id, points, queryClient, user.id, router]);

    const handlePostClick = useCallback(async (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
            target instanceof HTMLAnchorElement ||
            target instanceof HTMLButtonElement
        ) return;

        e.preventDefault();

        if (permissions.needsSubscription) {
            return promptSubscription();
        }

        if (permissions.needsPayment) {
            return promptPayment();
        }

        if (data.post_status !== "approved") {
            await swal({
                title: "This post is still processing",
                text: "Only you can view this. Post anytime — the borders will disappear when it's fully ready.",
                icon: "warning",
            });
            return;
        }

        router.push(`/posts/${data.post_id}`);
    }, [permissions, data.post_status, data.post_id, router, promptSubscription, promptPayment]);

    const handleNonSubscriberClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();

        if (permissions.needsSubscription) {
            e.preventDefault();
            return promptSubscription();
        }

        if (data.post_status !== "approved") {
            e.preventDefault();
            return swal({
                title: "This post is still processing",
                text: "Only you can view this. Post anytime — the borders will disappear when it's fully ready.",
                icon: "warning",
            });
        }

        if (permissions.needsPayment) {
            e.preventDefault();
            return promptPayment();
        }
    }, [permissions, data.post_status, promptSubscription, promptPayment]);

    return {
        handlePostClick,
        handleNonSubscriberClick,
        promptSubscription,
        promptPayment,
    };
};