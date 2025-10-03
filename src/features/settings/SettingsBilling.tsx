"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSettingsBillingContext } from "@/contexts/SettingsBillingContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import Toggle from "../../components/common/toggles/Checked";
const SubscriptionState = dynamic(
  () => import("../subscriptions/SubscriptionState"),
  {
    ssr: false,
  }
);
import { useConfigContext } from "@/contexts/ConfigContext";
import { SUBSCRIPTIONS_CONFIG } from "@/config/config";

const Settingsbilling = () => {
  const { user } = useAuthContext();
  const [rawPrice, setRawPrice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { config } = useConfigContext();
  const { settings, setSubscription, saveSettings } =
    useSettingsBillingContext();

  useEffect(() => {
    if (config && settings && !isEditing) {
      const priceInNaira =
        settings.price_per_message * config.point_conversion_rate_ngn;
      setRawPrice(priceInNaira ? priceInNaira.toLocaleString() : "");
    }
  }, [config, settings, isEditing]);

  const handlePriceSet = (e: any) => {
    if (!config || !settings) return;
    const val = e.target.value;
    setRawPrice(val);
    if (val === "") {
      setSubscription({
        ...settings,
        price_per_message: 0,
        enable_free_message: settings.enable_free_message,
      });
      return;
    }
    const newprice = parseInt(val || "0", 10);
    setSubscription({
      ...settings,
      price_per_message:
        newprice < config.point_conversion_rate_ngn
          ? 0
          : Math.ceil(newprice / config.point_conversion_rate_ngn),
      enable_free_message: settings.enable_free_message,
    });
  };

  const handleSave = async () => {
    if (!config || !settings) return;
    // if (
    //   Number(settings?.price_per_message * config?.point_conversion_rate_ngn!) <
    //     SUBSCRIPTIONS_CONFIG.MINIMUM_SUBSCRIPTION_PRICE_NGN &&
    //   settings?.price_per_message !== 0
    // ) {
    //   return toast.error("Price must be at least ₦10,000", { id: "price" });
    // }
    saveSettings();
  };

  const handleToggle = (value: boolean) => {
    if (!settings) return;
    setSubscription({
      ...settings,
      price_per_message: 0,
      enable_free_message: value,
    });
  };

  const pointValue = useMemo(() => {
    if (!config || !settings) return;
    return Math.round(settings?.price_per_message);
  }, [config, settings]);

  return (
    <>
      <div className="py-5">
        <h1 className="mb-5 font-bold">Set your message amount</h1>
        <div className="flex w-full p-4 mb-3 text-black border border-gray-300 outline-none rounded-xl gap-2 ">
          <div className="flex items-center w-full gap-2">
            <span className="tex-lg">{"₦"}</span>
            <input
              type="text"
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                if (value === "" || /^\d+$/.test(value)) {
                  handlePriceSet({ target: { value } });
                }
              }}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              value={rawPrice}
              placeholder="Price"
              className="w-full font-bold text-gray-700 outline-none"
            />
          </div>
          <h2 className="font-bold text-primary-dark-pink inline-flex items-center">
            <Image
              width={16}
              height={16}
              src="/site/coin.svg"
              className="h-4 inline"
              alt=""
            />
            {Number(pointValue).toLocaleString()}
          </h2>
        </div>

        <span className="inline-flex my-4 gap-2">
          <Toggle
            set={handleToggle}
            state={settings?.price_per_message === 0}
          />
          Free message enabled
        </span>

        <button
          onClick={handleSave}
          className="w-full p-4 cursor-pointer text-center text-white bg-primary-dark-pink rounded-xl"
        >
          SAVE
        </button>
      </div>
      {user?.is_model && <SubscriptionState />}
    </>
  );
};

export default Settingsbilling;
