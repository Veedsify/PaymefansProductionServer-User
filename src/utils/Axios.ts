import axios from "axios";
import type { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TS_EXPRESS_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL
          }/auth/token/refresh`, {}, { withCredentials: true });
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;