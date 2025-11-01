"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import swal from "sweetalert";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { AuthUserProps } from "@/features/user/types/user";
import { checkUserIsSubscriber } from "@/utils/data/CheckUserIsSubscriber";

type CreateSubscriptionButtonProps = {
  userdata: any;
};
const CreateSubscriptionButton = ({
  userdata,
}: CreateSubscriptionButtonProps) => {
  const [isSubscriber, setIsSubscriber] = useState<boolean>(false);
  const { user: authUser, isGuest } = useAuthContext();
  const { toggleModalOpen } = useGuestModal();
  const router = useRouter();
  useLayoutEffect(() => {
    const checkSubscription = async (user: any, authUser: any) => {
      const res = await checkUserIsSubscriber(user, authUser as AuthUserProps);
      setIsSubscriber(res);
      return res;
    };
    if (authUser && !isGuest && userdata) {
      checkSubscription(userdata, authUser);
    }
  }, [authUser, userdata]);

  const handleOnSubscribe = () => {
    if (!isGuest) {
      router.push(`/subscribe/${userdata.user_id}`);
      return;
    }
    toggleModalOpen(
      "You need to login to subscribe to" +
        (userdata?.name || "this user") +
        ".",
    );
  };
  const handleIfSubscriber = (e: any) => {
    if (isSubscriber) {
      e.preventDefault();
      swal({
        title: `Hi ${authUser?.name}!`,
        text: "Subsctiptions will be automatically cancelled after the end of the subscription period.",
        icon: "error",
      });
    }
    handleOnSubscribe();
  };

  return (
    <button
      onClick={handleIfSubscriber}
      className={`sm:px-4 py-1 px-2 text-xs md:text-sm font-semibold  ${
        isSubscriber
          ? " bg-transparent text-black dark:text-white"
          : "bg-black text-white dark:bg-white dark:text-black"
      } border border-black dark:border-white rounded `}
    >
      {isSubscriber ? "Subscribed" : "Subscribe"}
    </button>
  );
};

export default CreateSubscriptionButton;
