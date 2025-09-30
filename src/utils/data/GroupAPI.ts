import type { GroupMember } from "@/features/group/types/group";
import axiosInstance from "@/utils/Axios";

type Group = {
  id: number;
  adminId: number;
  created_at: string;
  updated_at: string;
  description: string;
  groupIcon: string;
  groupType: "PUBLIC" | "PRIVATE"; // Assuming only PUBLIC or PRIVATE
  isActive: boolean;
  maxMembers: number;
  name: string;
  admin: {
    id: number;
    email: string;
    name: string;
    user_id: string;
    username: string;
    profile_image: string;
    profile_banner: string;
  };
  members: any[]; // Define type if you have member structures
  settings: {
    id: number;
    allowFileSharing: boolean;
    allowMediaSharing: boolean;
    allowMemberInvites: boolean;
    autoApproveJoinReqs: boolean;
    created_at: string;
    updated_at: string;
    groupId: number;
    moderateMessages: boolean;
    mutedUntil: string | null;
  };
  _count: {
    members: number;
    messages: number;
    joinRequests: number;
  };
};

export interface GroupData {
  id: number;
  name: string;
  description?: string;
  groupIcon?: string;
  groupType: string;
  maxMembers: number;
  membersCount: number;
  admin: {
    user_id: string;
    username: string;
    profile_image: string;
    is_verified: boolean;
  };
  settings: {
    allowMemberInvites: boolean;
    allowMediaSharing: boolean;
    allowFileSharing: boolean;
    moderateMessages: boolean;
    autoApproveJoinReqs: boolean;
  };
  userRole: "ADMIN" | "MODERATOR" | "MEMBER";
  isActive: boolean;
  members?: any[]; // Add members to the interface
  lastMessage?: {
    content: string;
    senderId: string;
    senderUsername: string;
    timestamp: string;
  };
}

interface GroupMessage {
  id: number;
  groupId: number;
  content: string;
  messageType: string;
  senderId: number;
  sender: {
    user_id: number;
    username: string;
    profile_image: string;
    is_verified: boolean;
  };
  replyTo?: GroupMessage | null;
  attachments: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  created_at: string;
  timestamp: string;
}

export interface GroupsResponse {
  success: boolean;
  data: {
    groups?: GroupData[];
    userGroups?: GroupData[];
    totalGroups?: number;
    userGroupsCount?: number;
  };
}

interface GroupMessagesResponse {
  success: boolean;
  data: {
    messages: GroupMessage[];
    nextCursor?: number | null;
    hasMore: boolean;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
      cursor?: number;
    };
  };
}

interface GroupMembersResponse {
  success: boolean;
  data: {
    members: GroupMember[];
    pagination: {
      cursor?: number;
      nextCursor?: number;
      hasNextPage: boolean;
      limit: number;
      total: number;
    };
  };
}

export const getMainGroup = async (): Promise<{ groups: Group }> => {
  const response = await axiosInstance.get(`/groups/main-group`);
  return response.data.data;
};

// Fetch group data by ID
export const fetchGroupData = async (groupId: number): Promise<GroupData> => {
  try {
    const response = await axiosInstance.get(`/groups/${groupId}`);
    return response.data.data;
  } catch (error: any) {
    // Check if the error indicates the user is blocked
    if (error.response?.status === 403) {
      // If it's a 403 error, the user might be blocked
      const errorMessage = error.response?.data?.message || "";
      if (
        errorMessage.toLowerCase().includes("blocked") ||
        errorMessage.toLowerCase().includes("access denied")
      ) {
        throw new Error("BLOCKED_FROM_GROUP");
      }
    }
    throw error;
  }
};

// Fetch user's groups
export const fetchUserGroups = async (): Promise<GroupsResponse> => {
  try {
    const response = await axiosInstance.get("/groups/my-groups");

    if (!response.data) {
      throw new Error("No data received from server");
    }

    if (!response.data.success) {
      throw new Error(response.data.message || "API request failed");
    }

    return response.data;
  } catch (error: any) {
    // Re-throw the error with more context
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. You don't have permission to view groups.",
      );
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else if (
      error.code === "NETWORK_ERROR" ||
      error.message.includes("Network Error")
    ) {
      throw new Error("Network error. Please check your internet connection.");
    }

    throw error;
  }
};

// Fetch group messages
export const fetchGroupMessages = async (
  groupId: number,
  cursor?: number | null,
  limit: number = 100,
): Promise<GroupMessagesResponse> => {
  const params: any = { limit };

  // Only include cursor if it's provided and not null
  if (cursor) {
    params.cursor = cursor;
  }

  const response = await axiosInstance.get(`/groups/${groupId}/messages`, {
    params,
  });
  return response.data;
};

// Fetch group members
export const fetchGroupMembers = async (
  groupId: string,
  cursor?: number,
  limit: number = 20,
): Promise<GroupMembersResponse> => {
  const params: any = { limit };
  if (cursor) {
    params.cursor = cursor;
  }

  const response = await axiosInstance.get(`/groups/${groupId}/members`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

// Fetch current user's membership status for a group

// Check if current user is blocked from a group
export const checkUserBlockedStatus = async (
  groupId: number,
): Promise<{ success: boolean; data: { isBlocked: boolean } }> => {
  try {
    const response = await axiosInstance.get(`/groups/${groupId}/is-blocked`);
    return response.data;
  } catch (error: any) {
    // If the endpoint doesn't exist or returns 404, assume not blocked
    if (error.response?.status === 404) {
      return { success: true, data: { isBlocked: false } };
    }
    throw error;
  }
};

// Extract current user's membership from group data
export const extractUserMembershipFromGroup = (
  groupData: any,
  userId: number | string,
  isBlocked: boolean = false,
): any | null => {
  if (!groupData?.members) {
    return null;
  }

  // Find the current user's membership
  const userMembership = groupData.members.find((member: any) => {
    return (
      member.userId === userId || member.userId.toString() === userId.toString()
    );
  });

  if (!userMembership) {
    return null;
  }

  return {
    userId: userMembership.userId,
    role: userMembership.role,
    joinedAt: userMembership.joinedAt,
    isMuted: userMembership.isMuted || false,
    mutedBy: userMembership.mutedBy,
    mutedUntil: userMembership.mutedUntil,
    isBlocked: isBlocked,
  };
};

// Join a group
export const joinGroup = async (groupId: number): Promise<any> => {
  const response = await axiosInstance.post(
    `/groups/${groupId}/join`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
};

// Leave a group
const leaveGroup = async (groupId: string): Promise<any> => {
  const response = await axiosInstance.post(`/groups/${groupId}/leave`, {});
  return response.data;
};

// Upload group attachment
const uploadGroupAttachment = async (files: File[]): Promise<any> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("attachments", file);
  });

  const response = await axiosInstance.post(
    "/groups/upload-attachment",
    formData,
  );

  return response.data;
};
