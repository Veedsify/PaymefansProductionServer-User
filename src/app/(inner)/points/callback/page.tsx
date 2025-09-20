"use client";
import { FetchQueryOptions } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CoinProcessing from "@/components/common/loaders/Processing";
import CoinUsedUp from "@/components/common/toggles/Cancelled";
import CoinPurchaseSuccessful from "@/components/common/toggles/Successful";
import axiosInstance from "@/utils/Axios";

const PageCallBack = () => {
  const router = useRouter();
  const reference = useSearchParams().get("reference");
  const [successful, setSuccessful] = useState<boolean | null>(null);
  useEffect(() => {
    const verifyBuy = async () => {
      const verifyPurchaseFunction = await axiosInstance.post(
        `/points/callback`,
        { reference: reference },
      );
      if (verifyPurchaseFunction.data.status === true) {
        router.refresh();
        setSuccessful(true);
      } else {
        setSuccessful(false);
        router.refresh();
      }
    };
    verifyBuy();
  }, [reference, router]);

  return (
    <div>
      {successful === null ? (
        <CoinProcessing />
      ) : successful ? (
        <CoinPurchaseSuccessful />
      ) : (
        <CoinUsedUp />
      )}
    </div>
  );
};

export default PageCallBack;
