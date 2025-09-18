import axiosInstance from "../Axios";

export interface ReferralUser {
  id: number;
  name: string;
  username: string;
  profile_image: string;
  created_at: string;
  earnings: number;
}

export interface ReferralEarning {
  id: number;
  points: number;
  description: string;
  created_at: string;
  referredUser?: {
    name: string;
    username: string;
    profile_image: string;
  };
}

interface ReferralStats {
  totalEarnings: number;
  totalReferrals: number;
  referralCode: string;
  status: boolean;
}

interface ReferralUsersResponse {
  users: ReferralUser[];
  hasMore: boolean;
  nextCursor: number | null;
  status: boolean;
}

interface ReferralEarningsResponse {
  earnings: ReferralEarning[];
  hasMore: boolean;
  nextCursor: number | null;
  status: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: boolean;
}

/**
 * Fetch referral statistics for the authenticated user
 */
export const fetchReferralStats = async (): Promise<ReferralStats> => {
  try {
    const response = await axiosInstance.get("/referral/stats");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching referral stats:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch referral statistics"
    );
  }
};

/**
 * Fetch referred users with pagination
 */
export const fetchReferredUsers = async (
  cursor?: number | null,
  limit: number = 10
): Promise<ReferralUsersResponse> => {
  try {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor.toString());
    params.append("limit", limit.toString());

    const queryString = params.toString();
    const url = `/referral/users${queryString ? `?${queryString}` : ""}`;

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching referred users:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch referred users"
    );
  }
};

/**
 * Fetch referral earnings with pagination
 */
export const fetchReferralEarnings = async (
  cursor?: number | null,
  limit: number = 10
): Promise<ReferralEarningsResponse> => {
  try {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor.toString());
    params.append("limit", limit.toString());

    const queryString = params.toString();
    const url = `/referral/earnings${queryString ? `?${queryString}` : ""}`;

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching referral earnings:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch referral earnings"
    );
  }
};

/**
 * Create a new referral relationship
 */
const createReferral = async (
  referralCode: string,
  referredUserId: number
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.post("/referral/create", {
      referralCode,
      referredUserId,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating referral:", error);
    throw new Error(
      error.response?.data?.error || "Failed to create referral"
    );
  }
};

/**
 * Validate a referral code
 */
const validateReferralCode = async (
  code: string
): Promise<ApiResponse<{ referrerId?: number; message: string }>> => {
  try {
    const response = await axiosInstance.get(`/referral/validate?code=${code}`);
    return response.data;
  } catch (error: any) {
    console.error("Error validating referral code:", error);
    throw new Error(
      error.response?.data?.error || "Failed to validate referral code"
    );
  }
};

/**
 * Add referral earnings (admin function)
 */
const addReferralEarnings = async (
  userId: number,
  points: number,
  description: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.post("/referral/add-earnings", {
      userId,
      points,
      description,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error adding referral earnings:", error);
    throw new Error(
      error.response?.data?.error || "Failed to add referral earnings"
    );
  }
};
