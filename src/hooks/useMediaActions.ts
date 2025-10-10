import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { usePointsStore } from "@/contexts/PointsContext";
import payForPost from "@/utils/data/PayForPost";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { MediaDataTypeOtherProps } from "@/types/Components";

/**
 * Custom hook for handling media interaction actions
 * Similar to usePostActions but specifically for media panel
 */
export const useMediaActions = (
  media: MediaDataTypeOtherProps,
  profileUserId: number
) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const points = usePointsStore((state) => state.points);
  const { isGuest, user: authUser } = useAuthContext();
  const { toggleModalOpen } = useGuestModal();

  // Memoize stable values
  const stableValues = useMemo(
    () => ({
      postId: media.post.id,
      postPrice: Number(media.post.post_price || 0),
      accessible_to: media.accessible_to,
      isSubscribed: media.isSubscribed,
      hasPaid: media.hasPaid,
    }),
    [
      media.post.id,
      media.post.post_price,
      media.accessible_to,
      media.isSubscribed,
      media.hasPaid,
    ]
  );

  const promptSubscription = useCallback(async () => {
    return swal({
      title: "You need to be a subscriber to view this media",
      icon: "warning",
      buttons: {
        cancel: true,
        confirm: {
          text: "Subscribe",
          className: "bg-primary-dark-pink text-white",
        },
      },
    }).then((willSubscribe) => {
      if (willSubscribe) router.push(`/subscribe/${profileUserId}`);
    });
  }, [router, profileUserId]);

  const promptPayment = useCallback(async () => {
    return await swal({
      title: "This media is locked",
      text: `You need to pay ${stableValues.postPrice} points to view this media.`,
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
        if (isGuest) {
          return toggleModalOpen(
            "You need to be logged in to pay for this media"
          );
        }
        if (stableValues.postPrice > points) {
          return toast.error(
            "You don't have enough points to pay for this media",
            { id: "pay-for-media" }
          );
        }
        const pay = await payForPost({
          price: stableValues.postPrice,
          postId: stableValues.postId,
        });
        if (pay.error) {
          return toast.error(pay.message, { id: "pay-for-media" });
        }
        toast.success(pay.message, { id: "pay-for-media" });
        await queryClient.invalidateQueries({
          queryKey: ["user-points", authUser?.id],
        });
        await queryClient.invalidateQueries({
          queryKey: ["mediaOther"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["private-mediaOther"],
        });
        router.refresh();
      }
    });
  }, [
    stableValues.postPrice,
    stableValues.postId,
    points,
    queryClient,
    authUser?.id,
    router,
    isGuest,
    toggleModalOpen,
  ]);

  const handleLockedMediaClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (isGuest) {
        return toggleModalOpen("You need to be logged in to view this media");
      }

      // Check if media needs subscription
      if (
        stableValues.accessible_to === "subscribers" &&
        !stableValues.isSubscribed
      ) {
        return promptSubscription();
      }

      // Check if media needs payment
      if (stableValues.accessible_to === "price" && !stableValues.hasPaid) {
        return promptPayment();
      }
    },
    [
      isGuest,
      stableValues.accessible_to,
      stableValues.isSubscribed,
      stableValues.hasPaid,
      promptSubscription,
      promptPayment,
      toggleModalOpen,
    ]
  );

  return {
    handleLockedMediaClick,
    promptSubscription,
    promptPayment,
  };
};
