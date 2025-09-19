"use client";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import { useAuthContext } from "@/contexts/UserUseContext";
import WithdrawalInput from "@/features/withdraw/WithdrawalInput";
import axiosInstance from "@/utils/Axios";
import { getTransactionsData } from "@/utils/data/Transactions";
import getUserData from "@/utils/data/UserData";
import { useQuery } from "@tanstack/react-query";
import { LucideArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  const { user } = useAuthContext();
  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await axiosInstance.post(`/auth/wallet`, {});
      return res.data as { wallet: number };
    },
  });

  const { data: pointsData } = useQuery({
    queryKey: ["points"],
    queryFn: async () => {
      const res = await axiosInstance.post(`/auth/points`, {});
      return res.data as { points: number };
    },
  });

  const points = pointsData?.points ?? 0;

  if (!user) {
    return <div className="p-4">No user data found</div>;
  }

  return (
    <div className="p-4 py-8">
      <div className="flex flex-wrap items-center justify-between pb-6 gap-5">
        <div className="flex align-middle gap-5">
          <Image
            src={user?.profile_image!}
            width={50}
            height={50}
            alt=""
            priority
            className="object-cover w-12 h-12 border-2 rounded-full sm:-top-12  -top-12"
          />
          <div className="self-center">
            <h2 className="font-bold">{user?.name}</h2>
            <p>{user?.username}</p>
          </div>
        </div>
        <div>
          <Link href="/wallet/withdraw/history">
            <button className="flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg cursor-pointer bg-primary-dark-pink hover:bg-primary-dark-pink/80 transition-all duration-200 ease-in-out gap-2">
              Withdraw History
              <LucideArrowRight />
            </button>
          </Link>
        </div>
      </div>
      <div className="flex justify-between p-5 mb-10 text-white align-middle bg-primary-dark-pink rounded-xl">
        <div className="grid gap-3">
          <small className="text-md">Your Balance</small>
          <h1 className="text-xl font-bold md:text-3xl">
            ₦ {(points * 100).toLocaleString()}
          </h1>
        </div>
        <div className="flex self-center">
          <div className="p-2 px-4 bg-coins-card-top md:px-5 md:py-3 rounded-md">
            <div className="flex opacity-100 gap-1">
              <span>{points ? points.toLocaleString() : 0}</span>
              <Image
                width={20}
                height={20}
                className="w-5 h-5 aspect-square"
                src="/site/coin.svg"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      <WithdrawalInput points={points} />
    </div>
  );
};

export default Page;
