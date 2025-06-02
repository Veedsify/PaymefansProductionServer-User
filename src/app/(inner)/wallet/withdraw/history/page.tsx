"use client";
import { getToken } from "@/utils/Cookie";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { LucideLoader2 } from "lucide-react";

const fetchWithdrawalHostory = async ({ cursor }: { cursor: number }) => {
  try {
    const token = getToken();
    const queryParams = new URLSearchParams();
    if (cursor) {
      queryParams.set("cursor", String(cursor));
    }
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL
      }/wallet/history?${queryParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const WithdrawalHistory = () => {
  const {
    data,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["withdrawal-history"],
    queryFn: ({ pageParam }) => fetchWithdrawalHostory({ cursor: pageParam }), // pass cursor
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    initialPageParam: 0,
  });

  const withdrawalHistory = data?.pages.flatMap((page) => page.data) || [];

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-500 text-sm">
          Sorry an Error Occured, while fetching your withdrawal history
        </p>
      </div>
    );
  }
  if (isFetchingNextPage || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LucideLoader2 className="animate-spin text-primary-dark-pink" />
      </div>
    );
  }

  const handleFetchNextPage = () => {
    fetchNextPage();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="space-y-4 p-4">
        <h1 className="text-2xl font-bold text-gray-800 block lg:hidden">
          Withdrawal History
        </h1>

        {withdrawalHistory.map((withdrawal) => (
          <div className="space-y-3" key={withdrawal.id}>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {withdrawal.amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "NGN",
                      })}
                    </h3>

                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Bank Withdrawal: {" "}
                      <span className="font-semibold">
                        {withdrawal.bank.bank_name || "N/A"}
                      </span>
                    </p>
                    <p>
                      Date:{" "}
                      {new Date(withdrawal.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p>Reference: {withdrawal.reference}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${getStatusClass(withdrawal.status)}`}
                  >
                    {withdrawal.status.charAt(0).toUpperCase() +
                      withdrawal.status.slice(1)}
                  </span>
                  <button className="ml-4 p-2 text-gray-500 hover:text-gray-700 rounded-xl text-xs bg-gray-100 dark:bg-gray-900 transition-colors cursor-pointer">
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {hasNextPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleFetchNextPage}
              disabled={isFetchingNextPage}
              className="px-4 py-2 bg-primary-dark-pink text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {data && data.pages.length > 0 && data?.pages[0].data?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No withdrawal history found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default WithdrawalHistory;
