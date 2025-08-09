import axiosInstance from "../Axios";

const getAllPoints = async () => {
    return await axiosInstance.get(
        `/points/global`,
    ).then((res) => {
        return res.data.allPoints;
    }).catch((err) => {
        return err;
    });
};

export default getAllPoints;
