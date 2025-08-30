import axios from "axios";
import axiosInstance from "../Axios";

export const getHelpCategories = async () => {
  const response = await axiosInstance.get(`/help/categories`);
  return response.data.data;
};
