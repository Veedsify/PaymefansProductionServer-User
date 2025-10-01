"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSettingsBillingContext } from "@/contexts/SettingsBillingContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import Toggle from "../../components/common/toggles/Checked";
import SubscriptionState from "../subscriptions/SubscriptionState";
import { useConfigContext } from "@/contexts/ConfigContext";

const Settingsbilling = () => {
  const { user } = useAuthContext();
  const [price, setPrice] = useState<number>();
  const { config } = useConfigContext();
  const { settings, setSubscription, saveSettings } =
    useSettingsBillingContext();

  const handlePriceSet = (e: any) => {
    if (!config) return;
    const newprice = Number(e.target.value * config?.point_conversion_rate_ngn);
    setSubscription({
      ...settings,
      price_per_message: newprice,
      enable_free_message: settings.enable_free_message,
    });
  };

  const handleSave = async () => {
    saveSettings();
  };

  const handleToggle = (value: boolean) => {
    setPrice;
    setPrice;
    setSubscription({ ...settings, enable_free_message: value });
  };

  return (
    <div className="py-5">
      <h1 className="mb-5 font-bold">Set your message amount</h1>
      <div className="flex w-full p-4 mb-3 text-black border border-gray-300 outline-none rounded-xl gap-2 ">
        <div className="flex w-full gap-2">
          <Image width={30} height={30} src="/site/coin.svg" alt="" />
          <input
            type="number"
            onChange={handlePriceSet}
            defaultValue={settings?.price_per_message}
            placeholder="Price"
            className="w-full font-bold text-gray-700 outline-none"
          />
        </div>
        <h2 className="font-bold text-primary-dark-pink">
          ₦{Number(settings?.price_per_message).toLocaleString()}
        </h2>
      </div>

      <span className="inline-flex my-4 gap-2">
        <Toggle set={handleToggle} state={settings.price_per_message == 0} />
        Free message enabled
      </span>

      <button
        onClick={handleSave}
        className="w-full p-4 text-center text-white bg-primary-dark-pink rounded-xl"
      >
        SAVE
      </button>
      {user?.is_model && <SubscriptionState />}
    </div>
  );
};

export default Settingsbilling;
