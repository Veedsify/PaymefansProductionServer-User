import { getToken } from "../Cookie";

const API_URL = process.env.NEXT_PUBLIC_TS_EXPRESS_URL;

export interface BlockUserResponse {
  status: boolean;
  message: string;
  error: boolean;
  blockId?: string;
}

export interface UnblockUserResponse {
  status: boolean;
  message: string;
  error: boolean;
}

export interface CheckBlockStatusResponse {
  status: boolean;
  isBlocked: boolean;
  blockId?: string;
  message?: string;
  error?: boolean;
}

export interface GetBlockedUsersResponse {
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
    const token = getToken();

    if (!token) {
      return {
        status: false,
        message: "Authentication token not found",
        error: true,
      };
    }

    const response = await fetch(`${API_URL}/block/block-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blockedId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error blocking user:", error);
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
    const token = getToken();

    if (!token) {
      return {
        status: false,
        message: "Authentication token not found",
        error: true,
      };
    }

    const response = await fetch(`${API_URL}/block/unblock-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ blockedId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error unblocking user:", error);
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
    const token = getToken();

    if (!token) {
      return {
        status: false,
        isBlocked: false,
        message: "Authentication token not found",
        error: true,
      };
    }

    const response = await fetch(`${API_URL}/block/check-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId }),
    });

    const data = await response.json();
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
    const token = getToken();

    if (!token) {
      return {
        status: false,
        isBlocked: false,
        message: "Authentication token not found",
        error: true,
      };
    }

    const response = await fetch(`${API_URL}/block/check-blocked-by`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId }),
    });

    const data = await response.json();
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
    const token = getToken();

    if (!token) {
      return {
        status: false,
        message: "Authentication token not found",
        error: true,
        blockedUsers: [],
        minmax: "",
      };
    }

    const response = await fetch(
      `${API_URL}/block/blocked-users?min=${min}&max=${max}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
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
