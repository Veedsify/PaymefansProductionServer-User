"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WishlistProduct = {
  id: number;
  product_id: string;
  name: string;
  price: number;
  images: {
    id: number;
    image_url: string;
  }[];
  description: string;
  instock: number;
  category: {
    name: string;
  };
  sizes: {
    size: {
      id: number;
      name: string;
    };
  }[];
  dateAdded?: Date;
};

type WishlistContext = {
  wishlist: WishlistProduct[];
  setWishlist: (wishlist: WishlistProduct[]) => void;
  addToWishlist: (product: WishlistProduct) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
};

export const useWishlistStore = create<WishlistContext>()(
  persist(
    (set, get) => ({
      wishlist: [],
      setWishlist: (wishlist) => set({ wishlist }),
      addToWishlist: (product) =>
        set((state) => {
          const existingProduct = state.wishlist.find(
            (p) => p.product_id === product.product_id,
          );
          if (existingProduct) {
            return state; // Product already in wishlist
          }
          return {
            wishlist: [
              ...state.wishlist,
              { ...product, dateAdded: new Date() },
            ],
          };
        }),
      removeFromWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.filter((p) => p.product_id !== productId),
        })),
      clearWishlist: () => set({ wishlist: [] }),
      isInWishlist: (productId) => {
        const state = get();
        return state.wishlist.some((p) => p.product_id === productId);
      },
      getWishlistCount: () => {
        const state = get();
        return state.wishlist.length;
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
