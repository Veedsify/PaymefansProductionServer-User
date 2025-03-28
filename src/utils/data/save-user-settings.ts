import { getToken } from "../cookie.get";

export async function saveUserSettings(userData: any) {
    const token = getToken();
    return fetch(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/settings/update`, {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
}
