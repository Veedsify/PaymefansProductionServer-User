
import { cookies } from "next/headers";
import Image from "next/image";

const Transactions = async () => {
    const token = (await cookies()).get('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/wallet/transactions/other`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token?.value}`
        }
    })

    const transactions = await res.json()

    return (
        <div className="p-4 py-8">
            <div>
                <h2 className="text-2xl font-semibold mb-10">Other Transactions</h2>
                <div className="grid gap-4">
                    {transactions.data.map((transaction: any, i: number) => (
                        <div key={i} className="bg-white  dark:bg-gray-950 dark:border dark:border-slate-800 px-2  rounded-xl">
                            <div className="flex justify-between items-center py-2">
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
                                    {transaction.transaction_type === "credit" ? "+" : "-"}
                                    {transaction.amount}
                                    <Image width={20} height={20} className="w-auto h-5 aspect-square" src="/site/coin.svg"
                                        alt="coin" />
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Transactions;
