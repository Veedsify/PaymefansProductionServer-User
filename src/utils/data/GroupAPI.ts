import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { GroupMember } from "@/types/GroupTypes";

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
    fullname: string;
    user_id: string;
    username: string;
    profile_image: string;
    profile_banner: string;
  };
  members: any[]; // Define type if you have members structure
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
  const response = await axiosInstance.get(`/groups/main-group`, {
    withCredentials: true,
  });
  return response.data.data;
};

// Fetch group data by ID
export const fetchGroupData = async (groupId: number): Promise<GroupData> => {
  const response = await axiosInstance.get(`/groups/${groupId}`, {
    withCredentials: true,
  });
  return response.data.data;
};

// Fetch user's groups
export const fetchUserGroups = async (): Promise<GroupsResponse> => {
  try {
    const response = await axiosInstance.get("/groups/my-groups", {
      withCredentials: true,
    });

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
    withCredentials: true,
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
  const response = await axiosInstance.post(
    `/groups/${groupId}/leave`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
};

// Upload group attachment
export const uploadGroupAttachment = async (files: File[]): Promise<any> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("attachments", file);
  });

  const response = await axiosInstance.post(
    "/groups/upload-attachment",
    formData,
    {
      withCredentials: true,
    },
  );

  return response.data;
};
