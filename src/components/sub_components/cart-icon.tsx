"use client";
import { useCartStore } from "@/contexts/store-context";
import { useToggleWishList } from "@/contexts/toggle-wishlist";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";

const CartIcon = () => {
  const { total } = useCartStore();
  const { toggleWishList } = useToggleWishList();

  return (
    <div className="flex items-center gap-4">
      <button onClick={toggleWishList} className="relative">
        <Heart
          className="w-7 h-7 ml-auto text-gray-900 dark:text-white"
          strokeWidth={2}
        />
        <div className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1 py-1 text-xs font-bold leading-none text-white bg-primary-dark-pink rounded-full">
          {Number(total()).toLocaleString()}
        </div>
      </button>
      <Link href="/store/cart" className="relative">
        <ShoppingCart
          className="w-7 h-7 ml-auto text-gray-900 dark:text-white"
          strokeWidth={2}
        />
        <div className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1 py-1 text-xs font-bold leading-none text-white bg-primary-dark-pink rounded-full">
          {Number(total()).toLocaleString()}
        </div>
      </Link>
    </div>
  );
};

export default CartIcon;
