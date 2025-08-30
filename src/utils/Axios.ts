import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

// Define types for better type safety
interface RetryRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TS_EXPRESS_URL,
  withCredentials: true,
});

// Response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig;

    // Check if we should attempt token refresh
    if (
      error.response?.status === 403 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Use the same axios instance for token refresh
        await axiosInstance.post("/auth/token/refresh");
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Redirect to login on refresh failure
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
