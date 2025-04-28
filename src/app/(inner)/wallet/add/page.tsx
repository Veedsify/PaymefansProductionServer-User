"use client";
import { getToken } from "@/utils/cookie.get";
import { LucideLoader, LucideTrash2 } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import swal from "sweetalert";
import {
  acceptedBankCountries,
  acceptedBankTypes,
} from "@/utils/data/accepted-bank-countries";
import CountrySelector from "@/components/sub_components/country-selector";

interface BankData {
  slug: string;
  name: string;
  code: string;
}

const WalletAddBank = () => {
  let [banks, setBanks] = useState<BankData[]>([]);
  let [loading, setLoading] = useState<boolean>(false);
  let [name, setName] = useState<string>("");
  let [accountNumber, setAccountNumber] = useState<string>("");
  let [selectedBank, setSelectedBank] = useState<string>("");
  let [bankType, setBankType] = useState<string>("");
  let [selectCountry, setSelectCountry] =
    useState<keyof typeof acceptedBankTypes>();
  const token = getToken();

  const SelectCountry = useCallback(
    (name: keyof typeof acceptedBankTypes, bankType: string) => {
      setSelectCountry(name);
    },
    []
  );

  useEffect(() => {
    const validateBannk = (accountNumber: string, selectedBank: string) => {
      if (accountNumber.length >= 10 && selectedBank) {
        setLoading(true);
        setName("");
        const verify = async () => {
          const res = await fetch(
            `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${selectedBank}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
              },
            }
          );
          const data = await res.json();
          if (data.status === false) {
            setLoading(false);
            swal("Error", data.message, "error");
          } else {
            setLoading(false);
            setName(data.data.account_name);
          }
        };
        verify();
      } else {
        setName("");
      }
    };
    if (accountNumber && selectedBank) {
      validateBannk(accountNumber, selectedBank);
    }
  }, [accountNumber, selectedBank]);

  useEffect(() => {
    const getBanks = async () => {
      const country = acceptedBankCountries.find(
        (country) => country.countryIso === selectCountry
      )?.name;
      const res = await fetch(
        `https://api.paystack.co/bank?country=${encodeURI(country as string)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
          },
        }
      );
      const data = await res.json();
      setBanks(data.data);
    };
    getBanks();
  }, [selectCountry, bankType]);

  const handleAddAccount = async () => {
    if (accountNumber.length < 10) {
      swal("Error", "Account number must be equal to 10 digits", "error");
      return;
    }

    if (!selectedBank) {
      swal("Error", "Select a bank", "error");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/wallet/banks/add`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` || "",
          },
          body: JSON.stringify({
            accountNumber,
            bankCode: selectedBank,
            accountName: name,
            country: acceptedBankCountries.find(
              (country) => country.countryIso === selectCountry
            )?.name,
            bankType,
            otherDetails: banks.find((bank) => bank.code === selectedBank),
          }),
        }
      );

      const data = await res.json();
      if (data.status === true) {
        swal("Success", data.message, "success").then((res) => {
          if (res) window.location.reload();
        });
      } else {
        swal("Error", data.message, "error");
      }
    } catch (e: any) {
      swal("Error", "An error occured", "error");
    }
  };

  if (!selectCountry) {
    return (
      <>
        <div className={"flex items-center justify-center p-4 md:p-8 flex-col"}>
          <h1 className={"md:text-2xl font-semibold leading-tight mb-4"}>
            Select a country
          </h1>
          <CountrySelector
            acceptedBankCountries={acceptedBankCountries}
            onCountryChange={SelectCountry}
          />
          <div className="text-sm text-gray-500 mt-2">
            <h2 className="font-bold text-lg mb-3 mt-6">Other Countries</h2>
          </div>
        </div>
        <div className="p-4 md:p-8">
          <SavedBanks />
        </div>
      </>
    );
  }

  if (!bankType || bankType === "") {
    return (
      <>
        <div className={"flex items-center justify-center p-4 md:p-8 flex-col"}>
          <h1 className={"md:text-2xl font-semibold leading-tight mb-6"}>
            Select a bank type
          </h1>
          <div className="flex items-center justify-center gap-4">
            {acceptedBankTypes[
              selectCountry as keyof typeof acceptedBankTypes
            ]?.map(
              (bank: {
                type: string;
                countryIso: string;
                image: string;
                name: string;
              }) => {
                return (
                  <button
                    key={bank.type}
                    onClick={() => setBankType(bank.type)}
                    className="flex flex-col items-center justify-center"
                  >
                    <span className="flex flex-col items-center justify-center p-3 rounded-full border-2 border-gray-200 hover:border-primary-dark-pink transition-colors mb-4 w-24 h-24 cursor-pointer">
                      <div className="rounded-full bg-gray-50">
                        <img
                          src={bank.image}
                          alt={bank.name}
                          className="w-16 h-16 rounded-full aspect-square object-cover"
                        />
                      </div>
                    </span>
                    <span className="text-gray-600 text-center font-bold">
                      {bank.name}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="p-4 py-8">
      <div className="flex items-center mb-7 lg:hidden">
        <span className="font-bold text-xl flex-shrink-0 ">
          Add Withdrawal Bank
        </span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="font-bold text-xl flex-shrink-0 ">
          Add Withdrawal Bank
        </span>
        <span className="text-sm text-gray-500">
          {
            acceptedBankCountries.find(
              (country) => country.countryIso === selectCountry
            )?.name
          }
        </span>
      </div>
      <div>
        <input
          type="text"
          placeholder="Account Number"
          onChange={(e) => setAccountNumber(e.target.value)}
          className="border p-4 mt-4 w-full rounded-lg pl-5 outline-none"
          maxLength={16}
        />
        <select
          onChange={(e) => setSelectedBank(e.target.value)}
          defaultValue="1"
          className="border p-4 mt-4 w-full rounded-lg pl-5 outline-none text-black cursor-pointer"
        >
          <option label="Select Bank" value={1} disabled></option>
          {banks.map((bank, index) => {
            return (
              <option key={index} value={bank.code}>
                {bank.name}
              </option>
            );
          })}
        </select>
        <div className="flex items-center gap-2 mt-3">
          {loading && <LucideLoader className="animate-spin" />}
          {name && !loading && <span className="font-bold pl-3">{name}</span>}
        </div>
        <div className="py-5">
          <button
            onClick={handleAddAccount}
            disabled={loading || !name}
            className={
              "w-full bg-primary-dark-pink py-4 text-white font-bold rounded-lg disabled:opacity-70 disabled:bg-gray-300"
            }
          >
            Set Bank Account
          </button>
        </div>
      </div>
      {/* SAVED BANKS */}
      <SavedBanks />
    </div>
  );
};

interface MyBanks {
  bank_name: string;
  account_number: string;
  bank_country: string;
  bank_type: string;
  account_name: string;
}

const SavedBanks = () => {
  const [banks, setBanks] = useState<MyBanks[]>([]);
  useEffect(() => {
    const getBanks = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/wallet/banks`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}` || "",
          },
        }
      );
      const data = await res.json();
      setBanks(data.data);
    };
    getBanks();
  }, []);

  const deleteAccount = (accountNumber: string) => async () => {
    async function deleteBank() {
      return await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/wallet/banks/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}` || "",
          },
          body: JSON.stringify({ accountNumber }),
        }
      );
    }

    swal({
      title: "Are you sure?",
      text: "Once deleted you will not be able to recover this account!",
      icon: "warning",
      buttons: {
        cancel: true,
        confirm: true,
      },
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        const res = await deleteBank();
        const data = await res.json();
        if (data.status === true) {
          swal("Success", data.message, "success").then((res) => {
            if (res) window.location.reload();
          });
        } else {
          swal("Error", data.message, "error");
        }
      }
    });
  };

  return banks && banks.length > 0 ? (
    <div className="mt-3">
      <h2 className="font-bold text-xl mb-6">Saved Bank Accounts</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                S/N
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                Bank
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                Account Number
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                Account Name
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                Bank Type
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                Country
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                <span className="hidden lg:block">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {banks.map((bank, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                  {bank.bank_name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                  {bank.account_number}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                  {bank.account_name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                  {bank.bank_type}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                  {bank.bank_country}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <button
                    onClick={deleteAccount(bank.account_number)}
                    className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <LucideTrash2 size={18} className="mr-1" />
                    <span className="hidden lg:inline">Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <React.Fragment></React.Fragment>
  );
};

export default WalletAddBank;
