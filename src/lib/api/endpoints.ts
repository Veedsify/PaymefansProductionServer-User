const BASE_URL = process.env.NEXT_PUBLIC_TS_EXPRESS_URL;

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/token/refresh",
    RETRIEVE: "/auth/retrieve",
    VERIFY_EMAIL: "/auth/verify/email",
    RESEND_VERIFICATION: "/auth/verify/email/resend",
    TWO_FACTOR: "/auth/two-factor-authentication",
    VERIFY_TWO_FACTOR: "/auth/verify/authentication",
    RESEND_TWO_FACTOR: "/auth/verify/resend",
    RESET_PASSWORD: "/auth/reset",
    POINTS: "/auth/points",
    WALLET: "/auth/wallet",
  },

  // Post endpoints
  POST: {
    CREATE: "/post/create",
    UPDATE: (id: string) => `/post/update/${id}`,
    DELETE: (id: string) => `/post/${id}`,
    SINGLE: (id: string) => `/post/single/${id}`,
    LIKE: (id: string) => `/post/like/${id}`,
    COMMENTS: (id: string) => `/post/${id}/comments`,
    COMMENT_REPLIES: (commentId: string) =>
      `/post/comments/${commentId}/replies`,
    MEDIA_SIGNED_URL: "/post/media/signed-url",
    GIFT_POINTS: "/post/point/gift",
    PAY_FOR_POST: "/post/pay",
    MENTIONS: "/post/mentions",
    PERSONAL_POSTS: "/post/personal/posts",
    PERSONAL_PRIVATE_POSTS: "/post/personal/private-post",
    PERSONAL_REPOSTS: "/post/personal/reposts",
    PERSONAL_MEDIA: "/post/personal/media",
    PERSONAL_PRIVATE_MEDIA: "/post/personal/private-media",
    OTHER_PRIVATE_POSTS: (userId: string) =>
      `/post/other/private-posts/${userId}`,
    OTHER_REPOSTS: (userId: string) => `/post/other/reposts/${userId}`,
    OTHER_MEDIA: (userId: string) => `/post/other/media/${userId}`,
    OTHER_PRIVATE_MEDIA: (userId: string) =>
      `/post/other/private-media/${userId}`,
    USER_POSTS: (userId: string) => `/post/user/${userId}`,
    LIKE_DATA: (id: string) => `/post/like-data/${id}`,
    MULTIPLE_LIKE_DATA: "/post/like-data/multiple",
    UPDATE_AUDIENCE: (id: string) => `/post/update/audience/${id}`,
    REPOST: (id: string) => `/post/repost/${id}`,
  },

  // User/Profile endpoints
  USER: {
    UPDATE: "/profile/update",
    BANNER: "/profile/banner/change",
    STATS: (userId: string, type: string) => `/profile/stats/${userId}/${type}`,
    ACTION: (action: string, userId: string) =>
      `/profile/action/${action}/${userId}`,
    TIP: "/profile/tip/model",
    DELETE_ACCOUNT: "/profile/delete-account",
    CREATOR_DASHBOARD: "/profile/creator-dashboard-data",
    USER: (username: string) => `/profile/user/${username}`,
  },

  // Chat/Conversation endpoints
  CHAT: {
    CONVERSATIONS: "/conversations",
    MESSAGES: (conversationId: string) =>
      `/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId: string) =>
      `/conversations/${conversationId}/messages`,
    SEARCH_MESSAGES: (conversationId: string) =>
      `/conversations/search/messages/${conversationId}`,
    CREATE_CONVERSATION: "/conversations/create",
    BLOCK_USER: "/conversations/block",
    UNBLOCK_USER: "/conversations/unblock",
  },

  // Feed endpoints
  FEED: {
    HOME: "/feeds/home",
    EXPLORE: "/feeds/explore",
    TRENDING: "/feeds/trending",
  },

  // Store endpoints
  STORE: {
    PRODUCTS: (page: number) => `/store/products?page=${page}`,
    PRODUCT: (id: string) => `/store/product/${id}`,
    CHECKOUT: "/store/checkout",
    ORDERS: "/store/orders",
    ORDER_STATUS: (orderId: string) => `/store/orders/${orderId}/status`,
    VERIFY_PAYMENT: (reference: string) => `/store/verify-payment/${reference}`,
    WISHLIST: "/wishlist",
    WISHLIST_ADD: "/wishlist/add",
    WISHLIST_REMOVE: (productId: string) => `/wishlist/remove/${productId}`,
    WISHLIST_CHECK: (productId: string) => `/wishlist/check/${productId}`,
    WISHLIST_COUNT: "/wishlist/count",
    WISHLIST_CLEAR: "/wishlist/clear",
  },

  // Points endpoints
  POINTS: {
    PURCHASE: "/points/purchase",
    RATE: "/points/rate",
    PRICE_PER_MESSAGE: "/points/price-per-message",
    BALANCE: "/points/balance",
    HISTORY: "/points/history",
  },

  // Wallet endpoints
  WALLET: {
    TRANSACTIONS: "/wallet/transactions",
    TRANSACTIONS_OTHER: "/wallet/transactions/other",
    ADD_FUNDS: "/wallet/add",
    WITHDRAW: "/wallet/withdraw",
    WITHDRAW_HISTORY: "/wallet/withdraw/history",
    WITHDRAW_CONFIRM: "/wallet/withdraw/confirm",
    SELECT_BANK: "/wallet/withdraw/select-bank",
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
    SETTINGS: "/notifications/settings",
  },

  // Search endpoints
  SEARCH: {
    PLATFORM: "/search/platform",
    USERS: "/search/users",
    POSTS: "/search/posts",
    MEDIA: "/search/media",
  },

  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
    POSTS: "/analytics/posts",
    REVENUE: "/analytics/revenue",
    ENGAGEMENT: "/analytics/engagement",
  },

  // Settings endpoints
  SETTINGS: {
    PROFILE: "/settings/profile",
    SECURITY: "/settings/security",
    BILLING: "/settings/billing",
    NOTIFICATIONS: "/settings/notifications",
    PRIVACY: "/settings/privacy",
    AUTOMATED_MESSAGES: "/settings/automated-messages",
    TWO_FACTOR: "/settings/two-factor",
  },

  // Help/Support endpoints
  HELP: {
    CATEGORIES: "/help/categories",
    TICKETS: "/help/tickets",
    CREATE_TICKET: "/help/tickets/create",
    SUPPORT: "/help/support",
  },

  // Groups endpoints
  GROUPS: {
    LIST: "/groups",
    CREATE: "/groups/create",
    JOIN: (groupId: string) => `/groups/${groupId}/join`,
    LEAVE: (groupId: string) => `/groups/${groupId}/leave`,
    SETTINGS: (groupId: string) => `/groups/${groupId}/settings`,
    MEMBERS: (groupId: string) => `/groups/${groupId}/members`,
  },

  // Model endpoints
  MODEL: {
    SIGNUP: "/model/signup",
    VERIFY: "/model/verify",
    BENEFITS: "/model/benefits",
    PAYMENT: "/model/payment",
    DASHBOARD: "/model/dashboard",
  },

  // Verification endpoints
  VERIFICATION: {
    START: "/verification/start",
    UPLOAD: "/verification/upload",
    STATUS: "/verification/status",
  },

  // Referral endpoints
  REFERRAL: {
    STATS: "/referral/stats",
    USERS: "/referral/users",
    EARNINGS: "/referral/earnings",
    LINK: "/referral/link",
  },

  // System endpoints
  SYSTEM: {
    CONFIGS: "/configs",
    RATES: "/rates/platform-rate",
    HEALTH: "/health",
  },
} as const;

export type EndpointKey = keyof typeof ENDPOINTS;
export type EndpointPath = string;
