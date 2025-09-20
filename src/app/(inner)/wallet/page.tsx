"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ROUTE from "@/config/routes";
import { useConfigContext } from "@/contexts/ConfigContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import OtherTransactions from "@/features/transactions/OtherTransactions";
import type { ExchangeRate } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import FormatName from "@/lib/FormatName";

const WalletPage = () => {
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { config } = useConfigContext();
  const { data: points } = useQuery({
    queryKey: ["points"],
    queryFn: async () => {
      const response = await axiosInstance.post(
        `/auth/points`,
        {},
        {
          withCredentials: true,
        },
      );
      return response.data.points;
    },
    enabled: true,
    staleTime: 1000 * 10,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsResponse = await axiosInstance.get(
          `/wallet/transactions`,
          {
            withCredentials: true,
          },
        );
        setTransactions(transactionsResponse.data.data.slice(0, 5));

        // Fetch exchange rates
        const ratesResponse = await axios.get(ROUTE.GET_PLATFROM_EXCHANGE_RATE);
        setRates(ratesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const convertCurrency = useCallback(
    (amount: number, fromCurrency: string, toCurrency: string): number => {
      if (!rates) return 0;

      if (fromCurrency == "POINTS" && toCurrency == "NGN") {
        if (points && config) {
          const amount = (points * config?.point_conversion_rate_ngn) as number;
          return amount;
        }
        return 0;
      }

      if (fromCurrency === "POINTS") {
        const usdAmount =
          amount /
          rates.data.find((rate: ExchangeRate) => rate.name === "POINTS")
            ?.buyValue;

        const targetRate =
          rates.data.find((rate: ExchangeRate) => rate.name === toCurrency)
            ?.buyValue || 1;

        return usdAmount * targetRate;
      }

      if (fromCurrency === "USD") {
        const toRate =
          rates.data.find((rate: ExchangeRate) => rate.name === toCurrency)
            ?.buyValue || 1;
        return amount * toRate;
      } else if (toCurrency === "USD") {
        const fromRate =
          rates.data.find((rate: ExchangeRate) => rate.name === fromCurrency)
            ?.buyValue || 1;
        return amount / fromRate;
      } else {
        const fromRate =
          rates.data.find((rate: ExchangeRate) => rate.name === fromCurrency)
            ?.buyValue || 1;
        const toRate =
          rates.data.find((rate: ExchangeRate) => rate.name === toCurrency)
            ?.buyValue || 1;

        const usdAmount = amount / fromRate;
        return usdAmount * toRate;
      }
    },
    [rates, points, config],
  );

  const calculateAmount = useMemo(() => {
    if (!points || !rates || !user) return "0";
    const convert = convertCurrency(points, "POINTS", "NGN");
    return convert.toLocaleString("en-US", {
      style: "currency",
      currency:
        rates.data.find((rate: ExchangeRate) => rate.name === user.currency)
          ?.name || "USD",
    });
  }, [points, rates, user, convertCurrency]);

  const calculateAmountInDollars = useMemo(() => {
    if (!points) return "$0.00";
    const usd = convertCurrency(points, "POINTS", "USD");
    return usd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }, [points, convertCurrency]);
  // ...existing code...

  if (loading) {
    <div className="w-full h-1 my-8 overflow-hidden bg-gray-200 rounded">
      <div className="h-full loader-bar bg-primary-dark-pink animate-loader-bar"></div>
    </div>;
  }

  return (
    <div className="p-4 py-8 pb-24">
      <div className="flex flex-wrap items-center justify-between pb-8 mb-6 border-b border-gray-200 gap-6 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {user && (
            <>
              <Image
                src={user?.profile_image!}
                width={56}
                height={56}
                alt="Profile"
                priority
                className="object-cover border-2 rounded-full shadow w-14 h-14 border-primary-dark-pink"
              />
              <div className="self-center dark:text-gray-200">
                <h2 className="text-lg font-bold">{FormatName(user?.name)}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.username}
                </p>
              </div>
            </>
          )}
        </div>
        <Link
          href="/points"
          className="p-3 px-8 text-xs font-semibold text-white rounded shadow bg-primary-dark-pink hover:bg-pink-700 transition"
        >
          Add Funds
        </Link>
      </div>
      <div className="flex items-center justify-between p-6 mb-6 text-white shadow-lg bg-gradient-to-r from-primary-dark-pink to-pink-400 rounded-2xl">
        <div className="grid gap-2">
          <small className="text-base font-medium opacity-90">
            Your Balance
          </small>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">
            {calculateAmount}
          </h1>
        </div>
        <div className="flex self-center mt-4 md:mt-0">
          <div className="flex items-center p-3 px-5 rounded-lg shadow-inner bg-white/10 md:px-6 md:py-4 gap-2">
            <span className="text-lg font-semibold">
              {points ? points.toLocaleString() : 0}
            </span>
            <Image
              width={24}
              height={24}
              className="w-6 h-6"
              src="/site/coin.svg"
              alt="Points"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-6 mb-6 text-white shadow-lg bg-gradient-to-r from-primary-dark-pink to-pink-400 rounded-2xl">
        <div className="grid gap-2">
          <small className="text-base font-medium opacity-90">
            Your Balance
          </small>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">
            {calculateAmountInDollars}
          </h1>
        </div>
        <div className="flex self-center mt-4 md:mt-0">
          <div className="flex items-center p-3 px-5 rounded-lg shadow-inner bg-white/10 md:px-6 md:py-4 gap-2">
            <span className="text-lg font-semibold">
              {points ? points.toLocaleString() : 0}
            </span>
            <Image
              width={24}
              height={24}
              className="w-6 h-6"
              src="/site/coin.svg"
              alt="Points"
            />
          </div>
        </div>
      </div>
      {user?.is_model && user?.Model?.verification_status && (
        <>
          <div className="p-6 mb-4 text-white bg-black shadow dark:bg-gray-700 rounded-2xl">
            <small className="text-base font-medium">Your Balance</small>
            <h1 className="mb-4 text-2xl font-bold md:text-4xl">
              {calculateAmount}
            </h1>
            <Link
              href="/wallet/withdraw"
              className="block w-full px-8 py-3 text-sm font-semibold text-center rounded-lg bg-coins-card-bottom text-primary-dark-pink dark:text-white dark:bg-primary-dark-pink hover:bg-pink-100 transition dark:hover:bg-pink-700"
            >
              WITHDRAW
            </Link>
          </div>
          <div>
            <Link
              href="/wallet/add"
              className="block w-full px-8 py-3 my-5 text-sm font-semibold text-center rounded-lg bg-coins-card-bottom text-primary-dark-pink md:text-base hover:bg-pink-100 transition dark:text-white dark:bg-primary-dark-pink dark:hover:bg-pink-700"
            >
              SET WITHDRAWAL BANK ACCOUNT
            </Link>
          </div>
        </>
      )}
      {transactions && transactions.length > 0 && (
        <div>
          <h2 className="mt-10 mb-10 text-xl font-semibold dark:text-white">
            Purchase History
          </h2>
          <div className="grid gap-4">
            {transactions.map((transaction: any, i: number) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between p-2 ">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        transaction.success ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {transaction.success
                        ? "Transaction Successful"
                        : "Transaction Failed"}
                    </p>
                    <div className="flex items-center gap-3">
                      <small className="text-xs dark:text-gray-300">
                        {new Date(transaction.created_at).toLocaleDateString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "numeric",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </small>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-semibold flex items-center gap-3 ${
                      transaction.success ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    +{transaction.points}
                    <Image
                      width={20}
                      height={20}
                      className="w-5 h-5 aspect-square"
                      src="/site/coin.svg"
                      alt=""
                    />
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/transactions/topup"
            className="inline-block py-4 font-medium text-blue-500 capitalize"
          >
            VIEW ALL
          </Link>
          <OtherTransactions />
        </div>
      )}
    </div>
  );
};

export default WalletPage;
