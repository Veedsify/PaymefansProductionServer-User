import axios from "axios";

export const modelSignUp = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/models/signup`, data, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${document.cookie.split("token=")[1].split(";")[0]}`
        },
    });
    return response;
}
