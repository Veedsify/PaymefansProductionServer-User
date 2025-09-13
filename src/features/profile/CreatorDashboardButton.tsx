"use client";

import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import axiosInstance from "@/utils/Axios";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      className="w-full cursor-pointer p-4 text-gray-700 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border-black/10"
    >
      <h2 className="mb-2 text-lg font-semibold">Creator Dashboard</h2>
      <Link href={"/analytics"} className="text-sm text-black dark:text-white">
        <p className="mb-2">
          Your profile reached {data?.profileViews} people in the last 30 days,
        </p>
      </Link>
    </div>
  );
};

export default CreatorDashboardButton;
