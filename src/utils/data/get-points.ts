import axiosInstance from "../axios";

const getAllPoints = async () => {
    return await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_EXPRESS_URL}/global/points`,
    ).then((res) => {
        return res.data.allPoints;
    }).catch((err) => {
        return err;
    });
};

export default getAllPoints;
