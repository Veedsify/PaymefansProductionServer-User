"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { useApi } from "@/lib/api/client";

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
    const { wallet } = useApi();
    useEffect(() => {
      const fetchTransactions = async () => {
        try {
          const res = await wallet.getOtherTransactions();
          if (res.status === 200) {
            setTransactions(res.data.data?.slice(0, 5) as Transaction[]);
          } else {
            console.error("Other transactions fetch error:", res.data.message);
          }
        } catch (error) {
          console.error("Other transactions fetch error:", error);
        }
      };
      fetchTransactions();
    }, []);

    if (!transactions || transactions.length === 0) return null;

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
