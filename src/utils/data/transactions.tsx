import axios from "axios";
import { cookies } from "next/headers";

const getTransactionsData = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/wallet/transactions`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookies().get("token")?.value}`
        }
    })

    return res.data

}

export default getTransactionsData;