"use client";

import axiosInstance from "@/utils/Axios";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginatedResponse,
  PostData,
  CreatePostData,
  UpdatePostData,
  Comment,
  UserData,
  UpdateProfileData,
  Conversation,
  ChatMessage,
  ChatMessagesResponse,
  SendMessageData,
  Product,
  CheckoutData,
  PointsData,
  Notification,
  AnalyticsData,
  UserTransaction,
} from "./types";

/**
 * Centralized API client with typed methods
 * Usage: const { post, user, chat } = useApi()
 * Then: await post.create(data), await user.getProfile(id), etc.
 */
export const useApi = () => {
  return {
    // Post API methods
    post: {
      create: async (data: CreatePostData) =>
        axiosInstance.post<ApiResponse<PostData>>(ENDPOINTS.POST.CREATE, data),

      edit: async (id: string, data: UpdatePostData) =>
        axiosInstance.put<ApiResponse<PostData>>(
          ENDPOINTS.POST.UPDATE(id),
          data
        ),

      delete: async (id: string) =>
        axiosInstance.delete<ApiResponse<void>>(ENDPOINTS.POST.DELETE(id)),

      getById: async (id: string) =>
        axiosInstance.get<ApiResponse<PostData>>(ENDPOINTS.POST.SINGLE(id)),

      like: async (id: string) =>
        axiosInstance.post<
          ApiResponse<{ is_liked: boolean; likes_count: number }>
        >(ENDPOINTS.POST.LIKE(id)),

      getComments: async (id: string, cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<Comment>>>(
          ENDPOINTS.POST.COMMENTS(id),
          { params: { cursor } }
        ),

      getCommentReplies: async (commentId: string, cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<Comment>>>(
          ENDPOINTS.POST.COMMENT_REPLIES(commentId),
          { params: { cursor } }
        ),

      getPersonalPosts: async (cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.POST.PERSONAL_POSTS,
          { params: { cursor } }
        ),

      getPersonalPrivatePosts: async (cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.POST.PERSONAL_PRIVATE_POSTS,
          { params: { cursor } }
        ),

      getPersonalReposts: async (cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.POST.PERSONAL_REPOSTS,
          { params: { cursor } }
        ),

      getPersonalMedia: async (cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.POST.PERSONAL_MEDIA,
          { params: { cursor } }
        ),

      getUserPosts: async (userId: string, cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.POST.USER_POSTS(userId),
          { params: { cursor } }
        ),

      repost: async (id: string) =>
        axiosInstance.post<ApiResponse<PostData>>(ENDPOINTS.POST.REPOST(id)),

      updateAudience: async (id: string, audience: string) =>
        axiosInstance.put<ApiResponse<PostData>>(
          ENDPOINTS.POST.UPDATE_AUDIENCE(id),
          { audience }
        ),

      getLikeData: async (id: string) =>
        axiosInstance.get<
          ApiResponse<{ is_liked: boolean; likes_count: number }>
        >(ENDPOINTS.POST.LIKE_DATA(id)),

      getMultipleLikeData: async (ids: string[]) =>
        axiosInstance.post<
          ApiResponse<
            Record<string, { is_liked: boolean; likes_count: number }>
          >
        >(ENDPOINTS.POST.MULTIPLE_LIKE_DATA, { ids }),

      payForPost: async (postId: string, amount: number) =>
        axiosInstance.post<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.POST.PAY_FOR_POST,
          { post_id: postId, amount }
        ),

      getMentions: async (cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.POST.MENTIONS,
          { params: { cursor } }
        ),
    },

    // User/Profile API methods
    user: {
      getProfile: async (username: string) =>
        axiosInstance.post<ApiResponse<UserData>>(ENDPOINTS.USER.USER, {
          username,
        }),

      updateProfile: async (data: UpdateProfileData) =>
        axiosInstance.post<ApiResponse<UserData>>(ENDPOINTS.USER.UPDATE, data),

      updateBanner: async (bannerFile: File) => {
        const formData = new FormData();
        formData.append("banner", bannerFile);
        return axiosInstance.post<ApiResponse<{ banner_url: string }>>(
          ENDPOINTS.USER.BANNER,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      },

      follow: async (userId: string) =>
        axiosInstance.post<ApiResponse<{ is_following: boolean }>>(
          ENDPOINTS.USER.ACTION("follow", userId)
        ),

      unfollow: async (userId: string) =>
        axiosInstance.post<ApiResponse<{ is_following: boolean }>>(
          ENDPOINTS.USER.ACTION("unfollow", userId)
        ),

      getFollowers: async (userId: string, page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<UserData>>>(
          ENDPOINTS.USER.STATS(userId, "followers"),
          { params: { page } }
        ),

      getFollowing: async (userId: string, page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<UserData>>>(
          ENDPOINTS.USER.STATS(userId, "following"),
          { params: { page } }
        ),

      tip: async (userId: string, amount: number, message?: string) =>
        axiosInstance.post<
          ApiResponse<{ success: boolean; transaction_id: string }>
        >(ENDPOINTS.USER.TIP, { user_id: userId, amount, message }),

      getCreatorDashboard: async () =>
        axiosInstance.get<ApiResponse<AnalyticsData>>(
          ENDPOINTS.USER.CREATOR_DASHBOARD
        ),

      deleteAccount: async (password: string) =>
        axiosInstance.post<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.USER.DELETE_ACCOUNT,
          { password }
        ),
    },

    // Chat/Conversation API methods
    chat: {
      getConversations: async (cursor?: number) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<Conversation>>>(
          ENDPOINTS.CHAT.CONVERSATIONS,
          { params: { cursor } }
        ),

      getReceiver: async (conversationId: string) =>
        axiosInstance.get<{ receiver: UserData; error: boolean }>(
          ENDPOINTS.CHAT.RECEIVER(conversationId)
        ),

      getMessages: async (conversationId: string, cursor?: number) =>
        axiosInstance.get<ChatMessagesResponse>(
          ENDPOINTS.CHAT.MESSAGES(conversationId),
          { params: { cursor } }
        ),

      sendMessage: async (conversationId: string, data: SendMessageData) =>
        axiosInstance.post<ApiResponse<ChatMessage>>(
          ENDPOINTS.CHAT.SEND_MESSAGE(conversationId),
          data
        ),

      searchMessages: async (conversationId: string, query: string) =>
        axiosInstance.post<ApiResponse<ChatMessage[]>>(
          ENDPOINTS.CHAT.SEARCH_MESSAGES(conversationId),
          { q: query }
        ),

      createConversation: async (userId: string) =>
        axiosInstance.post<ApiResponse<{ conversation_id: string }>>(
          ENDPOINTS.CHAT.CREATE_CONVERSATION,
          { user_id: userId }
        ),

      blockUser: async (userId: string) =>
        axiosInstance.post<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.CHAT.BLOCK_USER,
          { user_id: userId }
        ),

      unblockUser: async (userId: string) =>
        axiosInstance.post<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.CHAT.UNBLOCK_USER,
          { user_id: userId }
        ),
    },

    // Feed API methods
    feed: {
      getHome: async (cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.FEED.HOME,
          { params: { cursor } }
        ),

      getExplore: async (cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.FEED.EXPLORE,
          { params: { cursor } }
        ),

      getTrending: async (cursor?: string) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.FEED.TRENDING,
          { params: { cursor } }
        ),
    },

    // Store API methods
    store: {
      getProducts: async (page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<Product>>>(
          ENDPOINTS.STORE.PRODUCTS(page)
        ),

      getProduct: async (id: string) =>
        axiosInstance.get<ApiResponse<Product>>(ENDPOINTS.STORE.PRODUCT(id)),

      checkout: async (data: CheckoutData) =>
        axiosInstance.post<
          ApiResponse<{ order_id: string; payment_url: string }>
        >(ENDPOINTS.STORE.CHECKOUT, data),

      getOrders: async (page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
          ENDPOINTS.STORE.ORDERS,
          { params: { page } }
        ),

      updateOrderStatus: async (orderId: string, status: string) =>
        axiosInstance.put<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.STORE.ORDER_STATUS(orderId),
          { status }
        ),

      verifyPayment: async (reference: string) =>
        axiosInstance.get<ApiResponse<{ success: boolean; order_id: string }>>(
          ENDPOINTS.STORE.VERIFY_PAYMENT(reference)
        ),

      addToWishlist: async (productId: string) =>
        axiosInstance.post<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.STORE.WISHLIST_ADD,
          { product_id: productId }
        ),

      removeFromWishlist: async (productId: string) =>
        axiosInstance.delete<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.STORE.WISHLIST_REMOVE(productId)
        ),

      getWishlist: async () =>
        axiosInstance.get<ApiResponse<Product[]>>(ENDPOINTS.STORE.WISHLIST),

      checkWishlist: async (productId: string) =>
        axiosInstance.get<ApiResponse<{ in_wishlist: boolean }>>(
          ENDPOINTS.STORE.WISHLIST_CHECK(productId)
        ),

      getWishlistCount: async () =>
        axiosInstance.get<ApiResponse<{ count: number }>>(
          ENDPOINTS.STORE.WISHLIST_COUNT
        ),

      clearWishlist: async () =>
        axiosInstance.delete<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.STORE.WISHLIST_CLEAR
        ),
    },

    // Points API methods
    points: {
      getBalance: async () =>
        axiosInstance.get<ApiResponse<PointsData>>(ENDPOINTS.POINTS.BALANCE),

      purchase: async (amount: number, paymentMethod: string) =>
        axiosInstance.post<
          ApiResponse<{ transaction_id: string; payment_url: string }>
        >(ENDPOINTS.POINTS.PURCHASE, { amount, payment_method: paymentMethod }),

      getRate: async () =>
        axiosInstance.get<ApiResponse<{ rate: number; currency: string }>>(
          ENDPOINTS.POINTS.RATE
        ),

      getPricePerMessage: async (userId: string) =>
        axiosInstance.post<ApiResponse<{ price_per_message: number }>>(
          ENDPOINTS.POINTS.PRICE_PER_MESSAGE,
          { user_id: userId }
        ),

      getHistory: async (page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
          ENDPOINTS.POINTS.HISTORY,
          { params: { page } }
        ),
    },

    // Wallet API methods
    wallet: {
      getTransactions: async (page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
          ENDPOINTS.WALLET.TRANSACTIONS,
          { params: { page } }
        ),
      getOtherTransactions: async (page: number = 1) =>
        axiosInstance.get<ApiResponse<UserTransaction[]>>(
          ENDPOINTS.WALLET.TRANSACTIONS_OTHER,
          { params: { page } }
        ),

      addFunds: async (amount: number, paymentMethod: string) =>
        axiosInstance.post<
          ApiResponse<{ transaction_id: string; payment_url: string }>
        >(ENDPOINTS.WALLET.ADD_FUNDS, {
          amount,
          payment_method: paymentMethod,
        }),

      withdraw: async (amount: number, bankDetails: any) =>
        axiosInstance.post<
          ApiResponse<{ transaction_id: string; status: string }>
        >(ENDPOINTS.WALLET.WITHDRAW, { amount, ...bankDetails }),

      getWithdrawHistory: async (page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
          ENDPOINTS.WALLET.WITHDRAW_HISTORY,
          { params: { page } }
        ),

      confirmWithdraw: async (transactionId: string, pin: string) =>
        axiosInstance.post<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.WALLET.WITHDRAW_CONFIRM,
          { transaction_id: transactionId, pin }
        ),

      getBanks: async () =>
        axiosInstance.get<ApiResponse<any[]>>(ENDPOINTS.WALLET.SELECT_BANK),
    },

    // Notifications API methods
    notifications: {
      getList: async (page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<Notification>>>(
          ENDPOINTS.NOTIFICATIONS.LIST,
          { params: { page } }
        ),

      markAsRead: async (id: string) =>
        axiosInstance.post<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
        ),

      markAllAsRead: async () =>
        axiosInstance.post<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
        ),

      getSettings: async () =>
        axiosInstance.get<ApiResponse<any>>(ENDPOINTS.NOTIFICATIONS.SETTINGS),

      updateSettings: async (settings: any) =>
        axiosInstance.put<ApiResponse<{ success: boolean }>>(
          ENDPOINTS.NOTIFICATIONS.SETTINGS,
          settings
        ),
    },

    // Search API methods
    search: {
      platform: async (
        query: string,
        category: "users" | "posts" | "media" = "users"
      ) =>
        axiosInstance.get<ApiResponse<any[]>>(ENDPOINTS.SEARCH.PLATFORM, {
          params: { query, category },
        }),

      users: async (query: string, page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<UserData>>>(
          ENDPOINTS.SEARCH.USERS,
          { params: { query, page } }
        ),

      posts: async (query: string, page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<PostData>>>(
          ENDPOINTS.SEARCH.POSTS,
          { params: { query, page } }
        ),

      media: async (query: string, page: number = 1) =>
        axiosInstance.get<ApiResponse<PaginatedResponse<any>>>(
          ENDPOINTS.SEARCH.MEDIA,
          { params: { query, page } }
        ),
    },

    // Analytics API methods
    analytics: {
      getDashboard: async () =>
        axiosInstance.get<ApiResponse<AnalyticsData>>(
          ENDPOINTS.ANALYTICS.DASHBOARD
        ),

      getPosts: async (period: string = "7d") =>
        axiosInstance.get<ApiResponse<AnalyticsData>>(
          ENDPOINTS.ANALYTICS.POSTS,
          { params: { period } }
        ),

      getRevenue: async (period: string = "7d") =>
        axiosInstance.get<ApiResponse<AnalyticsData>>(
          ENDPOINTS.ANALYTICS.REVENUE,
          { params: { period } }
        ),

      getEngagement: async (period: string = "7d") =>
        axiosInstance.get<ApiResponse<AnalyticsData>>(
          ENDPOINTS.ANALYTICS.ENGAGEMENT,
          { params: { period } }
        ),
    },
  };
};

export default useApi;
