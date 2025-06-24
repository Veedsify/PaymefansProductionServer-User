"use client";
import { useConfigContext } from "@/contexts/ConfigContext";
import { useWithdrawStore } from "@/contexts/WithDrawContext";
import { LucideDollarSign, LucideLoader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import swal from "sweetalert";
import VerifyWithdrawalPin from "@/components/sub_components/VerifyWithdrawalPin";
import { useUserAuthContext } from "@/lib/UserUseContext";
import axios from "axios";
import { getToken } from "@/utils/Cookie";

const WithdrawConfigPage = () => {
  const [loading, setLoading] = React.useState(true);
  const { user } = useUserAuthContext();
  const { withdrawValues, clearWithdrawStore } = useWithdrawStore();
  const [pinModal, setPinModal] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [processing, setProcessing] = React.useState(false);
  const [step, setStep] = React.useState<"create" | "verify">(user?.hasPin ? "verify" : "create");
  const { config } = useConfigContext();
  const router = useRouter();

  // Clear error when component state changes
  const clearError = useCallback(() => setError(""), []);

  // Validate PIN format
  const isValidPin = useCallback((pin: string): boolean => {
    return pin.length === 4 && !isNaN(parseInt(pin));
  }, []);

  useEffect(() => {
    if (withdrawValues && withdrawValues?.amountInNgn === 0) {
      router.push("/wallet/withdraw");
    }
    setLoading(false);
  }, [withdrawValues, router]);

  // Update step when user PIN status changes
  useEffect(() => {
    setStep(user?.hasPin ? "verify" : "create");
  }, [user?.hasPin]);

  const amountInNgn = Number(withdrawValues?.amountInNgn).toLocaleString();
  const amountToSettle = Number(withdrawValues?.amountToSettle).toLocaleString();
  // Fixed typo: platformFee instead of platfromFee
  const platformFee = Number(withdrawValues?.platformFee).toLocaleString();
  const userBank = withdrawValues?.userBank;
  const userBankName = userBank?.bank_name || "N/A";
  const userAccountNumber = userBank?.account_number || "N/A";

  const togglePinModal = () => {
    clearError(); // Clear error when opening/closing modal
    setPinModal(!pinModal);
  };

  const handleWithdraw = async ({ action, pin }: { action: "create" | "verify"; pin: string }) => {
    const token = getToken();
    clearError();

    // Consolidated validation
    if (!isValidPin(pin)) {
      setError("Please enter a valid 4-digit PIN");
      return;
    }

    if (isNaN(withdrawValues?.amountInNgn) || withdrawValues?.amountInNgn <= 0) {
      setError("Invalid withdrawal amount");
      return;
    }

    try {
      setProcessing(true);
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/withdraw/confirm`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        data: JSON.stringify({
          userId: user?.id,
          pin,
          action,
          amount: withdrawValues?.amountInNgn,
          bankId: withdrawValues?.userBank?.id,
        }),
      });

      if (response.data.error) {
        setError(response.data.message);
        setProcessing(false);
        return;
      }

      await swal({
        title: "Success",
        text: response.data.message,
        icon: "success",
        buttons: ["Cancel", "Go to Wallet"],
        dangerMode: false,
        closeOnClickOutside: false,
      }).then((willConfirm) => {
        if (willConfirm) {
          // Use Next.js router instead of window.location for better SPA behavior
          clearWithdrawStore();
          router.refresh();
          router.push("/wallet/history");
        }
      });

    } catch (error: any) {
      console.error("Withdrawal error:", error);
      // Improved error handling with optional chaining
      const errorMessage = error.response?.data?.message || error.message || "An error occurred, please try again";
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const setPinValue = async (val: string) => {
    if (!isValidPin(val)) {
      setError("Please enter a valid 4-digit PIN");
      return;
    }

    setPinModal(false);
    await handleWithdraw({ action: "verify", pin: val });
  };

  const handleCreatePin = async (pin: string) => {
    if (!isValidPin(pin)) {
      setError("Please enter a valid 4-digit PIN");
      return;
    }

    setPinModal(false);
    await handleWithdraw({ action: "create", pin });
  };

  const cancelWithdraw = async () => {
    await swal({
      title: "Are you sure?",
      text: "Your withdrawal request will be canceled.",
      icon: "warning",
      buttons: ["No", "Yes, cancel it!"],
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        clearWithdrawStore();
        router.push("/wallet");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-primary-50">
        <LucideLoader2 className="w-16 h-16 text-primary-dark-pink animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-dvh bg-primary-50 px-8">
        <div className="mb-6 flex justify-center">
          <LucideDollarSign className="w-16 h-16 text-primary-dark-pink" />
        </div>
        <h2 className="text-3xl font-bold mb-6 text-primary-900 text-center">
          Confirm Withdrawal
        </h2>
        <p className="mb-8 text-center dark:text-white max-w-lg">
          Your withdrawal request is pending confirmation. Please review the
          details below before proceeding.
        </p>
        <div className="w-full max-w-lg mb-8">
          <div className="flex justify-between py-4 border-b border-black/30">
            <span className="font-medium text-primary-dark-pink">Amount:</span>
            <span className="text-primary-900 font-semibold text-lg">
              {config?.default_symbol}
              {amountInNgn}
            </span>
          </div>
          <div className="flex justify-between py-4 border-b border-black/30">
            <span className="font-medium text-primary-dark-pink">
              To Account:
            </span>
            <span className="text-primary-900 font-semibold">
              {userBankName} ({userAccountNumber})
            </span>
          </div>
          <div className="flex justify-between py-4 border-b border-black/30">
            <span className="font-medium text-primary-dark-pink">Fee:</span>
            <span className="text-primary-900 font-semibold">
              {config?.default_symbol}
              {platformFee}
            </span>
          </div>
          <div className="flex justify-between py-4 border-b border-black/30">
            <span className="font-medium text-primary-dark-pink">
              Amount to Receive:
            </span>
            <span className="text-primary-900 font-semibold text-lg">
              {config?.default_symbol}
              {amountToSettle}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-lg">
          <div>
            {error && (
              <p className="text-red-500 text-center mt-2 h-5 text-sm">
                {error}
              </p>
            )}
          </div>
          <button
            onClick={togglePinModal}
            className="w-full bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white font-bold py-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            type="button"
            disabled={processing}
          >
            {processing ? (
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LucideLoader2 className="w-5 h-5 animate-spin" />
              </motion.div>
            ) : (
              "Confirm Withdrawal"
            )}
          </button>
          <button
            onClick={cancelWithdraw}
            className="w-full bg-primary-100 hover:bg-primary-200 text-primary-800 font-bold py-3 rounded-lg transition"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
      {pinModal && (
        <VerifyWithdrawalPin
          mode={step}
          onVerify={setPinValue}
          onClose={togglePinModal}
          onCreate={handleCreatePin}
          onForgotPin={() => { /* forgot pin logic */ }}
        />
      )}
    </>
  );
};

export default WithdrawConfigPage;
