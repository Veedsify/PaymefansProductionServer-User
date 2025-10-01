import axios, { type AxiosResponse } from "axios";
import axiosInstance from "../Axios";

const FetchUserSubscriptions = async (url: string) => {
  let response: Promise<AxiosResponse<any, any>>;
  return axiosInstance.get(url);
};

export default FetchUserSubscriptions;
