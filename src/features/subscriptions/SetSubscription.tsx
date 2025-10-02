"use client";

import { LucideAlertCircle } from "lucide-react";
import Image from "next/image";
import React, {
  type MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import AddSubscriptionTiers from "@/actions/AddSubscriptionTiers";
import { useConfigContext } from "@/contexts/ConfigContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { SubscriptionTiersProps } from "@/types/Components";
import { getToken } from "@/utils/Cookie";
import FetchUserSubscriptions from "@/utils/data/FetchUserSubscriptions";

const initialTier = {
  tier_name: "",
  tier_price: 0,
  tier_duration: "select",
  tier_description: "",
};

const SetSubscription = () => {
  const { user } = useAuthContext();
  const [tiers, setTiers] = useState<SubscriptionTiersProps[]>([initialTier]);
  const { config } = useConfigContext();

  // Fetch Subscriptions
  const GetSubscriptions = useCallback(async () => {
    try {
      const url = `/subscribers/subscriptions/${user?.user_id}`;
      const subscriptions = await FetchUserSubscriptions(url);
      if (subscriptions.data.data.length === 0) {
        setTiers([initialTier]); // Reset to a single empty tier
      } else {
        setTiers(subscriptions.data.data);
      }
    } catch (e: any) {
      console.log(e);
      toast.error(
        "Subscription could not be retrieved. Please try again later",
        {
          id: "settings-saved",
        },
      );
    }
  }, [user?.user_id]);

  useEffect(() => {
    GetSubscriptions();
  }, [GetSubscriptions]);

  // Add a new tier
  const handleAddTier = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (tiers.length >= 3) {
      return toast.error("You can only add up to 3 tiers at a time", {
        id: "settings-saved",
      });
    }

    setTiers([...tiers, initialTier]);
  };

  // Remove a tier by index
  const handleRemoveTier =
    (index: number) => (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (tiers.length === 1) {
        return toast.error("You must have at least one tier", {
          id: "settings-saved",
        });
      }

      setTiers(tiers.filter((_, i) => i !== index)); // Remove the tier at the specific index
    };

  // Update a tier's field dynamically
  const updateTierField = (
    index: number,
    field: keyof SubscriptionTiersProps,
    value: string | number,
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
        message: string;
      };
      if (saveSubscriptions?.error) {
        toast.error(saveSubscriptions.message || "Save failed.", {
          id: "settings-saved",
        });
      } else {
        toast.success("Subscription saved successfully", {
          id: "settings-saved",
        });
        GetSubscriptions();
      }
    } catch (error) {
      console.error("Save failed.", error);
      toast.error("An error occurred while saving!", {
        id: "settings-saved",
      });
    }
  };

  return (
    <div className={`mt-10`}>
      <h1 className="mb-3 text-2xl font-bold">Subscription</h1>
      <p>Setup a subscription price for your fans</p>
      <div className="text-center bg-[#FAE2FF] my-4 flex justify-center items-center text-primary-dark-pink w-full gap-2 p-8 rounded-xl cursor-pointer">
        <LucideAlertCircle />
        <p>You will receive 100% for each transaction</p>
      </div>
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Subscription Tiers</h2>
        <div className="space-y-4">
          <div className="p-4 bg-white border border-black/30 rounded-xl dark:bg-gray-900">
            <form onSubmit={handleFormSubmit}>
              {tiers.map((tier, index) => (
                <div className="tierNode" key={index}>
                  <div className="md:flex justify-between flex-wrap w-full mb-3 space-y-5 md:space-y-0 gap-3">
                    <input
                      type="text"
                      name={`name-${index}`}
                      required
                      value={tier.tier_name}
                      onChange={(e) =>
                        updateTierField(index, "tier_name", e.target.value)
                      }
                      placeholder="Tier Name (e.g. Basic)"
                      className="flex-1 p-2 w-full font-medium border rounded-lg outline-none border-black/30 bg-gray-50 dark:bg-gray-800"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center w-full gap-2">
                        <span>₦</span>
                        <input
                          type="number"
                          placeholder="Price"
                          id={`price-${index}`}
                          defaultValue={
                            tier.tier_price *
                            (config?.point_conversion_rate_ngn || 1)
                          }
                          onChange={(e) => {
                            if (e.target.value === "") {
                              console.log("empty");
                              return (e.currentTarget.value = "");
                            }
                            const naira = parseFloat(e.target.value) || 0;
                            const points =
                              naira / (config?.point_conversion_rate_ngn || 1);
                            updateTierField(index, "tier_price", points);
                          }}
                          name={`price`}
                          className="min-w-xs w-full p-2 border rounded-lg outline-none border-black/30 bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                      {tier.tier_price > 0 &&
                        config?.point_conversion_rate_ngn && (
                          <p className="text-sm text-right text-primary-dark-pink inline-flex items-center justify-end gap-2">
                            <Image
                              width={16}
                              height={16}
                              priority
                              src="/site/coin.svg"
                              alt=""
                            />
                            <span>{Math.round(tier.tier_price)}</span>
                          </p>
                        )}
                    </div>
                  </div>
                  <select
                    name={`duration-${index}`}
                    required
                    value={tier.tier_duration}
                    onChange={(e) =>
                      updateTierField(index, "tier_duration", e.target.value)
                    }
                    className="w-full p-2 mb-3 border rounded-lg outline-none border-black/30 bg-gray-50 dark:bg-gray-800"
                  >
                    <option disabled value="select">
                      Select duration
                    </option>
                    <option value="14">2 Weeks</option>
                    <option value="28">1 Month</option>
                    <option value="84">3 Months</option>
                    <option value="168">6 Months</option>
                  </select>
                  {/*<textarea
                    name={`perks-${index}`}
                    value={tier.tier_description}
                    onChange={(e) =>
                      updateTierField(index, "tier_description", e.target.value)
                    }
                    placeholder="Add special perks for this tier..."
                    className="w-full h-20 p-2 border rounded-lg resize-none  border-black/30 bg-gray-50 dark:bg-gray-800"
                  />*/}
                  <div className="pb-6">
                    <div className="mb-4 text-right">
                      <button
                        onClick={handleRemoveTier(index)}
                        className="text-sm cursor-pointer text-primary-dark-pink"
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
            className="w-full p-4 text-sm font-medium text-white border-2 rounded-xl hover:bg-primary-text-dark-pink bg-primary-dark-pink duration-300"
          >
            Save
          </button>
          <button
            onClick={handleAddTier}
            className="w-full p-4 text-sm font-medium text-gray-700 border-2 border-dashed rounded-xl hover:bg-gray-50"
          >
            + Add New Tier
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetSubscription;
