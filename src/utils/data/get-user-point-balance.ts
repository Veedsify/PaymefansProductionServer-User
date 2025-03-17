import axiosInstance from "../axios"

export const GetUserPointBalance = async (user_id: number) => {
    return await axiosInstance.post(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/points/get-points`,
        { user_id }
        , {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${document.cookie.split("token=")[1].split(";")[0]}`
            }
        })
}
