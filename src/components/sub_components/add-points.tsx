"use client";

import { POINTS_CONFIG } from "@/config/config";
import ROUTE from "@/config/routes";
import { useUserAuthContext } from "@/lib/userUseContext";
import { ExchangeRate } from "@/types/components";
import { getToken } from "@/utils/cookie.get";
import { LucideLoader } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const currencyRates = [
  { rate: 1, name: "USD", sellValue: 1, buyValue: 1, symbol: "$" },
  { rate: 1, name: "NGN", sellValue: 1509, buyValue: 1632, symbol: "₦" },
  { rate: 1, name: "POINTS", sellValue: 16, buyValue: 16, symbol: "P" },
  { rate: 1, name: "KES", sellValue: 120, buyValue: 129.19, symbol: "Ksh" },
  { rate: 1, name: "ZAR", sellValue: 18, buyValue: 18.55, symbol: "R" },
  { rate: 1, name: "GHS", sellValue: 14, buyValue: 14.3, symbol: "₵" },
];

const AddPoints = () => {
  const { user } = useUserAuthContext();
  const [value, setValue] = useState("");
  const [rates, setRates] = useState<ExchangeRate[]>(currencyRates);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [POINTS_PER_USD, setPointsPerUSD] = useState(16); // Default value

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const response = await fetch(ROUTE.GET_PLATFROM_EXCHANGE_RATE);
        if (!response.ok) {
          throw new Error("Failed to fetch exchange rates");
        }
        const data = await response.json();
        if (data.data.length) {
          setRates(data.data);
          setPointsPerUSD(
            data.data.find((rate: ExchangeRate) => rate.name === "POINTS")
              ?.value || 16
          );
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    // Uncomment the line below to fetch rates from the API
    fetchRates();
  }, []);

  // Format the input value with commas
  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, "");
    setValue(formatNumber(inputValue));
  };

  // Calculate platform fee (10% of input)
  function calculateFee(value: string) {
    let num = value.replace(/\D/g, "");
    return (parseInt(num) * 0.1).toLocaleString();
  }

  // Calculate points received
  function balanceToSettle(value: string) {
    let num = value.replace(/\D/g, "");
    const amount = parseInt(num) || 0;

    // Convert the input amount from user's currency to USD
    const userCurrency = user?.currency || "USD";
    const amountInUSD = convertCurrency(amount, userCurrency, "USD");

    // Apply 10% fee and convert to points (1 USD = 16 points)
    const pointsAfterFee = Math.floor(amountInUSD * 0.9 * POINTS_PER_USD);

    return pointsAfterFee.toLocaleString();
  }

  // Get original amount without formatting
  function pricePerPoints(value: string) {
    let num = value.replace(/\D/g, "");
    return parseInt(num).toLocaleString();
  }

  // Convert local currency amount to target currency
  function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    if (fromCurrency === "POINTS") {
      // Convert points to USD first (16 points = $1)
      const usdAmount =
        amount /
        (rates.find((rate: ExchangeRate) => rate.name === "POINTS")?.buyValue ||
          16);

      // Then convert USD to target currency
      const targetRate =
        rates.find((rate: ExchangeRate) => rate.name === toCurrency)
          ?.buyValue || 1;

      return usdAmount * targetRate;
    }

    // For other currency conversions
    if (fromCurrency === "USD") {
      // Direct conversion from USD
      const toRate =
        rates.find((rate: ExchangeRate) => rate.name === toCurrency)
          ?.buyValue || 1;
      return amount * toRate;
    } else if (toCurrency === "USD") {
      // Convert to USD
      const fromRate =
        rates.find((rate: ExchangeRate) => rate.name === fromCurrency)
          ?.buyValue || 1;
      return amount / fromRate;
    } else {
      // Convert through USD as intermediate
      const fromRate =
        rates.find((rate: ExchangeRate) => rate.name === fromCurrency)
          ?.buyValue || 1;
      const toRate =
        rates.find((rate: ExchangeRate) => rate.name === toCurrency)
          ?.buyValue || 1;

      // First convert to USD then to target currency
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

  async function handlePointBuy() {
    const token = getToken();
    toast.dismiss();
    toast.loading(POINTS_CONFIG.POINT_PENDING_PAYMENTS);

    const amount = parseInt(value.replace(/\D/g, "")) || 0;
    // Calculate minimum deposit in user's currency based on NGN 2500 rate
    const minNgn = 2500;
    const userCurrency = user?.currency || "USD";
    const minInUserCurrency = convertCurrency(minNgn, "NGN", userCurrency);

    const validate = amount < minInUserCurrency;
    if (!value || validate) {
      toast.dismiss();
      toast.error(
        `Minimum deposit is ${formatConvertedAmount(
          minInUserCurrency,
          userCurrency
        )}`
      );
      return;
    }

    // Calculate USD equivalent
    const usdAmount = convertCurrency(amount, user?.currency || "USD", "USD");

    try {
      const response = await fetch(ROUTE.PURCHASE_POINTS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: user?.currency || "USD",
          usd_amount: usdAmount,
          ngn_amount: convertCurrency(amount, user?.currency || "USD", "NGN"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to purchase points");
      }

      const data = await response.json();

      if (data.status) {
        toast.dismiss();
        toast.loading(data.message);
        setTimeout(() => {
          window.location.href = data.checkout.authorization_url;
        }, 100);
      } else {
        toast.dismiss();
        toast.error(data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(POINTS_CONFIG.POINTS_PURCHASE_FAILED);
      console.error(error);
    }
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
  const usdValue = convertCurrency(inputAmount, user?.currency || "USD", "USD");
  const ngnValue = convertCurrency(inputAmount, user?.currency || "USD", "NGN");

  return (
    <div>
      <div className="flex items-start gap-2 mb-3">
        <div className="text-4xl">
          {rates.find((rate) => rate.name === user?.currency)?.symbol}
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            pattern="[0-9]*"
            placeholder="0"
            className="w-full p-0 text-6xl font-bold border-none outline-none md:text-9xl"
          />
        </div>
      </div>
      {value && (
        <div className="mb-6">
          <div className="flex justify-between py-2">
            <p className="text-xl">Platform Fee</p>
            <p className="text-xl font-medium">
              10% ({rates.find((rate) => rate.name === user?.currency)?.symbol}
              {calculateFee(value)})
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
            <p className="text-xl">Amount</p>
            <p className="text-xl font-medium">
              {rates.find((rate) => rate.name === user?.currency)?.symbol}
              {pricePerPoints(value)}
            </p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-xl">Points Received</p>
            <p className="text-xl font-medium">
              <span className="flex">
                <Image
                  width={20}
                  height={20}
                  src="/site/coin.svg"
                  className="w-auto h-5 aspect-square"
                  alt=""
                />
                {balanceToSettle(value)}
              </span>
            </p>
          </div>
        </div>
      )}

      {value && (
        <div className="mt-5">
          <button
            onClick={handlePointBuy}
            className="w-full py-4 font-bold text-white uppercase bg-black rounded-md"
          >
            Add Points
          </button>
        </div>
      )}
    </div>
  );
};

export default AddPoints;
