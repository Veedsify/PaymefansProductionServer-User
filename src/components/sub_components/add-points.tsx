"use client";

import { POINTS_CONFIG } from "@/config/config";
import ROUTE from "@/config/routes";
import { getToken } from "@/utils/cookie.get";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";

const AddPoints = () => {
  const [value, setValue] = useState("");
  const conversionRate = 100;

  // Format the input value with commas
  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters
    let inputValue = e.target.value.replace(/\D/g, "");
    setValue(formatNumber(inputValue));
  };

  function removeStringsAndFee(value: string) {
    let num = value.replace(/\D/g, "");
    return (parseInt(num) * 0.1).toLocaleString();
  }

  function balanceToSettle(value: string) {
    let num = value.replace(/\D/g, "");
    const balance = (parseInt(num) * 0.9) / conversionRate;
    return Math.round(balance).toLocaleString();
  }

  function pricePerPoints(value: string) {
    let num = value.replace(/\D/g, "");
    return parseInt(num).toLocaleString();
    // return (parseInt(num) * 0.8).toLocaleString();
  }

  async function handlePointBuy() {
    const token = getToken();

    toast.loading(POINTS_CONFIG.POINT_PENDING_PAYMENTS);

    const validate =
      parseInt(value.replace(/\D/g, "")) < POINTS_CONFIG.POINT_MINIMUM_DEPOSIT;
    if (!value || validate) {
      toast.error(POINTS_CONFIG.POINTS_MINIMUM_DEPOSIT_ERROR);
      return;
    }

    try {
      const response = await fetch(ROUTE.PURCHASE_POINTS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseInt(value.replace(/\D/g, "")) }),
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
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(POINTS_CONFIG.POINTS_PURCHASE_FAILED);
      console.error(error);
    }
  }

  return (
    <div>
      <div className="flex gap-2 items-start mb-3">
        <div className="text-4xl">₦</div>
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
          {/* <div className="flex justify-between border-b py-4 mb-3">
            <p className="text-xl font-semibold">Amount To Add</p>
            <p className="text-xl font-medium">₦ {value}</p>
          </div> */}
          <div className="flex justify-between py-2">
            <p className="text-xl">Platform Fee</p>
            <p className="text-xl font-mediu/m">
              10%
              {/* ₦ {removeStringsAndFee(value)} */}
            </p>
          </div>
          <div className="flex justify-between py-2">
            <p className="text-xl">Amount</p>
            {/* <p className="text-xl font-medium">₦ {pricePerPoints(value)}</p> */}
            <p className="text-xl font-medium">₦ {pricePerPoints(value)}</p>
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
            className="bg-black font-bold uppercase text-white w-full py-4 rounded-md"
          >
            Add Points
          </button>
        </div>
      )}
    </div>
  );
};

export default AddPoints;
