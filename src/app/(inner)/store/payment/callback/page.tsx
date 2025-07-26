"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useVerifyPayment } from "@/hooks/useCheckout";
import Link from "next/link";
import toast from "react-hot-toast";

const PaymentCallback = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    localStorage.getItem("pendingOrderReference") ||
    "";

  const {
    data: verificationData,
    isLoading: isVerifying,
    error: verificationError,
  } = useVerifyPayment(reference);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("Invalid payment reference. Please try again.");
      toast.error("Invalid payment reference");
      return;
    }

    // Get stored order info
    const storedOrderId = localStorage.getItem("pendingOrderId");
    if (storedOrderId) {
      setOrderId(storedOrderId);
    }

    if (verificationData) {
      if (verificationData.error) {
        setStatus("error");
        setMessage(verificationData.message || "Payment verification failed");
        toast.error(verificationData.message || "Payment failed");

        // Clean up localStorage on error
        localStorage.removeItem("pendingOrderReference");
        localStorage.removeItem("pendingOrderId");
      } else {
        setStatus("success");
        setMessage("Payment successful! Your order has been confirmed.");
        const orderInfo = verificationData.data?.order || {};
        setOrderId(verificationData.data?.order_id || storedOrderId || "");
        setTotalAmount(orderInfo.total_amount || 0);

        toast.success("Payment successful! Order confirmed.");

        // Clean up localStorage on success
        localStorage.removeItem("pendingOrderReference");
        localStorage.removeItem("pendingOrderId");
      }
    }

    if (verificationError) {
      setStatus("error");
      setMessage(
        (verificationError as any)?.response?.data?.message ||
          "Payment verification failed",
      );
      toast.error("Payment verification failed");

      // Clean up localStorage on error
      localStorage.removeItem("pendingOrderReference");
      localStorage.removeItem("pendingOrderId");
    }
  }, [reference, verificationData, verificationError]);

  // Cleanup localStorage when component unmounts
  useEffect(() => {
    return () => {
      // Only cleanup if we're leaving due to navigation, not refresh
      const isNavigating =
        !window.location.pathname.includes("/payment/callback");
      if (isNavigating && status !== "success") {
        localStorage.removeItem("pendingOrderReference");
        localStorage.removeItem("pendingOrderId");
      }
    };
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Please wait while we confirm your payment...
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order ID: <span className="font-mono">{orderId}</span>
              </p>
            )}
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
              {orderId && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Order ID:{" "}
                  <span className="font-mono font-semibold">{orderId}</span>
                </p>
              )}
              {totalAmount > 0 && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Amount Paid:{" "}
                  <span className="font-semibold">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You will receive an email confirmation shortly.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/store/orders"
                className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                View My Orders
              </Link>
              <Link
                href="/store"
                className="block w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Failed
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {message}
              </p>
              {orderId && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reference: <span className="font-mono">{orderId}</span>
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                If you were charged, the amount will be refunded within 3-5
                business days.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/store"
                className="block w-full bg-primary-dark-pink text-white py-3 px-4 rounded-lg hover:bg-primary-text-dark-pink transition-colors font-medium"
              >
                Try Again
              </Link>
              <Link
                href="/support"
                className="block w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Contact Support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
