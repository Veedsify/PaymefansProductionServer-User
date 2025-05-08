import OtherTransactions from "@/components/transactions/other-transactions";
import ROUTE from "@/config/routes";
import { ExchangeRate } from "@/types/components";
import { AuthUserProps } from "@/types/user";
import axiosInstance from "@/utils/axios";
import { getTransactionsData } from "@/utils/data/transactions";
import getUserData from "@/utils/data/user-data";
import axios from "axios";
import { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Profile page",
};

const WalletPage = async () => {
  const token = (await cookies()).get("token")?.value;
  const user = (await getUserData()) as AuthUserProps;
  const { data } = await getTransactionsData(token as string);
  const rates = await axios(ROUTE.GET_PLATFROM_EXCHANGE_RATE);
  function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    if (fromCurrency === "POINTS") {
      // Convert points to USD first (16 points = $1)
      const usdAmount =
        amount /
        rates.data.data.find((rate: ExchangeRate) => rate.name === "POINTS")
          ?.buyValue;

      // Then convert USD to target currency
      const targetRate =
        rates.data.data.find((rate: ExchangeRate) => rate.name === toCurrency)
          ?.buyValue || 1;

      return usdAmount * targetRate;
    }

    // For other currency conversions
    if (fromCurrency === "USD") {
      // Direct conversion from USD
      const toRate =
        rates.data.data.find((rate: ExchangeRate) => rate.name === toCurrency)
          ?.buyValue || 1;
      return amount * toRate;
    } else if (toCurrency === "USD") {
      // Convert to USD
      const fromRate =
        rates.data.data.find((rate: ExchangeRate) => rate.name === fromCurrency)
          ?.buyValue || 1;
      return amount / fromRate;
    } else {
      // Convert through USD as intermediate
      const fromRate =
        rates.data.data.find((rate: ExchangeRate) => rate.name === fromCurrency)
          ?.buyValue || 1;
      const toRate =
        rates.data.data.find((rate: ExchangeRate) => rate.name === toCurrency)
          ?.buyValue || 1;

      // First convert to USD then to target currency
      const usdAmount = amount / fromRate;
      return usdAmount * toRate;
    }
  }

  const { wallet } = await axiosInstance
    .post(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/wallet`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res) => res.data as { wallet: number });
  const { points } = await axiosInstance
    .post(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/points`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res) => res.data as { points: number });

  const transactions = data.slice(0, 5);

  function calculateAmount() {
    const convert = convertCurrency(points, "POINTS", user?.currency || "USD");
    return convert.toLocaleString("en-US", {
      style: "currency",
      currency:
        rates.data.data.find(
          (rate: ExchangeRate) => rate.name === user?.currency
        ).name || "USD",
    });
  }

  function calculateAmountInDollars() {
    const usd = convertCurrency(points, "POINTS", "USD");
    return usd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  return (
    <div className="p-4 py-8">
      <div className="flex flex-wrap gap-6 items-center justify-between pb-8 border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center gap-4">
          <Image
            src={user.profile_image}
            width={56}
            height={56}
            alt="Profile"
            priority
            className="object-cover w-14 h-14 border-2 border-primary-dark-pink rounded-full shadow"
          />
          <div className="self-center dark:text-gray-200">
            <h2 className="font-bold text-lg">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.username}
            </p>
          </div>
        </div>
        <Link
          href="/points"
          className="p-3 px-8 text-xs font-semibold text-white bg-primary-dark-pink hover:bg-pink-700 transition rounded shadow"
        >
          Add Funds
        </Link>
      </div>
      <div className="mb-6 flex flex-col md:flex-row align-middle justify-between bg-gradient-to-r from-primary-dark-pink to-pink-400 text-white p-6 rounded-2xl shadow-lg">
        <div className="grid gap-2">
          <small className="text-base font-medium opacity-90">
            Your Balance
          </small>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {calculateAmount()}
          </h1>
        </div>
        <div className="flex self-center mt-4 md:mt-0">
          <div className="bg-white/10 md:px-6 md:py-4 p-3 px-5 rounded-lg flex items-center gap-2 shadow-inner">
            <span className="font-semibold text-lg">
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
      <div className="mb-6 flex flex-col md:flex-row align-middle justify-between bg-gradient-to-r from-primary-dark-pink to-pink-400 text-white p-6 rounded-2xl shadow-lg">
        <div className="grid gap-2">
          <small className="text-base font-medium opacity-90">
            Your Balance
          </small>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {calculateAmountInDollars()}
          </h1>
        </div>
        <div className="flex self-center mt-4 md:mt-0">
          <div className="bg-white/10 md:px-6 md:py-4 p-3 px-5 rounded-lg flex items-center gap-2 shadow-inner">
            <span className="font-semibold text-lg">
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
          <div className="bg-black text-white p-6 rounded-2xl shadow mb-4">
            <small className="text-base font-medium opacity-80">
              Your Balance
            </small>
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              {calculateAmount()}
            </h1>
            <Link
              href="/wallet/withdraw"
              className="block text-sm text-center bg-coins-card-bottom px-8 py-3 rounded-lg w-full text-primary-dark-pink font-semibold hover:bg-pink-100 transition"
            >
              WITHDRAW
            </Link>
          </div>
          <div>
            <Link
              href="/wallet/add"
              className="block text-center bg-coins-card-bottom px-8 py-3 rounded-lg w-full text-primary-dark-pink font-semibold my-5 text-sm md:text-base hover:bg-pink-100 transition"
            >
              SET WITHDRAWAL BANK ACCOUNT
            </Link>
          </div>
        </>
      )}
      {transactions && transactions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-10 mb-10 dark:text-white">
            Transactions
          </h2>
          <div className="grid gap-4">
            {transactions.map((transaction: any, i: number) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl">
                <div className="flex justify-between items-center p-2 ">
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
                          }
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
                      className="w-auto h-5 aspect-square"
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
            className="text-blue-500 font-medium capitalize inline-block py-4"
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
