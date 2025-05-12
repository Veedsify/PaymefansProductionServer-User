"use client";
import { useConfigContext } from "@/contexts/configs-context";
import { useWithdrawStore } from "@/contexts/withdraw-context";
import { LucideBanknote } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import swal from "sweetalert";

const WithdrawConfirmPage = () => {
  const [loading, setLoading] = React.useState(true);
  const { withdrawValues, clearWithdrawStore } = useWithdrawStore();
  const { config } = useConfigContext();
  const router = useRouter();
  useEffect(() => {
    setLoading(false);
  }, []);

  if (withdrawValues && withdrawValues?.amountInNgn === 0) {
    router.push("/wallet/withdraw");
  }

  const amountInNgn = Number(withdrawValues?.amountInNgn).toLocaleString();
  const amountToSettle = Number(
    withdrawValues?.amountToSettle
  ).toLocaleString();
  const platfromFee = Number(withdrawValues?.platfromFee).toLocaleString();
  const userBank = withdrawValues?.userBank;
  const userBankName = userBank?.bank_name || "N/A";
  const userAccountNumber = userBank?.account_number || "N/A";

  const cancelWithdraw = () => {
    swal({
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
      <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <LucideBanknote className="w-16 h-16 text-primary-dark-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary-50 px-4">
      {/* Placeholder for SVG or image */}
      <div className="mb-6 flex justify-center">
        <LucideBanknote className="w-16 h-16 text-primary-dark-pink" />
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
            {platfromFee}
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
        <button
          className="w-full bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white font-bold py-3 rounded-lg transition cursor-pointer"
          type="button"
        >
          Confirm Withdrawal
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
  );
};

export default WithdrawConfirmPage;
