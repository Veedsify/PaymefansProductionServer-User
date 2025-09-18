"use client";
import { usePointsStore } from "@/contexts/PointsContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import axiosInstance from "@/utils/Axios";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ButtonList } from "sweetalert/typings/modules/options/buttons";

const PointsBuy = ({
  points,
  amount,
  points_buy_id,
  postId,
  userId,
}: {
  points: number;
  amount: number;
  points_buy_id: string;
  postId?: string;
  userId?: number;
}) => {
  const { points: userPointBalance } = usePointsStore();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const router = useRouter();
  const handlePointsClick = async (id: string) => {
    if (userPointBalance < points) {
      toast.error("Sorry, you don't have enough points to support this post", {
        id: "buy-points",
      });
      return;
    }

    if (user?.id === userId) {
      toast.error("You can't buy points for your own post", {
        id: "buy-points",
      });
      return;
    }

    swal({
      title: "Are you sure?",
      text: `You are about to gift ${points} points to this model`,
      icon: "info",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Yes, gift it!",
          value: true,
          visible: true,
          className: "bg-primary-dark-pink text-white",
        },
      } as ButtonList,
    }).then(async (willGift) => {
      if (willGift) {
        toast.loading("Sending Kindness...", {
          id: "buy-points",
        });
        // Make sure to import axios at the top of your file: import axios from "axios";
        try {
          const response = await axiosInstance.post(`/post/point/gift`, {
            points_buy_id: id,
            points: points,
            amount: amount,
            user_id: userId,
            post_id: postId,
          });
          const data = response.data;
          if (!data.error) {
            toast.success(
              `You have successfully gifted ${points} points to this post`,
              {
                id: "buy-points",
              }
            );
            queryClient.invalidateQueries({
              queryKey: ["userPoints", user?.id],
            });
            queryClient.invalidateQueries({
              queryKey: ["notifications", "1"],
            });
            // router.refresh();
          } else {
            toast.error(data.message, {
              id: "buy-points",
            });
          }
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message ||
              "An error occurred while gifting points",
            {
              id: "buy-points",
            }
          );
        }
      } else {
        toast.dismiss();
      }
    });
  };
  return (
    <div
      className="cursor-pointer select-none rounded-2xl bg-coins-card-bottom dark:bg-slate-800 dark:border-slate-800 dark:border"
      onClick={() => handlePointsClick(points_buy_id)}
    >
      <div className="flex py-5 rounded-tr-2xl rounded-tl-2xl items-center gap-2 justify-center dark:bg-gray-950 bg-white m-[2px]">
        <Image
          width={20}
          height={20}
          src="/site/coin.svg"
          className="h-auto"
          alt=""
        />
        <h2 className="text-xl font-bold text-primary-dark-pink">{points}</h2>
      </div>
      <div>
        <h3 className="py-3 text-sm font-medium text-center">
          ₦{Number(amount).toLocaleString()}
        </h3>
      </div>
    </div>
  );
};

export default PointsBuy;
