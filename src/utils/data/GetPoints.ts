import axios from "axios";
import axiosInstance from "../Axios";
const API_URL = process.env.NEXT_PUBLIC_TS_EXPRESS_URL;
const getAllPoints = async () => {
    return await axios.get(
        `${API_URL}/points/global`,
    ).then((res) => {
        return res.data.allPoints;
    }).catch((err) => {
        return err;
    });
};

export default getAllPoints;
