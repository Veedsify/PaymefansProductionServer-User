"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import axiosInstance from "@/utils/Axios";

const CreatorDashboardButton = () => {
  const router = useRouter();
  const { data, isError, isLoading } = useQuery({
    queryKey: ["creatorDashboardData"],
    queryFn: async () => {
      const response = await axiosInstance("/profile/creator-dashboard-data");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner text="Loading Stats.." />;
      </div>
    );
  }

  if (isError) {
    return null;
  }

  const handleClickFunc = () => {
    router.push("/analytics");
  };

  return (
    <div
      onClick={handleClickFunc}
      className="w-full cursor-pointer p-4 py-2 text-gray-700 rounded-lg border dark:border-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300"
    >
      <h2 className="md:text-lg font-semibold">Creator Dashboard</h2>
      <Link href={"/analytics"} className="text-sm text-black dark:text-white">
        <span className="">
          Your profile reached {data?.profileViews} people in the last 30 days,
        </span>
      </Link>
    </div>
  );
};

export default CreatorDashboardButton;
