"use client";
import { useCartStore } from "@/contexts/StoreContext";
import { useWishlistStore } from "@/contexts/WishlistContext";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";

const CartIcon = () => {
  const { total } = useCartStore();
  const { getWishlistCount } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartTotal = mounted ? total() : 0;
  const wishlistTotal = mounted ? getWishlistCount() : 0;

  return (
    <div className="flex items-center gap-4">
      <Link href="/store/wishlist" className="relative">
        <Heart
          className="w-7 h-7 ml-auto text-gray-900 dark:text-white hover:text-red-500 transition-colors"
          strokeWidth={2}
        />
        {wishlistTotal > 0 && (
          <div className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px]">
            {Number(wishlistTotal).toLocaleString()}
          </div>
        )}
      </Link>
      <Link href="/store/cart" className="relative">
        <ShoppingCart
          className="w-7 h-7 ml-auto text-gray-900 dark:text-white hover:text-primary-dark-pink transition-colors"
          strokeWidth={2}
        />
        {cartTotal > 0 && (
          <div className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1 py-1 text-xs font-bold leading-none text-white bg-primary-dark-pink rounded-full min-w-[18px] h-[18px]">
            {Number(cartTotal).toLocaleString()}
          </div>
        )}
      </Link>
    </div>
  );
};

export default CartIcon;
