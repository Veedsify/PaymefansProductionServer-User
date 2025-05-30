"use client";

import { LucideAlertCircle } from "lucide-react";
import Image from "next/image";
import { useUserAuthContext } from "@/lib/UserUseContext";
import React, {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSettingsBillingContext } from "@/contexts/SettingsBillingContext";
import toast from "react-hot-toast";
import Form from "next/form";
import AddSubscriptionTiers from "@/actions/AddSubscriptionTiers";
import { SubscriptionTiersProps } from "@/types/Components";
import { getToken } from "@/utils/Cookie";
import { useRouter } from "next/navigation";
import FetchUserSubscriptions from "@/utils/data/FetchUserSubscriptions";

const initialTier = {
  tier_name: "",
  tier_price: 0,
  tier_duration: "select",
  tier_description: "",
};

const SetSubscription = () => {
  const { user } = useUserAuthContext();
  const [tiers, setTiers] = useState<SubscriptionTiersProps[]>([initialTier]);
  const token = getToken();
  const router = useRouter();

  // Fetch Subscriptions
  const GetSubscriptions = useCallback(async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/subscribers/subscriptions/${user?.user_id}`;
      const subscriptions = await FetchUserSubscriptions(url, token);

      if (subscriptions.data.data.length === 0) {
        setTiers([initialTier]); // Reset to a single empty tier
      } else {
        setTiers(subscriptions.data.data);
      }
    } catch (e: any) {
      console.log(e);
      toast.error(
        "Subscription could not be retrieved. Please try again later"
      );
    }
  }, [user?.user_id, token]);

  useEffect(() => {
    GetSubscriptions();
  }, [GetSubscriptions]);

  // Add a new tier
  const handleAddTier = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (tiers.length >= 3) {
      return toast.error("You can only add up to 3 tiers at a time");
    }

    setTiers([...tiers, initialTier]);
  };

  // Remove a tier by index
  const handleRemoveTier =
    (index: number) => (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (tiers.length === 1) {
        return toast.error("You must have at least one tier");
      }

      setTiers(tiers.filter((_, i) => i !== index)); // Remove the tier at the specific index
    };

  // Update a tier's field dynamically
  const updateTierField = (
    index: number,
    field: keyof SubscriptionTiersProps,
    value: string
  ) => {
    const updatedTiers = [...tiers];
    updatedTiers[index] = {
      ...updatedTiers[index],
      [field]: value,
    };
    setTiers(updatedTiers);
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    try {
      const saveSubscriptions = (await AddSubscriptionTiers({ tiers })) as {
        error: boolean;
      };

      if (saveSubscriptions?.error) {
        toast.error("Subscription could not be saved. Please try again later");
      } else {
        toast.success("Subscription saved successfully");
        GetSubscriptions();
      }
    } catch (error) {
      console.error("Save failed.", error);
      toast.error("An error occurred while saving!");
    }
  };

  return (
    <div className={`mt-10`}>
      <h1 className="font-bold text-2xl mb-3">Subscription</h1>
      <p>Setup a subscription price for your fans</p>
      <div className="text-center bg-[#FAE2FF] my-4 flex justify-center items-center text-primary-dark-pink w-full gap-2 p-8 rounded-xl cursor-pointer">
        <LucideAlertCircle />
        <p>You will receive 100% for each transaction</p>
      </div>
      <div className="mt-8">
        <h2 className="font-bold text-xl mb-4">Subscription Tiers</h2>
        <div className="space-y-4">
          <div className="border border-black/30 rounded-xl p-4 bg-white">
            <form onSubmit={handleFormSubmit}>
              {tiers.map((tier, index) => (
                <div className="tierNode" key={index}>
                  <div className="flex justify-between mb-3 gap-5">
                    <input
                      type="text"
                      name={`name-${index}`}
                      required
                      value={tier.tier_name}
                      onChange={(e) =>
                        updateTierField(index, "tier_name", e.target.value)
                      }
                      placeholder="Tier Name (e.g. Basic)"
                      className="flex-1 outline-none border-black/30 font-medium border p-2 bg-gray-50 rounded-lg"
                    />
                    <div className="flex items-center gap-2">
                      <Image
                        width={20}
                        height={20}
                        priority
                        src="/site/coin.svg"
                        alt=""
                      />
                      <input
                        type="text"
                        placeholder="Price"
                        required
                        value={tier.tier_price}
                        onChange={(e) =>
                          updateTierField(index, "tier_price", e.target.value)
                        }
                        name={`price-${index}`}
                        className="w-32 outline-none border-black/30 border p-2 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                  <select
                    name={`duration-${index}`}
                    required
                    value={tier.tier_duration}
                    onChange={(e) =>
                      updateTierField(index, "tier_duration", e.target.value)
                    }
                    className="w-full border border-black/30 p-2 rounded-lg mb-3 outline-none bg-gray-50"
                  >
                    <option disabled value="select">
                      Select duration
                    </option>
                    <option value="14">2 Weeks</option>
                    <option value="28">1 Month</option>
                    <option value="84">3 Months</option>
                    <option value="168">6 Months</option>
                  </select>
                  <textarea
                    name={`perks-${index}`}
                    required
                    value={tier.tier_description}
                    onChange={(e) =>
                      updateTierField(index, "tier_description", e.target.value)
                    }
                    placeholder="Add special perks for this tier..."
                    className="w-full border  border-black/30 p-2 rounded-lg h-20 resize-none bg-gray-50"
                  />
                  <div className="pb-6">
                    <div className="text-right mb-4">
                      <button
                        onClick={handleRemoveTier(index)}
                        className="text-primary-dark-pink text-sm cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <hr className=" border-black/30" />
                  </div>
                </div>
              ))}
            </form>
          </div>
          <button
            onClick={handleFormSubmit}
            className="w-full border-2 rounded-xl p-4 text-sm font-medium hover:bg-primary-text-dark-pink bg-primary-dark-pink text-white duration-300"
          >
            Save
          </button>
          <button
            onClick={handleAddTier}
            className="w-full border-dashed border-2 rounded-xl p-4 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            + Add New Tier
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetSubscription;
