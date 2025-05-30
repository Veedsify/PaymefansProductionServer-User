import axios from "axios";
import { getToken } from "../Cookie";

export const updateHookupData = async ({ hookup }: { hookup: boolean }) => {
    const token = getToken();
    const response = axios.post(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/settings/update/hookup-status`, { hookup },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

    return response
}
