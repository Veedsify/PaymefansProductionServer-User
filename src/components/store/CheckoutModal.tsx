"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useCartStore } from "@/contexts/StoreContext";
import { useCheckout } from "@/hooks/useCheckout";
import toast from "react-hot-toast";

type ShippingAddress = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
};

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const { cart, calculateTotalPrice, clearcart } = useCartStore();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
  });

  const checkoutMutation = useCheckout();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const items = cart.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      size_id: item.size?.id,
    }));

    checkoutMutation.mutate(
      {
        items,
        shipping_address: shippingAddress,
        payment_method: "paystack",
      },
      {
        onSuccess: (data) => {
          if (data.error) {
            toast.error(data.message);
            return;
          }

          // Show success message
          toast.success("Order placed successfully! Redirecting to payment...");

          // Clear cart and close modal
          clearcart();
          onClose();

          // Redirect to payment URL in the same window for better UX
          if (data.data?.payment_url) {
            // Store order info in localStorage for post-payment handling
            localStorage.setItem("pendingOrderReference", data.data.reference);
            localStorage.setItem("pendingOrderId", data.data.order_id);

            // Redirect to payment page
            window.location.href = data.data.payment_url;
          }
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Checkout failed");
        },
      },
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  const totalAmount = calculateTotalPrice();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Checkout
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Order Summary
              </h3>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.size?.name || "no-size"}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} x {item.quantity}
                      {item.size && ` (${item.size.name})`}
                    </span>
                    <span className="font-medium">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Shipping Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Nigeria">Nigeria</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Payment Method
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="paystack"
                  name="payment_method"
                  value="paystack"
                  checked
                  readOnly
                  className="text-blue-600"
                />
                <label
                  htmlFor="paystack"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Pay with Paystack (Card, Bank Transfer, USSD)
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={checkoutMutation.isPending}
                className="flex-1 px-6 py-3 bg-primary-dark-pink text-white rounded-lg hover:bg-primary-text-dark-pink cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₦${totalAmount.toLocaleString()}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
