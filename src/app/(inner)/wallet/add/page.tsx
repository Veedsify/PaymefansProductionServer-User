"use client"
import { getToken } from "@/utils/cookie.get";
import { LucideLoader, LucideTrash, LucideTrash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import swal from "sweetalert";

interface BankData {
    slug: string
    name: string
    code: string
}

const WalletAddBank = () => {
    let [banks, setBanks] = useState<BankData[]>([])
    let [loading, setLoading] = useState<boolean>(false)
    let [name, setName] = useState<string>("")
    let [accountNumber, setAccountNumber] = useState<string>("")
    let [selectedBank, setSelectedBank] = useState<string>("")
    const token = getToken()

    useEffect(() => {
        const validateBannk = (accountNumber: string, selectedBank: string) => {
            if (accountNumber.length === 10 && selectedBank) {
                setLoading(true)
                setName("")
                const verify = async () => {
                    const res = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${selectedBank}`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`
                        }
                    })
                    const data = await res.json()
                    if (data.status === false) {
                        setLoading(false)
                        swal("Error", data.message, "error")
                    } else {
                        setLoading(false)
                        setName(data.data.account_name)
                    }
                }
                verify()
            } else {
                setName("")
            }
        }
        validateBannk(accountNumber, selectedBank)
    }, [accountNumber, selectedBank])


    useEffect(() => {
        const getBanks = async () => {
            const res = await fetch("https://api.paystack.co/bank", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`
                }
            })
            const data = await res.json()
            setBanks(data.data)
        }
        getBanks()
    }, [])

    const handleAddAccount = async () => {
        if (accountNumber.length !== 10) {
            swal("Error", "Account number must be 10 digits", "error")
            return
        }

        if (!selectedBank) {
            swal("Error", "Select a bank", "error")
            return
        }

        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/banks/add`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` || ""
                },
                body: JSON.stringify({
                    accountNumber,
                    bankCode: selectedBank,
                    accountName: name,
                    otherDetails: banks.find(bank => bank.code === selectedBank)
                })
            })

            const data = await res.json()
            if (data.status === true) {
                swal("Success", data.message, "success").then(res => {
                    if (res) window.location.reload()
                })
            } else {
                swal("Error", data.message, "error")
            }
        } catch (e: any) {
            swal("Error", "An error occured", "error")
        }
    }

    return (
        <div className="p-4 py-8">
            <div className="flex items-center mb-7 lg:hidden">
                <span className="font-bold text-xl flex-shrink-0 ">Add Withdrawal Bank</span>
            </div>
            <div>
                <input type="text" placeholder="Account Number"
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="border p-4 mt-4 w-full rounded-lg pl-5 outline-none" maxLength={10} />
                <select
                    onChange={(e) => setSelectedBank(e.target.value)}
                    defaultValue="1"
                    className="border p-4 mt-4 w-full rounded-lg pl-5 outline-none text-black cursor-pointer" >
                    <option label="Select Bank" value={1} disabled></option>
                    {
                        banks.map((bank, index) => {
                            return (
                                <option key={index} value={bank.code}>{bank.name}</option>
                            )
                        })
                    }
                </select>
                <div className="flex items-center gap-2 mt-3">
                    {loading && <LucideLoader className="animate-spin" />}
                    {(name && !loading) && <span className="font-bold pl-3">{name}</span>}
                </div>
                <div className="py-5">
                    <button
                        onClick={handleAddAccount}
                        disabled={loading || !name}
                        className={"w-full bg-primary-dark-pink py-4 text-white font-bold rounded-lg disabled:opacity-70 disabled:bg-gray-300"}
                    >
                        Set Bank Account
                    </button>
                </div>
            </div>
            {/* SAVED BANKS */}
            <SavedBanks />
        </div>
    );
}

interface MyBanks {
    bank_name: string
    account_number: string
    account_name: string
}
const SavedBanks = () => {
    const [banks, setBanks] = useState<MyBanks[]>([])
    useEffect(() => {
        const getBanks = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/banks`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}` || ""
                }
            })
            const data = await res.json()
            setBanks(data.data)
        }
        getBanks()
    }, [])

    const deleteAccount = (accountNumber: string) => async () => {
        async function deleteBank() {
            return await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/banks/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}` || ""
                },
                body: JSON.stringify({ accountNumber })
            })
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
                const res = await deleteBank()
                const data = await res.json()
                if (data.status === true) {
                    swal("Success", data.message, "success").then(res => {
                        if (res) window.location.reload()
                    })
                } else {
                    swal("Error", data.message, "error")
                }
            }
        })
    }

    return (banks && banks.length > 0) ? (
        <div className="mt-3">
            <h2 className="font-bold text-xl mb-3 mt-6">Saved Bank Accounts</h2>
            <table className="w-full table-auto" border={1}>
                <thead>
                    <tr>
                        <th className="text-left border p-2">S/N</th>
                        <th className="text-left border p-2">Bank</th>
                        <th className="text-left border p-2">Account Number</th>
                        <th className="text-left border p-2">Account Name</th>
                        <th className="text-left border p-2">
                            <span className="hidden lg:block">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {banks.map((bank, index) => (
                        <tr key={index}>
                            <td className="border p-2">{index + 1}</td>
                            <td className="border p-2">{bank.bank_name}</td>
                            <td className="border p-2">{bank.account_number}</td>
                            <td className="border p-2">{bank.account_name}</td>
                            <td className="border p-2">
                                <button
                                    onClick={deleteAccount(bank.account_number)}
                                    className="bg-red-500 p-2 rounded">
                                    <LucideTrash2 size={20} stroke="#fff" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (<React.Fragment >
    </React.Fragment>)
}

export default WalletAddBank;