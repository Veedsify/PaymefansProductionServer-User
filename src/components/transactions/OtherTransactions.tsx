"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getToken } from "@/utils/Cookie";
import axiosInstance from "@/utils/Axios";

const formatDate = (isoDateString: string) => {
  const date = new Date(isoDateString);
  return date.toLocaleDateString("en-US", {
    hour: "numeric",
    minute: "numeric",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type Transaction = {
  id: string;
  transaction_type: "credit" | "debit";
  transaction_message: string;
  created_at: string;
  amount: number;
};

const OtherTransactions = React.memo(() => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchTransactions = async () => {
      try {
        const axios = (await import("axios")).default;

        const res = await axiosInstance.get(`/wallet/transactions/other`, {
          signal: abortController.signal,
        });

        const data = res.data;
        const transactions = Array.isArray(data?.data) ? data.data : [];
        setTransactions(transactions.slice(0, 5));
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Transactions fetch error:", error.message);
        }
      }
    };

    fetchTransactions();

    return () => abortController.abort();
  }, []);

  if (transactions.length === 0) return null;

  return (
    <section aria-labelledby="other-transactions">
      <h2 className="mt-10 mb-10 text-xl font-semibold dark:text-white">
        Transactions
      </h2>

      <div className="grid gap-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-2 bg-white dark:bg-slate-800 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-semibold ${
                    transaction.transaction_type === "credit"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {transaction.transaction_message}
                </p>
                <small className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(transaction.created_at)}
                </small>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    transaction.transaction_type === "credit"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {transaction.transaction_type === "credit" ? "+" : "-"}
                  {transaction.amount.toLocaleString()}
                </span>
                <Image
                  width={20}
                  height={20}
                  className="w-5 h-5"
                  src="/site/coin.svg"
                  alt="Coins"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/transactions/others"
        className="inline-block py-4 font-medium text-blue-500 capitalize hover:text-blue-600 transition-colors"
      >
        VIEW ALL
      </Link>
    </section>
  );
});

OtherTransactions.displayName = "OtherTransactions";

export default OtherTransactions;
