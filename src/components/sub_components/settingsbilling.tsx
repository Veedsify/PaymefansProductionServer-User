"use client"
import Image from "next/image";
import Toggle from "./checked";
import SubscriptionState from "./subscriptionState";
import { useUserAuthContext } from "@/lib/userUseContext";
import { useSettingsBillingContext } from "@/contexts/settings-billing-context";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Settingsbilling = () => {
    const { user } = useUserAuthContext()
    const [price, setPrice] = useState<number>(0)

    const { settings, setSubscription, saveSettings } = useSettingsBillingContext()

    const handlePriceSet = (e: any) => {
        const newprice = Number(e.target.value)
        setSubscription({
            ...settings
            , price_per_message: newprice, enable_free_message: settings.enable_free_message
        })
    }

    const handleSave = async () => {
        saveSettings()
    }

    const handleToggle = (value: boolean) => {
        setPrice
        setPrice
        setSubscription({ ...settings, enable_free_message: value })
    }

    return (
        <div className="py-5">
            <h1 className="font-bold mb-5">Set your message amount</h1>
            <div className="w-full border mb-3 border-gray-300 p-4 outline-none text-black rounded-xl flex gap-2 ">
                <div className="flex gap-2 w-full">
                    <Image width={30} height={30} src="/site/coin.svg" alt="" />
                    <input
                        type="number"
                        onChange={handlePriceSet}
                        defaultValue={settings?.price_per_message}
                        placeholder="Price"
                        className="w-full outline-none font-bold text-gray-700"
                    />
                </div>
                <h2 className="text-primary-dark-pink font-bold">₦{Number(settings?.price_per_message).toLocaleString()}</h2>
            </div>

            <span className="inline-flex gap-2 my-4">
                <Toggle
                    set={handleToggle}
                    state={settings.price_per_message == 0} />
                Free message enabled
            </span>

            <button
                onClick={handleSave}
                className="text-center text-white bg-primary-dark-pink w-full p-4 rounded-xl">
                SAVE
            </button>
            {user?.is_model && <SubscriptionState />}
        </div>
    );
}

export default Settingsbilling;