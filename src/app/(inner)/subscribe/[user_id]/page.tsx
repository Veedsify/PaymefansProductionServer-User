"use client";;
import { getSocket } from "@/components/sub_components/sub/Socket";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { SubscribeToUser } from "@/utils/data/SubscribeToUser";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import numeral from "numeral";
import getFormattedStringFromDays from "@/utils/data/CalculateDays";
import { usePointsStore } from "@/contexts/PointsContext";
import axiosInstance from "@/utils/Axios";

type SubscribeProps = {
  params: {
    user_id: string;
  };
};

type ProfileUser = {
  user_id: string;
  profile_image: string;
  username: string;
  name: string;
  Model: {
    gender: string;
  };
  ModelSubscriptionPack: {
    ModelSubscriptionTier: {
      id: number;
      tier_name: string;
      tier_price: number;
      tier_duration: number;
      tier_description: string;
    }[];
  };
  Settings: {
    subscription_price: number;
    subscription_duration: number;
  };
};

const Subscribe = () => {
  const { user } = useUserAuthContext();
  const params = useParams();
  const [profileUser, setProfileUser] = useState<ProfileUser>();
  const router = useRouter();
  const points = usePointsStore((state) => state.points);
  const socket = getSocket();
  if (user?.user_id === params.user_id) {
    router.push("/profile");
  }

  useEffect(() => {
    document.title = "Subscribe";
    const fetchUserSubscription = async () => {
      try {
        const response = await axiosInstance.post(
          `/subscribers/subscription-data/${params.user_id}`,
          {},
          {
            withCredentials: true,
          },
        );
        if (response.data.status === false) {
          router.push("/404");
        }

        if (!response.data.data?.Model) {
          router.push(`/${response.data.data.username}`);
        }
        setProfileUser(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUserSubscription();
  }, [params.user_id, router]);

  useEffect(() => {
    socket?.on("subscription_added", () => {});

    return () => {
      socket?.off("subscription_added");
    };
  }, [socket]);

  const subscribeToUser = (id: number) => {
    if (user && profileUser) {
      toast.loading("Please wait...");
      const subscribeUser = async () => {
        return await SubscribeToUser(profileUser.user_id, id);
      };
      subscribeUser().then((res) => {
        if (res.status === true) {
          toast.dismiss();
          swal(
            "Success",
            `You have successfully subscribed to ${profileUser.name}`,
            "success",
          );
          socket?.emit("subscription_added", { user_id: profileUser.user_id });
          router.push(`/${profileUser.username}`);
        } else {
          toast.dismiss();
          swal("Error", res.message, "error");
          // router.push(`/${profileUser.username}`)
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 mb-20 lg:mb-4">
      <div className="flex-1 w-full py-8 text-center rounded-lg">
        <div className="border-[3px] border-black/30 mb-5 inline-block p-2 rounded-full border-dotted">
          <Image
            src={`${profileUser?.profile_image || "/site/avatar.png"}`}
            alt=""
            width={100}
            priority
            height={100}
            className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square "
          />
        </div>
        <h1 className="mb-8 text-xl font-bold">
          Subscribe To <br />
          <span className="text-2xl font-bold text-primary-dark-pink">
            {" "}
            {profileUser?.name}
          </span>
        </h1>
        <p className="mb-8 leading-loose text-gray-500 dark:text-white">
          Subscribe to {profileUser?.name} to get access to{" "}
          {profileUser?.Model?.gender == "female" ? "her" : "his"} exclusive
          content and special updates.
        </p>
        {!profileUser?.ModelSubscriptionPack?.ModelSubscriptionTier?.length && (
          <div className="max-w-md p-10 mx-auto text-center border-2 border-gray-300 border-dashed select-none rounded-2xl dark:bg-gray-900  bg-gray-50/50 hover:border-gray-400 transition-colors duration-300">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
              No Subscription Plans
            </h3>
            <p className="leading-relaxed text-gray-600 dark:text-white">
              This creator hasn&apos;t set up any subscription plans yet. Check
              back later for updates.
            </p>
          </div>
        )}
        {profileUser &&
          profileUser.ModelSubscriptionPack &&
          Array.isArray(
            profileUser.ModelSubscriptionPack.ModelSubscriptionTier,
          ) &&
          profileUser.ModelSubscriptionPack.ModelSubscriptionTier.length >
            0 && (
            <div className={`grid xl:grid-cols-2 2xl:grid-cols-2 gap-4 mt-12`}>
              {profileUser.ModelSubscriptionPack.ModelSubscriptionTier.map(
                (tier, index) => (
                  <div
                    key={tier.id}
                    className={`group relative p-6 border border-gray-200 rounded-3xl shadow-sm hover:shadow-2xl hover:border-black/40 transition-all duration-300 flex flex-col justify-between bg-gradient-to-br from-white via-gray-50 to-pink-50 overflow-hidden ${
                      profileUser.ModelSubscriptionPack.ModelSubscriptionTier
                        .length === 1
                        ? "col-span-3"
                        : "col-span-1"
                    }`}
                  >
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute rounded-full -right-10 -top-10 w-36 h-36 bg-primary-dark-pink/10 blur-2xl" />
                      <div className="absolute rounded-full -left-10 -bottom-10 w-28 h-28 bg-primary-dark-pink/10 blur-xl" />
                    </div>

                    <div className="relative flex flex-col items-center">
                      {/* Price section */}
                      <div className="flex items-center justify-center mb-4 gap-3">
                        <Image
                          width={36}
                          height={36}
                          src="/site/coin.svg"
                          className="w-9 h-9 aspect-square group-hover:scale-110 transition-transform duration-300"
                          alt="Price icon"
                        />
                        <span className="text-3xl font-extrabold text-primary-dark-pink drop-shadow-sm">
                          {numeral(tier.tier_price).format("0,0")}
                        </span>
                      </div>

                      {/* Tier name */}
                      <h3 className="mb-2 text-2xl font-extrabold tracking-tight text-center text-gray-900 lg:text-3xl">
                        {tier.tier_name}
                      </h3>

                      {/* Duration badge */}
                      <div className="px-5 py-2 mx-auto mb-5 rounded-full bg-primary-dark-pink/10 w-fit shadow-sm">
                        <p className="text-sm font-semibold text-primary-dark-pink">
                          {getFormattedStringFromDays(tier.tier_duration)}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 leading-relaxed text-center mb-8 min-h-[60px]">
                        {tier.tier_description}
                      </p>
                    </div>

                    {/* Subscribe button */}
                    <button
                      onClick={() => subscribeToUser(tier.id)}
                      className="relative block w-full px-6 py-4 font-bold text-white cursor-pointer bg-gradient-to-r from-primary-dark-pink via-pink-500 to-primary-dark-pink rounded-xl shadow-lg
  hover:from-pink-600 hover:to-primary-dark-pink/90 hover:scale-105 active:scale-100 transition-all duration-200
 focus:outline-none focus:ring-2 focus:ring-primary-dark-pink/40 text-nowrap"
                    >
                      Subscribe Now
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default Subscribe;
