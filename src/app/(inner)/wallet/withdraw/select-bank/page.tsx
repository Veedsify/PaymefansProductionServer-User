"use client";
import { useWithdrawStore } from "@/contexts/withdraw-context";
import { getToken } from "@/utils/cookie.get";
import { LucideBuilding2, LucideLoader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";

// Define interfaces for better type safety
interface MyBank {
  id: number;
  bank_name: string;
  account_number: string;
  bank_country: string;
  bank_type: string;
  account_name: string;
}

// Memoized BankCard component to prevent unnecessary re-renders
const BankCard = ({
  bank,
  onSelect,
}: {
  bank: MyBank;
  onSelect: (id: number) => void;
}) => {
  return (
    <li>
      <button
        onClick={() => onSelect(bank.id)}
        className="w-full flex flex-col items-start p-4 border border-gray-200 rounded-lg hover:border-primary-dark-pink transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark-pink cursor-pointer"
      >
        <span className="font-medium text-primary-dark-pink">
          {bank.bank_name}
        </span>
        <span className="text-sm text-gray-600">
          {bank.account_name} • {bank.account_number}
        </span>
        <span className="text-xs text-gray-400">{bank.bank_country}</span>
      </button>
    </li>
  );
};

export default function ConfirmWithdrawPage() {
  const { withdrawValues, setWithDrawStore } = useWithdrawStore();
  const [banks, setBanks] = useState<MyBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const token = useMemo(() => getToken(), []); // Memoize token to prevent repeated calls

  const getBanks = useCallback(async () => {
    if (!token) {
      setError("Authentication token missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/wallet/banks`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store", // Ensure fresh data
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setBanks(data.data || []);
    } catch (error) {
      console.error("Error fetching banks:", error);
      setError("Failed to load banks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Handle redirect logic in useEffect
  useEffect(() => {
    if (
      withdrawValues.platfromFee === 0 ||
      withdrawValues.amountToSettle === 0
    ) {
      router.push("/wallet/withdraw");
      return;
    }
    getBanks();
  }, [
    getBanks,
    router,
    withdrawValues.platfromFee,
    withdrawValues.amountToSettle,
  ]);

  // Memoized callback to prevent re-creation
  const handleBankConfirm = useCallback(
    (id: number) => {
      setWithDrawStore({
        ...withdrawValues,
        userBank: banks.find((bank) => bank.id === id) ?? null,
      });
      router.push("/wallet/withdraw/confirm");
    },
    [router, setWithDrawStore, withdrawValues, banks]
  );

  // Early return if bank is already selected
  if (withdrawValues.userBank) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[20vh] px-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LucideLoader2 className="w-10 h-10 animate-spin text-primary-dark-pink" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-lg font-medium text-red-500">{error}</p>
          <button
            onClick={getBanks}
            className="mt-4 px-4 py-2 bg-primary-dark-pink text-white rounded-lg hover:bg-primary-dark-pink/80 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : banks.length > 0 ? (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Select a bank to withdraw to
          </h2>
          <ul className="space-y-3">
            {banks.map((bank) => (
              <BankCard
                key={bank.id}
                bank={bank}
                onSelect={handleBankConfirm}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center flex-col justify-center py-8">
          <p className="text-lg font-medium text-gray-500">
            No banks available.
          </p>
          <Link
            href="/wallet/add"
            className="mt-4 px-4 py-2 bg-primary-dark-pink text-white rounded-lg hover:bg-primary-dark-pink/80 transition-colors cursor-pointer flex items-center"
          >
            <LucideBuilding2 className="w-4 h-4 mr-2" />
            Add a bank
          </Link>
        </div>
      )}
    </div>
  );
}
