import axios from "axios";
import axiosInstance from "../Axios";

const getAllPoints = async () => {
    return await axiosInstance.get(
        `/points/global`,
    ).then((res) => {
        return res.data.allPoints;
    }).catch((err) => {
        throw new Error(err);
    });
};

export default getAllPoints;
