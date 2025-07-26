"use client";

import { useUserAuthContext } from "@/lib/UserUseContext";
import { getToken } from "@/utils/Cookie";
import getAllPoints from "@/utils/data/GetPoints";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import swal from "sweetalert";
import toast from "react-hot-toast";
import { ButtonList } from "sweetalert/typings/modules/options/buttons";
import { LucideLoader2, X } from "lucide-react";
import { usePointsStore } from "@/contexts/PointsContext";
type Points = {
  id: number;
  points: number;
  amount: number;
  points_buy_id: string;
};
const TipModel = ({
  userdata,
  close,
}: {
  userdata: any;
  close: () => void;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [points, setPoints] = useState<Points[]>([]);
  const { points: pointBalance } = usePointsStore();
  const { user } = useUserAuthContext();
  const router = useRouter();
  useEffect(() => {
    async function fetchPoints() {
      const points: Points[] = await getAllPoints();
      setPoints(points);
      setLoading(false);
    }
    fetchPoints();
  }, []);

  const handlePointsClick = useCallback(
    async (id: string) => {
      const selectedPoint = points.find((point) => point.points_buy_id === id);

      if (!selectedPoint) {
        toast.error("Invalid points selection", {
          id: "buy-points",
        });
        return;
      }
      if (pointBalance < selectedPoint?.points) {
        toast.error(
          `You don't have enough points to tip ${selectedPoint.points} points`,
          {
            id: "buy-points",
          },
        );
        return;
      }

      if (user?.id === userdata.id) {
        toast.error("You can't buy points for your own post", {
          id: "buy-points",
        });
        return;
      }

      await swal({
        title: "Are you sure?",
        text: `Are you sure you want to tip ${selectedPoint.points} points to ${
          userdata.name || userdata.username
        }? This will cost you ₦${Number(
          selectedPoint.amount,
        ).toLocaleString()}.`,
        icon: "info",
        buttons: {
          cancel: "Cancel",
          confirm: {
            text: "Yes, Tip!",
            value: true,
            visible: true,
            className: "bg-primary-dark-pink text-white",
          },
        } as ButtonList,
      }).then(async (willGift) => {
        if (willGift) {
          const token = getToken();
          const giftPointsToUser = await fetch(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/tip/model`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                id: id,
                points: points,
                modelId: userdata.id,
              }),
            },
          );
          if (!giftPointsToUser.ok) {
            toast.error("An error occurred while gifting points", {
              id: "buy-points",
            });
          }
          const data = await giftPointsToUser.json();
          if (!data.error) {
            toast.success(
              `You have successfully tipped ${selectedPoint.points} points to ${
                userdata?.name || userdata?.username
              }`,
              {
                id: "buy-points",
              },
            );
            close();
            router.refresh();
          } else {
            toast.error(data.message, {
              id: "buy-points",
            });
          }
        } else {
          toast.dismiss();
        }
      });
    },
    [points, pointBalance, user, userdata, router, close],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={close}
      className="fixed flex items-center justify-center bg-black/70 inset-0 z-[200]"
    >
      <motion.div
        initial={{
          animationDelay: "0.5s",
          scale: 0.9,
          opacity: 0.8,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.9,
          opacity: 0.8,
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 lg:rounded-xl p-4 md:p-8 w-full md:max-w-2xl h-dvh lg:max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg md:text-2xl">Send a Tip</h2>
          <span className="cursor-pointer" onClick={close}>
            <X />
          </span>
        </div>
        <p className="mb-4">
          Show your appreciation by sending a tip to{" "}
          {userdata.name || userdata.username}.
        </p>
        <div className="flex items-center justify-center w-full">
          {loading && (
            <span className="p-8">
              <LucideLoader2
                size={25}
                className="text-primary-dark-pink animate-spin"
              />
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {points.map((point) => (
            <div
              key={point.id}
              className="cursor-pointer rounded-2xl bg-coins-card-bottom dark:bg-slate-800 dark:border-slate-800 dark:border select-none"
              onClick={() => handlePointsClick(point.points_buy_id)}
            >
              <div className="flex py-5 rounded-tr-2xl rounded-tl-2xl items-center gap-2 justify-center dark:bg-gray-950 bg-white m-[2px]">
                <Image
                  width={20}
                  height={20}
                  src="/site/coin.svg"
                  className="h-5"
                  alt=""
                />
                <h2 className="text-xl font-bold text-primary-dark-pink">
                  {point.points}
                </h2>
              </div>
              <div>
                <h3 className="py-3 text-sm font-medium text-center">
                  ₦{Number(point.amount).toLocaleString()}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TipModel;
