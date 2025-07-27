"use client";
import React, { useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  useWishlist,
  useClearWishlist,
  useToggleWishlist,
} from "@/hooks/useWishlist";
import { useWishlistStore } from "@/contexts/WishlistContext";
import { useCartStore } from "@/contexts/StoreContext";
import numeral from "numeral";
import toast from "react-hot-toast";

const WishlistPage = () => {
  const { data, isLoading, isError, error } = useWishlist();
  const { wishlist, getWishlistCount } = useWishlistStore();
  const { addProduct, cart } = useCartStore();
  const clearWishlistMutation = useClearWishlist();
  const { toggleWishlist } = useToggleWishlist();

  const wishlistCount = getWishlistCount();

  const addToCart = (product: any) => {
    // Check if product already in cart
    const findProductInCart = cart.find(
      (p) => p.product_id === product.product_id,
    );

    if (findProductInCart) {
      toast.error("Product already in cart");
      return;
    }

    // Check if product has sizes
    if (product.sizes && product.sizes.length > 0) {
      // Redirect to product page for size selection
      window.location.href = `/store/product/${product.product_id}`;
      return;
    }

    // Add to cart without size
    addProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      quantity: 1,
      description: product.description,
      instock: product.instock,
      category: product.category,
      product_id: product.product_id,
    });
    toast.success("Product added to cart");
  };

  const handleRemoveFromWishlist = (productId: string) => {
    toggleWishlist(productId, null);
  };

  const handleClearWishlist = () => {
    if (wishlistCount === 0) {
      toast.error("Wishlist is already empty");
      return;
    }

    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      clearWishlistMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">
            {(error as any)?.response?.data?.message ||
              "Failed to load wishlist"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* <Link
                href="/store"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Store</span>
              </Link> */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    My Wishlist
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {wishlistCount} {wishlistCount === 1 ? "item" : "items"}{" "}
                    saved
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {wishlistCount > 0 && (
                <button
                  onClick={handleClearWishlist}
                  disabled={clearWishlistMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
              <Link
                href="/store/cart"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        {wishlistCount === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Save items you love by clicking the heart icon on any product.
              Your wishlist makes it easy to find and purchase items later!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/store"
                className="px-8 py-3 bg-primary-dark-pink text-white rounded-lg hover:bg-primary-text-dark-pink transition-colors font-medium"
              >
                Browse Products
              </Link>
              <Link
                href="/store/cart"
                className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                View Cart
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.product_id}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Product Image */}
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                  <Link href={`/store/product/${item.product_id}`}>
                    <Image
                      src={item.images[0]?.image_url}
                      alt={item.name}
                      width={300}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.product_id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-sm"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/store/product/${item.product_id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:text-primary-dark-pink transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary-dark-pink">
                      ₦{numeral(item.price).format("0,0.00")}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.category.name}
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.instock > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {item.instock > 0
                        ? `${item.instock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.instock === 0}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-dark-pink text-white py-2 rounded-lg hover:bg-primary-text-dark-pink transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <Link
                      href={`/store/product/${item.product_id}`}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        {wishlistCount > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Ready to shop?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Move your favorite items to cart and complete your purchase
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/store"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/store/cart"
                  className="px-4 py-2 bg-primary-dark-pink text-white rounded-lg hover:bg-primary-text-dark-pink transition-colors font-medium"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
