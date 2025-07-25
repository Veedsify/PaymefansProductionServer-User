export interface Group {
  id: number;
  name: string;
  description?: string;
  groupIcon?: string;
  groupType: GroupType;
  isActive: boolean;
  maxMembers: number;
  adminId: number;
  createdAt: string;
  updatedAt: string;
  admin: User;
  members: GroupMember[];
  settings?: GroupSettings;
  _count: {
    members: number;
    messages: number;
    joinRequests: number;
  };
}

export interface GroupMember {
  id: number;
  userId: number;
  groupId: number;
  role: GroupMemberRole;
  joinedAt: string;
  lastSeen?: string;
  isMuted: boolean;
  mutedBy?: number;
  mutedUntil?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface GroupMessage {
  id: number;
  content?: string;
  senderId: number;
  groupId: number;
  messageType: string;
  isEdited: boolean;
  editedAt?: string;
  replyToId?: number;
  createdAt: string;
  updatedAt: string;
  sender: User;
  attachments: GroupAttachment[];
  replyTo?: GroupMessage;
  tags: GroupTag[];
}

export interface GroupAttachment {
  id: number;
  url: string;
  type: string;
  fileName?: string;
  fileSize?: number;
  messageId: number;
  createdAt: string;
}

export interface GroupTag {
  id: number;
  userId: number;
  messageId: number;
  createdAt: string;
  user: User;
}

export interface GroupSettings {
  id: number;
  groupId: number;
  allowMemberInvites: boolean;
  allowMediaSharing: boolean;
  allowFileSharing: boolean;
  moderateMessages: boolean;
  autoApproveJoinReqs: boolean;
  mutedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupJoinRequest {
  id: number;
  userId: number;
  groupId: number;
  message?: string;
  status: JoinRequestStatus;
  createdAt: string;
  updatedAt: string;
  user: User;
  group: Group;
}

export interface GroupInvitation {
  id: number;
  inviterId: number;
  inviteeId: number;
  groupId: number;
  message?: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  inviter: User;
  invitee: User;
  group: Group;
}

export interface BlockedGroupParticipant {
  id: number;
  userId: number;
  groupId: number;
  blockedBy: number;
  reason?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  group: Group;
  blocker: User;
}

export interface User {
  id: number;
  username: string;
  fullname: string;
  profile_image?: string;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

// Enums
export enum GroupType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  SECRET = "SECRET",
}

export enum GroupMemberRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  MEMBER = "MEMBER",
}

export enum JoinRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
}

// Request/Response types
export interface CreateGroupRequest {
  name: string;
  description?: string;
  groupType: GroupType;
  maxMembers?: number;
  groupIcon?: string;
  settings?: {
    allowMemberInvites?: boolean;
    allowMediaSharing?: boolean;
    allowFileSharing?: boolean;
    moderateMessages?: boolean;
    autoApproveJoinReqs?: boolean;
  };
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  groupType?: GroupType;
  maxMembers?: number;
  groupIcon?: string;
}

export interface UpdateGroupSettingsRequest {
  allowMemberInvites?: boolean;
  allowMediaSharing?: boolean;
  allowFileSharing?: boolean;
  moderateMessages?: boolean;
  autoApproveJoinReqs?: boolean;
}

export interface SendGroupMessageRequest {
  content?: string;
  messageType?: string;
  replyToId?: number;
  attachments?: File[];
}

export interface InviteToGroupRequest {
  userIds: number[];
  message?: string;
}

export interface JoinGroupRequest {
  message?: string;
}

export interface UpdateMemberRoleRequest {
  role: GroupMemberRole;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: boolean;
  errors?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  cursor?: number;
}

export interface GroupListResponse {
  groups: Group[];
  pagination: PaginationMeta;
}

export interface GroupMembersResponse {
  members: GroupMember[];
  pagination: PaginationMeta;
}

export interface GroupMessagesResponse {
  messages: GroupMessage[];
  pagination: PaginationMeta;
}

export interface GroupJoinRequestsResponse {
  requests: GroupJoinRequest[];
  pagination: PaginationMeta;
}

export interface GroupInvitationsResponse {
  invitations: GroupInvitation[];
  pagination: PaginationMeta;
}

export interface UserGroupStats {
  adminGroups: number;
  memberGroups: number;
  totalGroups: number;
  pendingInvitations: number;
  pendingJoinRequests: number;
}

// Search and Filter types
export interface GroupSearchParams {
  query?: string;
  groupType?: GroupType;
  page?: number;
  limit?: number;
}

export interface GroupMemberParams {
  page?: number;
  limit?: number;
  role?: GroupMemberRole;
}

export interface GroupMessagesParams {
  page?: number;
  limit?: number;
  cursor?: number;
}

// Form types for components
export interface GroupFormData {
  name: string;
  description: string;
  groupType: GroupType;
  maxMembers: number;
  groupIcon?: File;
  allowMemberInvites: boolean;
  allowMediaSharing: boolean;
  allowFileSharing: boolean;
  moderateMessages: boolean;
  autoApproveJoinReqs: boolean;
}

export interface MessageFormData {
  content: string;
  attachments: File[];
  replyToId?: number;
}

// Component Props types
export interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: number) => void;
  onLeave?: (groupId: number) => void;
  onView?: (groupId: number) => void;
  showActions?: boolean;
}

export interface GroupMemberCardProps {
  member: GroupMember;
  currentUserRole?: GroupMemberRole;
  onRoleChange?: (memberId: number, role: GroupMemberRole) => void;
  onRemove?: (memberId: number) => void;
  onMute?: (memberId: number) => void;
  onUnmute?: (memberId: number) => void;
}

export interface GroupMessageProps {
  message: GroupMessage;
  currentUserId: number;
  onReply?: (messageId: number) => void;
  onEdit?: (messageId: number, content: string) => void;
  onDelete?: (messageId: number) => void;
}

export interface GroupSettingsProps {
  group: Group;
  onUpdateSettings?: (settings: UpdateGroupSettingsRequest) => void;
  onUpdateGroup?: (data: UpdateGroupRequest) => void;
  onDeleteGroup?: () => void;
}

// Hook return types
export interface UseGroupsReturn {
  groups: Group[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  fetchGroups: (params?: GroupSearchParams) => Promise<void>;
  createGroup: (data: CreateGroupRequest) => Promise<Group | null>;
  updateGroup: (
    groupId: number,
    data: UpdateGroupRequest,
  ) => Promise<Group | null>;
  deleteGroup: (groupId: number) => Promise<boolean>;
  joinGroup: (groupId: number, data?: JoinGroupRequest) => Promise<boolean>;
  leaveGroup: (groupId: number) => Promise<boolean>;
}

export interface UseGroupMessagesReturn {
  messages: GroupMessage[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  fetchMessages: (
    groupId: number,
    params?: GroupMessagesParams,
  ) => Promise<void>;
  sendMessage: (
    groupId: number,
    data: SendGroupMessageRequest,
  ) => Promise<GroupMessage | null>;
  editMessage: (messageId: number, content: string) => Promise<boolean>;
  deleteMessage: (messageId: number) => Promise<boolean>;
}

export interface UseGroupMembersReturn {
  members: GroupMember[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  fetchMembers: (groupId: number, params?: GroupMemberParams) => Promise<void>;
  updateMemberRole: (
    groupId: number,
    memberId: number,
    role: GroupMemberRole,
  ) => Promise<boolean>;
  removeMember: (groupId: number, memberId: number) => Promise<boolean>;
  inviteMembers: (
    groupId: number,
    data: InviteToGroupRequest,
  ) => Promise<boolean>;
}
