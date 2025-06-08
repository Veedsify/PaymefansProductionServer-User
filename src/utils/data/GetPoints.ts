import axiosInstance from "../Axios";

const getAllPoints = async () => {
    return await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/points/global`,
    ).then((res) => {
        return res.data.allPoints;
    }).catch((err) => {
        return err;
    });
};

export default getAllPoints;
