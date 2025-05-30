"use client"
import axiosInstance from "../axios";

const getUserPoints = async () => {
    const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/points`, {},
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${document.cookie.split("token=")[1].split(";")[0]}`
            }
        });
    if (res.status === 200) {
        return res.data;
    } else {
        return null;
    }
};
export default getUserPoints;
