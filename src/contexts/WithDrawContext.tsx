import { create } from "zustand";

interface UserBank {
  id: number;
  bank_name: string;
  account_number: string;
  bank_country: string;
  bank_type: string;
  account_name: string;
}
type WithdrawValuesProps = {
  platformFee: number;
  amountToSettle: number;
  amountInUsd: number;
  amountInNgn: number;
  localCurrency: string;
  userBank: UserBank | null;
};

type WithdrawStore = {
  withdrawValues: WithdrawValuesProps;
  setWithDrawStore: (data: WithdrawValuesProps) => void;
  clearWithdrawStore: () => void;
};

export const useWithdrawStore = create<WithdrawStore>((set) => ({
  withdrawValues: {
    platformFee: 0,
    amountToSettle: 0,
    amountInUsd: 0,
    amountInNgn: 0,
    localCurrency: "",
    userBank: null,
  },
  clearWithdrawStore: () =>
    set(() => ({
      withdrawValues: {
        platformFee: 0,
        amountToSettle: 0,
        amountInUsd: 0,
        amountInNgn: 0,
        localCurrency: "",
        userBank: null,
      },
    })),
  setWithDrawStore: (data) => set(() => ({ withdrawValues: data })),
}));
