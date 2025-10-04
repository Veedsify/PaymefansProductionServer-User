import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { usePointsStore } from "@/contexts/PointsContext";
import payForPost from "@/utils/data/PayForPost";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { useAuthContext } from "@/contexts/UserUseContext";

/**
 * Custom hook for handling post interaction actions
 * Separates complex action logic from the main component with optimized memoization
 */
export const usePostActions = (data: any, user: any, permissions: any) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const points = usePointsStore((state) => state.points);
  const {isGuest} = useAuthContext();
  const{toggleModalOpen} = useGuestModal()
  // Memoize stable values to prevent callback recreation
  const stableValues = useMemo(() => ({
    userId: user.user_id,
    postId: data.id,
    postPrice: Number(data.post_price),
    postStatus: data.post_status,
    postIdSlug: data.post_id,
  }), [user.user_id, data.id, data.post_price, data.post_status, data.post_id]);

  const promptSubscription = useCallback(async () => {
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
      if (willSubscribe) router.push(`/subscribe/${stableValues.userId}`);
    });
  }, [router, stableValues.userId]);

  const promptPayment = useCallback(async () => {
    return await swal({
      title: "This post is locked",
      text: `You need to pay ${stableValues.postPrice} points to view this post.`,
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
        if (isGuest){
          return toggleModalOpen("You need to be logged in to pay for this post");
        }
        if (stableValues.postPrice > points) {
          return toast.error(
            "You don't have enough points to pay for this post",
            { id: "pay-for-post" },
          );
        }
        const pay = await payForPost({ price: stableValues.postPrice, postId: stableValues.postId });
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
  }, [stableValues.postPrice, stableValues.postId, points, queryClient, user.id, router]);

  const handlePostClick = useCallback(
    async (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLAnchorElement ||
        target instanceof HTMLButtonElement
      )
        return;

      e.preventDefault();

      if (permissions.needsSubscription) {
        return promptSubscription();
      }

      if (permissions.needsPayment) {
        return promptPayment();
      }

      if (stableValues.postStatus !== "approved") {
        await swal({
          title: "This post is still processing",
          text: "Only you can view this. Post anytime — the borders will disappear when it's fully ready.",
          icon: "warning",
        });
        return;
      }

      router.push(`/posts/${stableValues.postIdSlug}`);
    },
    [
      permissions.needsSubscription,
      permissions.needsPayment,
      stableValues.postStatus,
      stableValues.postIdSlug,
      router,
      promptSubscription,
      promptPayment,
    ],
  );

  const handleNonSubscriberClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (permissions.needsSubscription) {
        e.preventDefault();
        return promptSubscription();
      }

      if (stableValues.postStatus !== "approved") {
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
    },
    [
      permissions.needsSubscription,
      permissions.needsPayment,
      stableValues.postStatus,
      promptSubscription,
      promptPayment,
    ],
  );

  return {
    handlePostClick,
    handleNonSubscriberClick,
    promptSubscription,
    promptPayment,
  };
};
