"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getToken } from "@/utils/Cookie";

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
  const token = getToken();

  useEffect(() => {
    if (!token) return;

    const abortController = new AbortController();

    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/wallet/transactions/other`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          }
        );

        if (!res.ok) throw new Error("Failed to fetch transactions");

        const data = await res.json();
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
  }, [token]);

  if (transactions.length === 0) return null;

  return (
    <section aria-labelledby="other-transactions">
      <h2 className="text-xl font-semibold mt-10 mb-10 dark:text-white">
        Transactions
      </h2>

      <div className="grid gap-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-2"
          >
            <div className="flex justify-between items-center">
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
        className="text-blue-500 font-medium capitalize inline-block py-4 hover:text-blue-600 transition-colors"
      >
        VIEW ALL
      </Link>
    </section>
  );
});

OtherTransactions.displayName = "OtherTransactions";

export default OtherTransactions;
