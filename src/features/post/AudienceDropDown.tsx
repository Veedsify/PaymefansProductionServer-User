import { PostAudienceDataProps } from "@/types/Components";
import { LucideChevronDown, LucideChevronUp } from "lucide-react";
import Image from "next/image";
import React from "react";

// Optimized AudienceDropdown
const AudienceDropdown = React.memo(
  ({
    postAudience,
    postAudienceData,
    dropdown,
    setPrice,
    setDropdown,
    updatePostAudience,
    price,
    config,
    nairaDisplayValue,
  }: {
    postAudience: PostAudienceDataProps | null;
    postAudienceData: PostAudienceDataProps[];
    dropdown: boolean;
    setPrice: (value: string) => void;
    setDropdown: (value: boolean) => void;
    updatePostAudience: (audience: PostAudienceDataProps) => void;
    price: number;
    config: any;
    nairaDisplayValue: string;
  }) => {
    return (
      <div className="flex flex-wrap items-start w-full gap-4">
        <button
          className="relative inline-block px-3 ml-2 text-sm text-gray-800 border border-gray-800 rounded-3xl dark:text-gray-200"
          onClick={() => setDropdown(!dropdown)}
        >
          <span className="flex items-center justify-start w-40 p-2 text-sm font-medium text-left cursor-pointer gap-3 transition-all duration-300">
            {postAudience?.icon}
            <span className="flex-1">{postAudience?.name}</span>
            {dropdown ? (
              <LucideChevronUp size={20} />
            ) : (
              <LucideChevronDown size={20} />
            )}
          </span>
          <div
            className={`absolute w-full left-0 mt-0 transition-all duration-300 z-10 ${
              dropdown
                ? "opacity-100 -translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <ul className="w-full mt-2 overflow-hidden text-left bg-white border border-gray-800 dark:bg-gray-950 rounded-2xl">
              {postAudienceData.map((audience) => (
                <li
                  key={audience.id}
                  onClick={() => updatePostAudience(audience)}
                  className="flex items-center p-3 pr-5 text-sm font-medium text-gray-600 cursor-pointer gap-2 dark:text-gray-400 dark:hover:bg-slate-800 hover:bg-violet-50"
                >
                  {audience.icon}
                  {audience.name}
                </li>
              ))}
            </ul>
          </div>
        </button>
        {postAudience?.name === "Price" && (
          <div className="flex items-center gap-1">
            <div className="flex items-center px-3 text-sm text-gray-800 border border-gray-800 rounded-3xl dark:text-gray-200">
              <span className="text-base">₦</span>
              <input
                type="text"
                value={nairaDisplayValue}
                onChange={(e) => {
                  if (e.target.value === "" || !e.target.value) {
                    setPrice("");
                    return;
                  }
                  setPrice(e.target.value);
                }}
                placeholder="Enter amount in Naira"
                className="outline-0 border-0 rounded-3xl px-1 text-base py-[6px] text-gray-800 dark:text-gray-200 bg-transparent"
              />
              {price > 0 && (
                <div className="flex items-center ml-auto gap-1">
                  <Image
                    width={16}
                    height={16}
                    src="/site/coin.svg"
                    className="w-4 h-4 aspect-square"
                    alt=""
                  />
                  <p className="text-primary-dark-pink">
                    {price.toLocaleString()} points
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

AudienceDropdown.displayName = "AudienceDropdown";
export default AudienceDropdown;
