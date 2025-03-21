"use client"
import CoinUsedUp from "@/components/sub_components/coinpurchase/cancelled";
import CoinProcessing from "@/components/sub_components/coinpurchase/processing";
import CoinPurchaseSuccessful from "@/components/sub_components/coinpurchase/successful";
import axiosInstance from "@/utils/axios";
import {
    FetchQueryOptions
} from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PageCallBack = () => {
    const router = useRouter()
    const reference = useSearchParams().get("reference")
    const [successful, setSuccessful] = useState<boolean | null>(null);
    useEffect(() => {
        const verifyBuy = async () => {
            const verifyPurchaseFunction = await axiosInstance.post(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/points/callback`, { reference: reference }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${document.cookie.split("token=")[1].split(";")[0]}`,
                }
            })
            if (verifyPurchaseFunction.data.status === true) {
                router.refresh()
                setSuccessful(true)
            } else {
                setSuccessful(false)
                router.refresh();
            }
        }
        verifyBuy()

    }, [reference, router])

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
}

export default PageCallBack;
