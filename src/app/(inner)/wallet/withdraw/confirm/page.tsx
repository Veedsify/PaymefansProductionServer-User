"use client";
import { useConfigContext } from "@/contexts/configs-context";
import { useWithdrawStore } from "@/contexts/withdraw-context";
import { LucideDollarSign, LucideLoader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import swal from "sweetalert";
import VerifyWithdrawalPin from "@/components/sub_components/verify-withdrawal-pin";
import { useUserAuthContext } from "@/lib/userUseContext";
import axios from "axios";

const WithdrawConfirmPage = () => {
  const [loading, setLoading] = React.useState(true);
  const { user } = useUserAuthContext();
  const { withdrawValues, clearWithdrawStore } = useWithdrawStore();
  const [pinModal, setPinModal] = React.useState(false);
  const [pin, setPin] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [processing, setProcessing] = React.useState(false);
  const [step, setStep] = React.useState<"create" | "verify">(user?.Settings?.hasPin ? "verify" : "create");
  const { config } = useConfigContext();
  const router = useRouter();
  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (withdrawValues && withdrawValues?.amountInNgn === 0) {
      router.push("/wallet/withdraw");
    }
  }, [withdrawValues, router]);

  const amountInNgn = Number(withdrawValues?.amountInNgn).toLocaleString();
  const amountToSettle = Number(
    withdrawValues?.amountToSettle
  ).toLocaleString();
  const platformFee = Number(withdrawValues?.platfromFee).toLocaleString();
  const userBank = withdrawValues?.userBank;
  const userBankName = userBank?.bank_name || "N/A";
  const userAccountNumber = userBank?.account_number || "N/A";

  const togglePinModal = () => {
    setPinModal(!pinModal);
  };

  const handleWithdraw = async ({ action }: { action: "create" | "verify" }) => {
    if (pin.length !== 4) {
      setError("Please enter a valid PIN");
      return;
    }

    try {
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/withdraw/confirm`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      swal({
        title: "Success",
        text: response.data.message,
        icon: "success",
        buttons: ['OK'],
      }).then(() => {
        clearWithdrawStore();
        router.push("/wallet");
      });

    } catch (error: any) {
      console.error("Error:", error);
      setError(error.response.data.message || error.message || "An error occurred, please try again.");
    } finally {
      setProcessing(false);
      setPin("");
    }
  }

  const setPinValue = (val: string) => {
    if (val.length === 4) {
      setPin(val);
      setPinModal(false);
      setProcessing(true);
      handleWithdraw({ action: "verify" });
    } else {
      setError("Please enter a valid PIN");
    }
  };

  const handleCreatePin = async (pin: string) => {
    if (pin.length !== 4) {
      setError("Please enter a valid PIN");
      return;
    }
    setPin(pin);
    setPinModal(false);
    setProcessing(true);
    handleWithdraw({ action: "create" });
  }

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
        {/* Placeholder for SVG or image */}
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
          <div className="flex justify-between py-4  border-b border-black/30">
            <span className="font-medium text-primary-dark-pink">Fee:</span>
            <span className="text-primary-900 font-semibold">
              {config?.default_symbol}
              {platformFee}
            </span>
          </div>
          <div className="flex justify-between py-4 border-b border-black/30">
            <span className="font-medium text-primary-dark-pink">
              Amount to Settle:
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
      {pinModal &&
        <VerifyWithdrawalPin mode={step}
          onVerify={setPinValue}
          onClose={togglePinModal}
          onCreate={handleCreatePin}
          onForgotPin={() => { /* forgot pin logic */ }}
        />}
    </>
  );
};

export default WithdrawConfirmPage;
