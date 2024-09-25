"use client"
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getToken } from '@/utils/cookie.get';

const OtherTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const token = getToken();

    useEffect(() => {
        const fetchTransactions = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/wallet/transactions/other`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            setTransactions(data.data.slice(0, 5));
        };

        fetchTransactions();
    }, [token]);

    return (
        <>
            {transactions && transactions.length > 0 && (
                <>
                    <h2 className="text-xl font-semibold mt-10 mb-10 dark:text-white">Other Transactions</h2>
                    <div className="grid gap-4">
                        {transactions.map((transaction: any, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl">
                                <div className="flex justify-between items-center p-2">
                                    <div>
                                        <p className={`text-sm font-semibold ${transaction.transaction_type === "credit" ? "text-green-600" : "text-red-500"}`}>{transaction.transaction_message}</p>
                                        <div className="flex items-center gap-3">
                                            <small className="text-xs">{new Date(transaction.created_at).toLocaleDateString("en-US", {
                                                hour: "numeric",
                                                minute: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}</small>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-semibold flex items-center gap-3 ${transaction.transaction_type === "credit" ? "text-green-600" : "text-red-500"}`}>
                                        {transaction.amount}
                                        <Image width={20} height={20} className="w-auto h-5 aspect-square" src="/site/coin.svg" alt="coin" />
                                    </p>
                                </div>
                                {transaction.transaction_type === "credit" ? "+" : "-"}
                            </div>
                        ))}
                    </div>
                    <Link href="/transactions/others" className="text-blue-500 font-medium capitalize inline-block py-4">VIEW ALL</Link>
                </>
            )}
        </>
    );
};

export default OtherTransactions;
