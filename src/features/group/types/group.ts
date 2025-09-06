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

interface GroupAttachment {
  id: number;
  url: string;
  type: string;
  fileName?: string;
  fileSize?: number;
  messageId: number;
  createdAt: string;
}

interface GroupTag {
  id: number;
  userId: number;
  messageId: number;
  createdAt: string;
  user: User;
}

interface GroupSettings {
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

interface GroupJoinRequest {
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

interface GroupInvitation {
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

interface BlockedGroupParticipant {
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

interface User {
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

enum GroupMemberRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  MEMBER = "MEMBER",
}

enum JoinRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
}

// Request/Response types
interface CreateGroupRequest {
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

interface UpdateGroupRequest {
  name?: string;
  description?: string;
  groupType?: GroupType;
  maxMembers?: number;
  groupIcon?: string;
}

interface UpdateGroupSettingsRequest {
  allowMemberInvites?: boolean;
  allowMediaSharing?: boolean;
  allowFileSharing?: boolean;
  moderateMessages?: boolean;
  autoApproveJoinReqs?: boolean;
}

interface SendGroupMessageRequest {
  content?: string;
  messageType?: string;
  replyToId?: number;
  attachments?: File[];
}

interface InviteToGroupRequest {
  userIds: number[];
  message?: string;
}

interface JoinGroupRequest {
  message?: string;
}

interface UpdateMemberRoleRequest {
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

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  cursor?: number;
}

interface GroupListResponse {
  groups: Group[];
  pagination: PaginationMeta;
}

interface GroupMembersResponse {
  members: GroupMember[];
  pagination: {
    cursor?: number;
    nextCursor?: number;
    hasNextPage: boolean;
    limit: number;
    total: number;
  };
}

interface GroupMessagesResponse {
  messages: GroupMessage[];
  pagination: PaginationMeta;
}

interface GroupJoinRequestsResponse {
  requests: GroupJoinRequest[];
  pagination: PaginationMeta;
}

interface GroupInvitationsResponse {
  invitations: GroupInvitation[];
  pagination: PaginationMeta;
}

interface UserGroupStats {
  adminGroups: number;
  memberGroups: number;
  totalGroups: number;
  pendingInvitations: number;
  pendingJoinRequests: number;
}

// Search and Filter types
interface GroupSearchParams {
  query?: string;
  groupType?: GroupType;
  page?: number;
  limit?: number;
}

interface GroupMemberParams {
  cursor?: number;
  limit?: number;
  role?: GroupMemberRole;
}

interface GroupMessagesParams {
  page?: number;
  limit?: number;
  cursor?: number;
}

// Form types for components
interface GroupFormData {
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

interface MessageFormData {
  content: string;
  attachments: File[];
  replyToId?: number;
}

// Component Props types
interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: number) => void;
  onLeave?: (groupId: number) => void;
  onView?: (groupId: number) => void;
  showActions?: boolean;
}

interface GroupMemberCardProps {
  member: GroupMember;
  currentUserRole?: GroupMemberRole;
  onRoleChange?: (memberId: number, role: GroupMemberRole) => void;
  onRemove?: (memberId: number) => void;
  onMute?: (memberId: number) => void;
  onUnmute?: (memberId: number) => void;
}

interface GroupMessageProps {
  message: GroupMessage;
  currentUserId: number;
  onReply?: (messageId: number) => void;
  onEdit?: (messageId: number, content: string) => void;
  onDelete?: (messageId: number) => void;
}

interface GroupSettingsProps {
  group: Group;
  onUpdateSettings?: (settings: UpdateGroupSettingsRequest) => void;
  onUpdateGroup?: (data: UpdateGroupRequest) => void;
  onDeleteGroup?: () => void;
}

// Hook return types
interface UseGroupsReturn {
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

interface UseGroupMessagesReturn {
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

interface UseGroupMembersReturn {
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
