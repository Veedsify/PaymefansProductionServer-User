import { AxiosError } from "axios";
import { getToken } from "../Cookie";
import axiosInstance from "@/utils/Axios";

const API_URL = process.env.NEXT_PUBLIC_TS_EXPRESS_URL;

interface BlockUserResponse {
  status: boolean;
  message: string;
  error: boolean;
  blockId?: string;
}

interface UnblockUserResponse {
  status: boolean;
  message: string;
  error: boolean;
}

interface CheckBlockStatusResponse {
  status: boolean;
  isBlocked: boolean;
  blockId?: string;
  message?: string;
  error?: boolean;
}

interface GetBlockedUsersResponse {
  status: boolean;
  message: string;
  error: boolean;
  blockedUsers: Array<{
    user: {
      id: number;
      username: string;
      name: string;
      fullname: string;
      profile_image: string | null;
    } | null;
    blockId: string;
    created_at: string;
  }>;
  minmax: string;
}

// Block a user
export const blockUser = async (
  blockedId: number,
): Promise<BlockUserResponse> => {
  try {
    const response = await axiosInstance.post(`/block/block-user`, {
      blockedId,
    });

    const data = response.data;
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.data) {
        return {
          status: false,
          message: error.response.data.message || "Network error occurred",
          error: true,
        };
      }
    }
    return {
      status: false,
      message: "Network error occurred",
      error: true,
    };
  }
};

// Unblock a user
export const unblockUser = async (
  blockedId: number,
): Promise<UnblockUserResponse> => {
  try {
    const response = await axiosInstance.post(`/block/unblock-user`, {
      blockedId,
    });
    const data = response.data;
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.data) {
        return {
          status: false,
          message: error.response.data.message || "Network error occurred",
          error: true,
        };
      }
    }
    return {
      status: false,
      message: "Network error occurred",
      error: true,
    };
  }
};

// Check if user is blocked
export const checkBlockStatus = async (
  targetUserId: number,
): Promise<CheckBlockStatusResponse> => {
  try {
    const response = await axiosInstance.post(`/block/check-status`, {
      targetUserId,
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error checking block status:", error);
    return {
      status: false,
      isBlocked: false,
      message: "Network error occurred",
      error: true,
    };
  }
};

// Check if current user is blocked by another user
export const checkIfBlockedBy = async (
  targetUserId: number,
): Promise<CheckBlockStatusResponse> => {
  try {
    const response = await axiosInstance.post(`/block/check-blocked-by`, {
      targetUserId,
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error checking if blocked by user:", error);
    return {
      status: false,
      isBlocked: false,
      message: "Network error occurred",
      error: true,
    };
  }
};

// Get all blocked users
export const getBlockedUsers = async (
  min: number = 0,
  max: number = 20,
): Promise<GetBlockedUsersResponse> => {
  try {
    const response = await axiosInstance.get(
      `/block/blocked-users?min=${min}&max=${max}`,
    );

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error getting blocked users:", error);
    return {
      status: false,
      message: "Network error occurred",
      error: true,
      blockedUsers: [],
      minmax: "",
    };
  }
};
