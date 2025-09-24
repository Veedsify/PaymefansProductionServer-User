"use client";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useVerifyPayment } from "@/hooks/useCheckout";

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
    <div className="flex items-center justify-center min-h-dvh px-4 bg-white dark:bg-black">
      <div className="w-full max-w-md p-8 text-center bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Verifying Payment
            </h2>
            <p className="mb-2 text-gray-600 dark:text-gray-400">
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
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Payment Successful!
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">{message}</p>

            <div className="p-4 mb-6 rounded-lg bg-green-50 dark:bg-green-900/20">
              {orderId && (
                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
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
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                You will receive an email confirmation shortly.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/store/orders"
                className="block w-full px-4 py-3 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/store"
                className="block w-full px-4 py-3 font-medium text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Payment Failed
            </h2>
            <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
              {orderId && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reference: <span className="font-mono">{orderId}</span>
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                If you were charged, the amount will be refunded within 3-5
                business days.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/store"
                className="block w-full px-4 py-3 font-medium text-white rounded-lg bg-primary-dark-pink hover:bg-primary-text-dark-pink transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/support"
                className="block w-full px-4 py-3 font-medium text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
