import axios from "axios";
import { getToken } from "../cookie.get";

const getTransactionsData = async () => {
  try {
    const token = getToken();
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

export default getTransactionsData;
