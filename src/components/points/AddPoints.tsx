"use client";
import { POINTS_CONFIG } from "@/config/config";
import ROUTE from "@/config/routes";
import { useConfigContext } from "@/contexts/ConfigContext";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { ExchangeRate } from "@/types/Components";
import { getToken } from "@/utils/Cookie";
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
  const [value, setValue] = useState(""); // User entry (formatted)
  const [rates, setRates] = useState<ExchangeRate[]>(currencyRates);
  const [error, setError] = useState(false);
  const [POINTS_PER_USD, setPointsPerUSD] = useState(0); // Default value
  const { config } = useConfigContext();

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
    fetchRates();
  }, []);

  // Format number nicely (decimals and thousands), eg: "1,234.56"
  const formatNumber = (num: string) => {
    if (!num) return "";
    // Only one decimal separation
    let parts = num.split(".");
    // Clean leading zeros
    parts[0] = parts[0].replace(/^0+(\d)/, "$1") || "0";
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length === 2 ? parts.join(".") : parts[0];
  };

  // Allow only digits and at most one decimal dot
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9.]/g, "");
    // Prevent multiple decimals
    let parts = inputValue.split(".");
    if (parts.length > 2) inputValue = parts[0] + "." + parts.slice(1).join("");
    setValue(formatNumber(inputValue));
  };

  // Convert the formatted string value ("1,234.56") to float safely
  function getCleanAmount(val: string): number {
    if (!val) return 0;
    let num = val.replace(/,/g, "");
    return parseFloat(num) || 0;
  }
  // Calculate platform fee (10% of input), supports decimals
  function calculateFee(value: string) {
    const amount = getCleanAmount(value);
    return (
      amount * (config?.platform_deposit_fee ?? PLATFORM_DEPOSITE_FEE)
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  // Points received (input), dec as float
  function balanceToSettle(value: string) {
    const amount = getCleanAmount(value);
    const pointsPlusFees = amount / POINTS_PER_NAIRA;
    return pointsPlusFees.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  // Amount to Pay: input + fee
  function pricePerPoints(value: string) {
    const amount = getCleanAmount(value);
    const fee = getCleanAmount(calculateFee(value));
    return (amount + fee).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  // Convert local currency amount to target currency (no change)
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

  // Format converted amount for display (with currency symbol and decimals)
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
    const amount = getCleanAmount(value);
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

  const inputAmount = getCleanAmount(value);
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
            pattern="^\d*\.?\d*$"
            placeholder="0"
            className="w-full p-0 text-6xl font-bold border-none outline-none md:text-9xl"
            inputMode="decimal"
          />
        </div>
      </div>
      {value && (
        <div className="mb-6">
          <div className="flex justify-between py-2">
            <p className="text-xl">Platform Fee</p>
            <p className="text-xl font-medium">
              <span className="text-primary-dark-pink">
                {PLATFORM_DEPOSITE_FEE * 100}%{" "}
              </span>
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
                  className="w-5 h-5 aspect-square"
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
