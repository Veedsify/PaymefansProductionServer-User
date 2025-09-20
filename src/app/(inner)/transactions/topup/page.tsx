import { cookies } from "next/headers";
import Image from "next/image";
import { getTransactionsData } from "@/utils/data/Transactions";

const Transactions = async () => {
  const token = (await cookies()).get("token")?.value;
  const { data: transactions } = await getTransactionsData(token as string);
  if (!transactions) {
    return (
      <div className="p-4 py-8 dark:text-white">
        <div>
          <h2 className="mb-10 text-2xl font-semibold">Transactions</h2>
          <div className="grid gap-4">
            <div className="px-2 bg-white dark:bg-gray-950 dark:border dark:border-slate-800  rounded-xl">
              <p className="text-sm font-semibold text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 py-8 dark:text-white">
      <div>
        <h2 className="mb-10 text-2xl font-semibold">Transactions</h2>
        <div className="grid gap-4">
          {transactions.map((transaction: any, i: number) => (
            <div
              key={i}
              className="px-2 bg-white dark:bg-gray-950 dark:border dark:border-slate-800  rounded-xl"
            >
              <div className="flex items-center justify-between py-2">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      transaction.success ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {transaction.success
                      ? "Transaction Successful"
                      : "Transaction Failed"}
                  </p>
                  <div className="flex items-center gap-3">
                    <small className="text-xs">
                      {new Date(transaction.created_at).toLocaleDateString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "numeric",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </small>
                  </div>
                </div>
                <p
                  className={`text-sm font-semibold flex items-center gap-3 ${
                    transaction.success ? "text-green-600" : "text-red-500"
                  }`}
                >
                  +{transaction.points}
                  <Image
                    width={20}
                    height={20}
                    className="w-5 h-5 aspect-square"
                    src="/site/coin.svg"
                    alt=""
                  />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
