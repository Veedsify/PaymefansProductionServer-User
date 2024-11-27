import { LucideAlertCircle } from "lucide-react";
import Toggle from "./checked";
import Image from "next/image";
import { useUserAuthContext } from "@/lib/userUseContext";
import React, { ChangeEvent, MouseEvent, useRef } from "react";
import { useSettingsBillingContext } from "@/contexts/settings-billing-context";
import toast from "react-hot-toast";
import Form from "next/form";
import AddSubscriptionTiers from "@/actions/add-subscription-tiers";

const SetSubscription = () => {
  const { user } = useUserAuthContext();
  const { settings, setSubscription } = useSettingsBillingContext();
  const [saveButton, setSaveButton] = React.useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAddTier = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (formRef.current && formRef.current?.childElementCount == 3) {
      return toast.error("You can only add 3 tiers at a time");
    }
    const tierNode = document.querySelector(".tierNode");
    if (tierNode) {
      const clone = tierNode.cloneNode(true) as HTMLElement;
      // Clear only the cloned node's input values
      clone.querySelectorAll("input").forEach((input) => {
        input.value = "";
      });
      const clonedSelect = clone.querySelector("select");
      if (clonedSelect) {
        clonedSelect.value = "select";
      }
      const clonedTextarea = clone.querySelector("textarea");
      if (clonedTextarea) {
        clonedTextarea.value = "";
      }
      // Add event listener to the cloned remove button
      const removeButton = clone.querySelector("button");
      if (removeButton) {
        removeButton.addEventListener("click", (e) =>
          handleRemoveTier(e as unknown as MouseEvent<HTMLSpanElement>)
        );
      }
      formRef.current?.appendChild(clone);
    }
  };

  const handleRemoveTier = (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    const tierNode = e.currentTarget.closest(".tierNode");
    if (tierNode && formRef.current && formRef.current?.childElementCount > 1) {
      tierNode.remove();
    } else {
      return toast.error("You must have at least one tier");
    }
  };

  const updateContextSubscription = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string
  ) => {
    const value = e.target.value;
    setSubscription({
      ...settings,
      [field]: value,
    });
    setSubscription({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className={`mt-10 `}>
      <h1 className="font-bold text-2xl mb-3">Subscription</h1>
      <p>Setup a subscription price for your fans</p>
      <div className="text-center bg-[#FAE2FF] my-4 flex justify-center items-center text-primary-dark-pink w-full gap-2 p-8 rounded-xl  cursor-pointer">
        <LucideAlertCircle />
        <p>You will receive 100% for each transaction</p>
      </div>
      <div className="mt-8">
        <h2 className="font-bold text-xl mb-4">Subscription Tiers</h2>
        <div className="space-y-4">
          <div className="border rounded-xl p-4 bg-white">
            <Form ref={formRef} action={AddSubscriptionTiers}>
              <div className="tierNode">
                <div className="flex justify-between mb-3 gap-5">
                  <input
                    type="text"
                    name="name[]"
                    required
                    placeholder="Tier Name (e.g. Basic)"
                    className="flex-1 outline-none font-medium border p-2 bg-gray-50 rounded-lg"
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
                      name="price[]"
                      className="w-32 outline-none border p-2 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                <select
                  name="duration[]"
                  required
                  className="w-full border p-2 rounded-lg mb-3  outline-none bg-gray-50"
                  defaultValue="select"
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
                  name="perks[]"
                  required
                  placeholder="Add special perks for this tier..."
                  className="w-full border p-2 rounded-lg h-20 resize-none bg-gray-50"
                />
                <div className="pb-6">
                  <div className="text-right mb-4">
                    <button
                      onClick={handleRemoveTier}
                      className="text-primary-dark-pink text-sm cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <hr />
                </div>
              </div>
            </Form>
          </div>
          <button
            onClick={() => formRef.current?.requestSubmit()}
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
      <div className="mt-6"></div>
    </div>
  );
};

export default SetSubscription;
