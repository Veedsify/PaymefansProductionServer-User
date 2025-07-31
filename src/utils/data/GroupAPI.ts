import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";

export interface GroupData {
  id: string;
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
  lastMessage?: {
    content: string;
    senderId: string;
    senderUsername: string;
    timestamp: string;
  };
}

interface GroupMessage {
  id: number;
  groupId: string;
  content: string;
  messageType: string;
  senderId: string;
  sender: {
    user_id: string;
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
  createdAt: string;
  timestamp: string;
}

interface GroupMember {
  userId: string;
  username: string;
  profile_image: string;
  is_verified: boolean;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  joinedAt: string;
  isActive: boolean;
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
    nextCursor?: number;
    hasMore: boolean;
  };
}

interface GroupMembersResponse {
  success: boolean;
  data: {
    members: GroupMember[];
    totalMembers: number;
  };
}

// Fetch group data by ID
export const fetchGroupData = async (groupId: string): Promise<GroupData> => {
  const token = getToken();
  const response = await axiosInstance.get(`/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

// Fetch user's groups
export const fetchUserGroups = async (): Promise<GroupsResponse> => {
  try {
    const token = getToken();
    console.log("fetchUserGroups - Token exists:", !!token);

    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("fetchUserGroups - Making request to /groups/my-groups");

    const response = await axiosInstance.get("/groups/my-groups", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("fetchUserGroups - Response status:", response.status);
    console.log("fetchUserGroups - Response data:", response.data);

    if (!response.data) {
      throw new Error("No data received from server");
    }

    if (!response.data.success) {
      throw new Error(response.data.message || "API request failed");
    }

    return response.data;
  } catch (error: any) {
    console.error("fetchUserGroups - Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });

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

// Search available groups
export const searchGroups = async (
  query?: string,
  limit: number = 20,
): Promise<GroupsResponse> => {
  const token = getToken();
  const response = await axiosInstance.get("/groups/search", {
    params: { query, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch group messages
export const fetchGroupMessages = async (
  groupId: string,
  cursor?: number,
  limit: number = 20,
): Promise<GroupMessagesResponse> => {
  const token = getToken();
  const response = await axiosInstance.get(`/groups/${groupId}/messages`, {
    params: { cursor, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Fetch group members
const fetchGroupMembers = async (
  groupId: string,
  page: number = 1,
  limit: number = 20,
): Promise<GroupMembersResponse> => {
  const token = getToken();
  const response = await axiosInstance.get(`/groups/${groupId}/members`, {
    params: { page, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Join a group
export const joinGroup = async (groupId: string): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.post(
    `/groups/${groupId}/join`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Leave a group
const leaveGroup = async (groupId: string): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.post(
    `/groups/${groupId}/leave`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Invite user to group
const inviteToGroup = async (
  groupId: string,
  userId: string,
): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.post(
    `/groups/${groupId}/invite`,
    { userId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Update group settings
const updateGroupSettings = async (
  groupId: string,
  settings: Partial<GroupData["settings"]>,
): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.put(
    `/groups/${groupId}/settings`,
    settings,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Update member role
const updateMemberRole = async (
  groupId: string,
  memberId: string,
  role: "ADMIN" | "MODERATOR" | "MEMBER",
): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.put(
    `/groups/${groupId}/members/${memberId}/role`,
    { role },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Remove member from group
const removeMember = async (
  groupId: string,
  memberId: string,
): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.delete(
    `/groups/${groupId}/members/${memberId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Get join requests for a group
const getJoinRequests = async (groupId: string): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.get(`/groups/${groupId}/join-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Approve join request
const approveJoinRequest = async (requestId: string): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.post(
    `/groups/join-requests/${requestId}/approve`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Reject join request
const rejectJoinRequest = async (requestId: string): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.post(
    `/groups/join-requests/${requestId}/reject`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Get user invitations
const getUserInvitations = async (): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.get("/groups/invitations/received", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Accept invitation
const acceptInvitation = async (invitationId: string): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.post(
    `/groups/invitations/${invitationId}/accept`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Decline invitation
const declineInvitation = async (invitationId: string): Promise<any> => {
  const token = getToken();
  const response = await axiosInstance.post(
    `/groups/invitations/${invitationId}/decline`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

// Upload group attachment
const uploadGroupAttachment = async (files: File[]): Promise<any> => {
  const token = getToken();
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("attachments", file);
  });

  const response = await axiosInstance.post(
    "/groups/upload-attachment",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
