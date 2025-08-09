import axios, { AxiosResponse } from "axios";
import axiosInstance from "../Axios";

const FetchUserSubscriptions = async (url: string) => {
  let response: Promise<AxiosResponse<any, any>>;
  response = axiosInstance.get(url);
  return response;
};

export default FetchUserSubscriptions;
