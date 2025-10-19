// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string | number;
  hasMore: boolean;
  total?: number;
}

export interface UserTransaction {
  id: string;
  transaction_type: "credit" | "debit";
  transaction_message: string;
  created_at: string;
  amount: number;
}

// Post Types
export interface PostData {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: UserData;
  UserMedia: MediaFile[];
  was_repost: boolean;
  repost_id?: string;
  repost_username?: string;
  repost_name?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export interface CreatePostData {
  content: string;
  audience: string;
  media?: MediaFile[];
}

export interface UpdatePostData {
  content?: string;
  audience?: string;
  media?: MediaFile[];
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: UserData;
  replies?: Comment[];
  likes_count: number;
  is_liked: boolean;
}

// User Types
export interface UserData {
  id: string;
  user_id: string;
  username: string;
  name: string;
  email: string;
  profile_image: string;
  banner_image?: string;
  bio?: string;
  is_verified: boolean;
  is_model: boolean;
  active_status: boolean;
  is_profile_hidden: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  Model?: {
    verification_status: boolean;
  };
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
}

// Chat Types
export interface Conversation {
  conversation_id: string;
  receiver: UserData;
  lastMessage: LastMessage;
  unread_count: number;
}

export interface LastMessage {
  id: string;
  message_id: string;
  content: string;
  created_at: string;
  sender_id: string;
  seen: boolean;
  attachment?: Attachment[];
}

export interface ChatMessage {
  id: string;
  message_id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversationId: string;
  seen: boolean;
  attachment?: Attachment[];
  rawFiles?: any[];
  triggerSend?: boolean;
}

export interface SendMessageData {
  content: string;
  attachment?: Attachment[];
  points_required?: number;
}

// Media Types
export interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
  thumbnail?: string;
  duration?: number;
  size: number;
  name: string;
}

export interface Attachment {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
  size: number;
  extension: string;
  poster?: string;
}

// Store Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  in_stock: boolean;
  stock_count: number;
}

export interface CheckoutData {
  products: Array<{
    product_id: string;
    quantity: number;
  }>;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  payment_method: string;
}

// Points Types
export interface PointsData {
  balance: number;
  currency: string;
  conversion_rate: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  data?: any;
}

// Analytics Types
export interface AnalyticsData {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  revenue: number;
  period: string;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}
