import axios from "axios";

export const modelSignUp = async (data: any) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/models/signup`,data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${document.cookie.split("token=")[1].split(";")[0]}`
            },
        });
        return response.data;
    } catch (err: any) {
        console.log(err.message || err.data.message);
    }
}
