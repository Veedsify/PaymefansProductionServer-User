"use client";
import { useState } from "react";
import SetSubscription from "./SetSubscription";

const SubscriptionState = () => {
  const [subscription, setSubscriptionState] = useState(false);

  return (
    <div>
      <button
        onClick={() => setSubscriptionState(!subscription)}
        className="text-center bg-[#FAE2FF] my-2 text-primary-dark-pink w-full p-4 rounded-xl block cursor-pointer font-bold hover:bg-[#f2c9fa] duration-200"
      >
        SET SUBSCRIPTION PRICE
      </button>
      {subscription && <SetSubscription />}
    </div>
  );
};

export default SubscriptionState;
