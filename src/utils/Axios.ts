import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TS_EXPRESS_URL, // Set your base URL here
  withCredentials: true, // Enable sending cookies with requests
});

export default axiosInstance;
