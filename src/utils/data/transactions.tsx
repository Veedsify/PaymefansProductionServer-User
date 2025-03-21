import axios from "axios";
import { cookies } from "next/headers";

const getTransactionsData = async () => {
  try {
    const token = (await cookies()).get("token");
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/wallet/transactions`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.value}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export default getTransactionsData;
