"use client";
import { POINTS_CONFIG } from "@/config/config";
import ROUTE from "@/config/routes";
import { useUserAuthContext } from "@/lib/userUseContext";
import { ExchangeRate } from "@/types/components";
import { currencyRates as defaultRates } from "./add-points";
import { LucideLoader } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useWithdrawStore } from "@/contexts/withdraw-context";
import { useRouter } from "next/navigation";
import { useConfigContext } from "@/contexts/configs-context";

// You can adjust or import this from a common place
const FEE_PERCENTAGE = 0.25; // 20% fee

const WithDrawInput = ({ points }: { points: number }) => {
  const { user } = useUserAuthContext();
  const [value, setValue] = useState("");
  const [rates, setRates] = useState<ExchangeRate[]>(defaultRates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { setWithDrawStore } = useWithdrawStore();
  const { config } = useConfigContext();
  const router = useRouter();

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const response = await fetch(ROUTE.GET_PLATFROM_EXCHANGE_RATE);
        if (!response.ok) throw new Error("Failed to fetch exchange rates");
        const data = await response.json();
        if (data.data.length) setRates(data.data);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const handleWithdrawClick = () => {
    const num = value.replace(/\D/g, "");
    const amount = parseInt(num);
    const userCurrency = user?.currency || "NGN";
    const ngnValue = convertCurrency(amount, userCurrency, "NGN");
    const maxWithdrawalAmount = convertCurrency(points, "POINTS", "NGN");
    const usdValue = convertCurrency(amount, userCurrency, "USD");
    const minAmountInNgn = config?.min_withdrawal_amount_ngn || 0;
    const defalutCurrency = config?.default_symbol || "NGN";
    const withdrawCurrency = config?.default_currency || "NGN";

    if (amount > maxWithdrawalAmount) {
      const maxAmount = Number(maxWithdrawalAmount).toLocaleString();
      toast.error(
        `You can only withdraw a maximum of ${defalutCurrency}${maxAmount}`,
        { id: "withdraw" }
      );
      return;
    }

    if (amount < minAmountInNgn) {
      const minAmount = Number(minAmountInNgn).toLocaleString();
      toast.error(
        `Minimum withdrawal amount is ${defalutCurrency}${minAmount}`,
        { id: "withdraw" }
      );
      return;
    }
    setWithDrawStore({
      platformFee: calculateFeeAmount(value),
      amountToSettle: balanceToSettleAmount(value),
      amountInUsd: usdValue,
      amountInNgn: ngnValue,
      localCurrency: withdrawCurrency,
      userBank: null,
    });

    router.push("/wallet/withdraw/select-bank");
  };

  // Format the input value with commas
  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, "");
    setValue(formatNumber(inputValue));
  };

  // Convert local currency amount to target currency
  function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    if (fromCurrency === toCurrency) return amount;

    if (fromCurrency == "POINTS" && toCurrency == "NGN") {
      if (points && config) {
        const amount = (points * config?.point_conversion_rate_ngn) as number;
        return amount;
      }
      return 0;
    }

    if (fromCurrency === "USD") {
      const toRate =
        rates.find((rate) => rate.name === toCurrency)?.sellValue || 1;
      return amount * toRate;
    } else if (toCurrency === "USD") {
      const fromRate =
        rates.find((rate) => rate.name === fromCurrency)?.sellValue || 1;
      return amount / fromRate;
    } else {
      const fromRate =
        rates.find((rate) => rate.name === fromCurrency)?.sellValue || 1;
      const toRate =
        rates.find((rate) => rate.name === toCurrency)?.sellValue || 1;
      const usdAmount = amount / fromRate;
      return usdAmount * toRate;
    }
  }

  // Format converted amount for display
  function formatConvertedAmount(amount: number, currency: string): string {
    const symbol = rates.find((rate) => rate.name === currency)?.symbol || "";
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Calculate platform fee (20% of input)
  function calculateFee(value: string) {
    let num = value.replace(/\D/g, "");
    return (parseInt(num) * FEE_PERCENTAGE).toLocaleString();
  }

  // Calculate amount to withdraw after fee
  function balanceToSettle(value: string) {
    let num = value.replace(/\D/g, "");
    return (parseInt(num) * (1 - FEE_PERCENTAGE)).toLocaleString();
  }

  // Calculate platform fee as number
  function calculateFeeAmount(value: string) {
    let num = value.replace(/\D/g, "");
    return Math.floor(parseInt(num) * FEE_PERCENTAGE);
  }

  // Calculate amount to withdraw after fee as number
  function balanceToSettleAmount(value: string) {
    let num = value.replace(/\D/g, "");
    return Math.floor(parseInt(num) * (1 - FEE_PERCENTAGE));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full p-6">
        <LucideLoader className="w-10 h-10 animate-spin text-primary-dark-pink" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-lg font-semibold text-red-500">
          Error fetching exchange rate
        </p>
      </div>
    );
  }

  const inputAmount = parseInt(value.replace(/\D/g, "")) || 0;
  const userCurrency = user?.currency || "NGN";
  const usdValue = convertCurrency(inputAmount, userCurrency, "USD");
  const ngnValue = convertCurrency(inputAmount, userCurrency, "NGN");
  const currencySymbol =
    rates.find((rate) => rate.name === userCurrency)?.symbol || "₦";

  return (
    <div>
      <div className="flex gap-2 items-start mb-3">
        <div className="text-4xl">{currencySymbol}</div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            pattern="[0-9]*"
            placeholder="0"
            className="w-full text-6xl md:text-9xl p-0 font-bold border-none outline-none"
          />
        </div>
      </div>
      {value && (
        <div className="mb-6">
          <div className="flex justify-between border-b py-4 mb-3">
            <p className="text-xl font-semibold">Amount requested</p>
            <p className="text-xl font-medium">
              {currencySymbol} {value}
            </p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-xl">Platform Fee</p>
            <p className="text-xl font-medium">
              {currencySymbol} {calculateFee(value)}{" "}
              <span className="text-primary-dark-pink">
                ({FEE_PERCENTAGE * 100}%)
              </span>
            </p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-xl">Amount in USD</p>
            <p className="text-xl font-medium">
              {formatConvertedAmount(usdValue, "USD")}
            </p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-xl">Amount in NGN</p>
            <p className="text-xl font-medium">
              {formatConvertedAmount(ngnValue, "NGN")}
            </p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-xl">Amount to withdraw</p>
            <p className="text-xl font-medium">
              {currencySymbol} {balanceToSettle(value)}
            </p>
          </div>
        </div>
      )}
      {value && (
        <div className="mt-5">
          <button
            onClick={handleWithdrawClick}
            className="bg-black font-bold uppercase text-white w-full py-4 rounded-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Withdraw
          </button>
        </div>
      )}
    </div>
  );
};

export default WithDrawInput;
