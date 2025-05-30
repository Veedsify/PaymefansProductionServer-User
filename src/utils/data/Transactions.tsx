import axios from "axios";
export const getTransactionsData = async (token: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/wallet/transactions`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
