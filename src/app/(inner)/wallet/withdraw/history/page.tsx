"use client";
import { getToken } from "@/utils/Cookie";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LucideLoader2,
  Building,
  Calendar,
  Hash,
  AlertCircle,
  Download,
  Eye,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import React, { useState } from "react";

const fetchWithdrawalHostory = async ({ cursor }: { cursor: number }) => {
  try {
    const token = getToken();
    const queryParams = new URLSearchParams();
    if (cursor) {
      queryParams.set("cursor", String(cursor));
    }
    const response = await axios.get(
      `${
        process.env.NEXT_PUBLIC_TS_EXPRESS_URL
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
    queryFn: ({ pageParam }) => fetchWithdrawalHostory({ cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    initialPageParam: 0,
  });

  const withdrawalHistory = data?.pages.flatMap((page) => page.data) || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md mx-4">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <AlertCircle size={20} />
            <h3 className="font-medium">Something went wrong</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            We couldn&apos;t fetch your withdrawal history. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <LucideLoader2 className="animate-spin" size={20} />
          <span className="text-sm font-medium">Loading your history...</span>
        </div>
      </div>
    );
  }

  const handleFetchNextPage = () => {
    fetchNextPage();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          icon: CheckCircle,
          label: "Completed",
        };
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          icon: Clock,
          label: "Pending",
        };
      case "rejected":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: XCircle,
          label: "Rejected",
        };
      case "processing":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          icon: RefreshCw,
          label: "Processing",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: Clock,
          label: "Unknown",
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="mb-8 lg:hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Withdrawal History
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          Track your withdrawal requests and their status.
        </p>
        {/* Summary Stats */}
        {withdrawalHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <span className="text-xs text-gray-500">Total Withdrawn</span>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    withdrawalHistory
                      .filter((w) => w.status === "completed")
                      .reduce((sum, w) => sum + w.amount * 0.75, 0)
                  )}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <span className="text-xs text-gray-500">Pending</span>
                <p className="text-lg font-bold text-gray-900">
                  {
                    withdrawalHistory.filter(
                      (w) => w.status === "pending" || w.status === "processing"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {withdrawalHistory.map((withdrawal) => {
          const statusConfig = getStatusConfig(withdrawal.status);
          const StatusIcon = statusConfig.icon;
          const expanded = expandedId === withdrawal.id;

          return (
            <div
              key={withdrawal.id}
              className="bg-white rounded-xl border border-gray-300 hover:shadow transition-all"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Building size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {formatCurrency(withdrawal.amount * 0.75)}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {formatDate(withdrawal.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`${statusConfig.bg} ${statusConfig.text} px-2 py-1 rounded flex items-center gap-1 text-xs`}
                  >
                    <StatusIcon size={14} />
                    {statusConfig.label}
                  </div>
                  <button
                    className="p-1 rounded hover:bg-gray-100"
                    onClick={() =>
                      setExpandedId(expanded ? null : withdrawal.id)
                    }
                    aria-label={expanded ? "Collapse" : "Expand"}
                  >
                    {expanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                </div>
              </div>
              {expanded && (
                <div className="px-5 pb-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <Building size={16} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Bank:</span>
                      <span className="font-medium text-gray-900">
                        {withdrawal.bank.bank_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard size={16} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Account:</span>
                      <span className="font-mono text-xs text-gray-900 px-2 py-1">
                        {withdrawal.bank.account_number || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hash size={16} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Reference:</span>
                      <span className="font-mono text-xs text-gray-900 px-2 py-1">
                        {withdrawal.reference}
                      </span>
                    </div>
                    {withdrawal.status === "pending" && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        <Clock size={14} />
                        Estimated processing time:{" "}
                        <span className="font-medium">24-48 hours</span>
                      </div>
                    )}
                    {withdrawal.status === "processing" && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <RefreshCw size={14} className="animate-spin" />
                        Processing
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end pt-3 gap-2">
                    {withdrawal.status !== "completed" && (
                      <button className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors">
                        Report Issue
                      </button>
                    )}
                    {withdrawal.status === "completed" && (
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        Download Receipt
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleFetchNextPage}
            disabled={isFetchingNextPage}
            className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <LucideLoader2 className="animate-spin" size={16} />
                Loading more...
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}

      {/* Empty state */}
      {data && data.pages.length > 0 && data?.pages[0].data?.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CreditCard size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No withdrawal history yet
          </h3>
          <p className="text-gray-600 text-base max-w-md mx-auto mb-6">
            Your withdrawal requests will appear here.
          </p>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Make Your First Withdrawal
          </button>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;
