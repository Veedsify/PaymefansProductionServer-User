"use client";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CartComponent from "@/components/modals/CartComponent";
import CheckoutModal from "@/components/modals/CheckoutModal";
import { useCartStore } from "@/contexts/StoreContext";

const CartPage = () => {
  const { cart, calculateTotalPrice } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="px-4 py-6 mx-auto max-w-screen-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* <Link
                href="/store"
                className="flex items-center text-gray-600 gap-2 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Store</span>
              </Link> */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-dark-pink/10">
                  <ShoppingBag className="w-6 h-6 text-primary-dark-pink" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Shopping Cart
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalItems} {totalItems === 1 ? "item" : "items"} in your
                    cart
                  </p>
                </div>
              </div>
            </div>
            <div className="items-center hidden md:flex gap-4">
              <Link
                href="/store/wishlist"
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg gap-2 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Heart className="w-4 h-4" />
                Wishlist
              </Link>
              <Link
                href="/store"
                className="px-6 py-2 font-medium text-white rounded-lg bg-primary-dark-pink hover:bg-primary-text-dark-pink transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-screen-xl sm:px-6 lg:px-8">
        {cart.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-200 dark:bg-gray-900 rounded-2xl shadow-sm dark:border-gray-800">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full dark:bg-gray-800">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Your cart is empty
            </h2>
            <p className="max-w-md mx-auto mb-8 text-gray-500 dark:text-gray-400">
              Looks like you haven&apos;t added any items to your cart yet.
              Start browsing our products to find something you love!
            </p>
            <div className="flex flex-col justify-center sm:flex-row gap-4">
              <Link
                href="/store"
                className="px-8 py-3 font-medium text-white rounded-lg bg-primary-dark-pink hover:bg-primary-text-dark-pink transition-colors"
              >
                Browse Products
              </Link>
              <Link
                href="/store/wishlist"
                className="px-8 py-3 font-medium text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                View Wishlist
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cart Items */}
            <div className="">
              <div className="bg-white border-gray-200 dark:bg-gray-900 rounded-2xl dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cart Items
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>
                <CartComponent />
              </div>
            </div>

            {/* Order Summary */}
            <div className="">
              <div className="sticky p-6 bg-white border border-gray-200 dark:bg-gray-900 rounded-2xl dark:border-gray-800 top-6">
                <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                  Order Summary
                </h2>

                <div className="mb-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₦{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-lg font-bold text-primary-dark-pink">
                        ₦{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowCheckout(true)}
                    disabled={cart.length === 0}
                    className="w-full py-3 font-medium text-white rounded-lg bg-primary-dark-pink hover:bg-primary-text-dark-pink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout
                  </button>
                  <Link
                    href="/store"
                    className="block w-full py-3 font-medium text-center text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-500 gap-2 dark:text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Secure checkout with 256-bit SSL encryption
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </div>
  );
};

export default CartPage;
