"use client";

import { useToggleWishList } from "@/contexts/ToggleWishlist";
import { X } from "lucide-react";

const WishList = () => {
  const { wishList = false, toggleWishList } = useToggleWishList();

  if (!wishList) return null;

  return (
    <div
      onClick={toggleWishList}
      className={`fixed h-dvh w-full top-0 z-[200] left-0 duration-500 ${wishList
          ? "bg-black/60 pointer-events-auto"
          : "bg-black/0 pointer-events-none"
        }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white p-4 pb-10 w-full md:w-2/4 lg:w-1/4 absolute right-0 top-0 h-dvh
     dark:bg-slate-900 dark:text-white duration-300 ${wishList ? "translate-x-0 opacity-100" : "opacity-0 translate-x-full"
          } 
          `}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Wish List</h2>
          <button className="text-xl" onClick={toggleWishList}>
            <X />
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex-1 py-2 max-h-[calc(100%-4rem)] overflow-y-auto">
            <p className="text-sm text-gray-600">No items in your wish list</p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={toggleWishList}
              className="px-3 py-1 text-white bg-black rounded-md"
            >
              Close
            </button>
            <button className="px-3 py-1 text-white bg-black rounded-md">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishList;
