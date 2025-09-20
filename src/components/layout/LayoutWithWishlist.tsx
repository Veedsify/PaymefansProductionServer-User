"use client";

import type { ReactNode } from "react";
import ToggleWishListProvider from "@/contexts/ToggleWishlist";
import WishList from "@/features/store/WishList";

interface LayoutWithWishlistProps {
  children: ReactNode;
}

/**
 * Layout wrapper that provides wishlist functionality only where needed.
 * This reduces the scope of the ToggleWishListProvider context.
 */
const LayoutWithWishlist = ({ children }: LayoutWithWishlistProps) => {
  return (
    <ToggleWishListProvider>
      {children}
      <WishList />
    </ToggleWishListProvider>
  );
};

export default LayoutWithWishlist;
