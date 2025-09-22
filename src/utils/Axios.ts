"use client";
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import ERROR_STATUS from "@/constants/error_status";

// Define types for better type safety
interface RetryRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

if (!process.env.NEXT_PUBLIC_TS_EXPRESS_URL) {
  throw new Error("NEXT_PUBLIC_TS_EXPRESS_URL is not defined");
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TS_EXPRESS_URL as string,
  withCredentials: true,
});

// Global state to prevent multiple simultaneous token refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Custom error class to indicate auth failure that should set guest state
class AuthFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthFailureError";
  }
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig;

    // Only attempt token refresh for 401 errors on requests that haven't been retried
    if (
      originalRequest &&
      !originalRequest._retry &&
      error.response?.status === ERROR_STATUS["Unauthorized"]
    ) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/token/refresh");
        processQueue(null, "success");
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        const authFailure = new AuthFailureError(
          "Authentication failed - token refresh unsuccessful",
        );
        processQueue(authFailure, null);
        isRefreshing = false;

        // Token refresh failed - handle logout
        console.error("Token refresh failed:", refreshError);
      //   if (typeof window !== "undefined") {
      //     // Clear any stored auth data
      //     document.cookie =
      //       "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      //     // Only redirect if we're not already on login/signup pages
      //     const currentPath = window.location.pathname;
      //     if (
      //       !currentPath.includes("/login") &&
      //       !currentPath.includes("/signup")
      //     ) {
      //       // Don't redirect immediately - let UserContext handle guest state first
      //       setTimeout(() => {
      //         window.location.href = "/login";
      //       }, 100);
      //     }
      //   }

      //   // Return the custom error so UserContext can catch it and set guest state
      //   return Promise.reject(authFailure);
      // }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
export { AuthFailureError };
