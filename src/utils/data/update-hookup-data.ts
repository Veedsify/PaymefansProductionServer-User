import axios from "axios";
import { getToken } from "../cookie.get";

export const updateHookupData = async ({ hookup }: { hookup: boolean }) => {
    const token = getToken();
    const response = axios.post(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/profile/settings/update/hookup-status`, { hookup },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

    return response
}