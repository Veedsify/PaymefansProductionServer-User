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
  { rate: 1, name: "USD", buyValue: 1, sellValue: 1, symbol: "$" },
  { rate: 1, name: "NGN", buyValue: 1503, sellValue: 1632, symbol: "₦" },
  { rate: 1, name: "POINTS", buyValue: 16, sellValue: 16, symbol: "P" },
  { rate: 1, name: "KES", buyValue: 120, sellValue: 129.19, symbol: "Ksh" },
  { rate: 1, name: "ZAR", buyValue: 18, sellValue: 18.55, symbol: "R" },
  { rate: 1, name: "GHS", buyValue: 14, sellValue: 14.3, symbol: "₵" },
];
const AddPoints = () => {
  const { user } = useUserAuthContext();
  const [value, setValue] = useState("");
  const [rates, setRates] = useState<ExchangeRate[]>(currencyRates);
  const [error, setError] = useState(false);
  const [POINTS_PER_USD, setPointsPerUSD] = useState(0); // Default value
  const PLATFORM_DEPOSITE_FEE = 0.1; // 10% fee
  let POINTS_PER_NAIRA = 100; // Default value

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(ROUTE.GET_PLATFROM_EXCHANGE_RATE);
        if (!response.ok) {
          throw new Error("Failed to fetch exchange rates");
        }
        const data = await response.json();
        if (data.data.length > 0) {
          console.log(data);
          setRates(data.data);
          const pointRate =
            data.data.find((rate: ExchangeRate) => rate.name == "POINTS")
              ?.buyValue ?? 16;
          setPointsPerUSD(pointRate);
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        setError(true);
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
    return (parseInt(num) * PLATFORM_DEPOSITE_FEE).toLocaleString();
  }
  // Calculate points received
  function balanceToSettle(value: string) {
    let num = value.replace(/\D/g, "");
    const amount = parseInt(num) || 0;
    const pointsPlusFees = amount / POINTS_PER_NAIRA;
    return pointsPlusFees.toLocaleString();
  }
  // Get original amount without formatting
  function pricePerPoints(value: string) {
    let num = value.replace(/\D/g, "");
    const fee = calculateFee(value);
    return Number(
      parseInt(num) + parseInt(fee.replace(/\D/g, ""))
    ).toLocaleString();
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
        (rates.find((rate: ExchangeRate) => rate.name === "POINTS")?.buyValue ??
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
    toast.loading(POINTS_CONFIG.POINT_PENDING_PAYMENTS, {
      id: "point-purchase",
    });
    const amount = parseInt(value.replace(/\D/g, "")) || 0;
    // Calculate minimum deposit in user's currency based on NGN 2500 rate
    const minNgn = 2500;
    const userCurrency = user?.currency || "USD";
    const minInUserCurrency = convertCurrency(minNgn, "NGN", userCurrency);
    const validate = amount < minInUserCurrency;
    if (!value || validate) {
      toast.error(
        `Minimum deposit is ${formatConvertedAmount(
          minInUserCurrency,
          userCurrency
        )}`,
        {
          id: "point-purchase",
        }
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
        toast.loading(data.message, {
          id: "point-purchase",
        });
        setTimeout(() => {
          window.location.href = data.checkout.authorization_url;
        }, 100);
      } else {
        toast.error(data.message, {
          id: "point-purchase",
        });
      }
    } catch (error) {
      toast.error(POINTS_CONFIG.POINTS_PURCHASE_FAILED, {
        id: "point-purchase",
      });
      console.error(error);
    }
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
  const ngnValue = convertCurrency(inputAmount, "NGN", "NGN");
  const symbol = rates.find((rate) => rate.name === user?.currency)?.symbol;
  return (
    <div>
      <div className="flex items-start gap-2 mb-3">
        <div className="text-4xl">{symbol}</div>
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
              {
                <span className="text-primary-dark-pink">
                  {PLATFORM_DEPOSITE_FEE * 100}%{" "}
                </span>
              }{" "}
              ({symbol}
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
            <p className="text-xl">Amount To Pay</p>
            <p className="text-xl font-medium">
              {symbol}
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
            className="w-full py-4 font-bold text-white uppercase bg-black dark:bg-primary-dark-pink rounded-md cursor-pointer"
          >
            Add Points
          </button>
        </div>
      )}
    </div>
  );
};
export default AddPoints;
