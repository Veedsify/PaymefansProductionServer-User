import { fmt } from "@/constants/path";

const NEXT_PUBLIC_TS_EXPRESS_URL = process.env.NEXT_PUBLIC_TS_EXPRESS_URL;

/**
 * An object containing various API route endpoints for the application.
 */
const ROUTE = {
  /**
   * Endpoint for uploading a banner image for a profile.
   * @type {string}
   */
  BANNER_IMAGE_UPLOAD: fmt(
    `%s/profile/banner/change`,
    NEXT_PUBLIC_TS_EXPRESS_URL
  ),

  /**
   * Endpoint for updating the profile image.
   * @type {string}
   */
  PROFILE_UPDATE: `/profile/update`,

  /**
   * Endpoint for creating a new post.
   * @type {string}
   */
  POST_CREATE: `/post/create`,

  /**
   * Endpoint for fetching all products from the store.
   * @type {string}
   */
  FETCH_STORE_PRODUCTS: (page: number) =>
    fmt(`%s/store/products?page=%s`, NEXT_PUBLIC_TS_EXPRESS_URL, page),

  /**
   * Endpoint for fetching a specific product from the store.
   * @type {string}
   */
  FETCH_PRODUCT: fmt(`%s/store/product`, NEXT_PUBLIC_TS_EXPRESS_URL),

  /**
   * Endpoint for fetching comments for a specific post.
   * @param {number} post_id - The ID of the post.
   * @returns {string} The URL to fetch comments for the specified post.
   */
  GET_COMMENTS: (post_id: string) => fmt(`%s/post/%s/comments`, NEXT_PUBLIC_TS_EXPRESS_URL, post_id),

  /**
   * Endpoint for fetching replies for a specific comment.
   * @param {string} comment_id - The ID of the comment.
   * @returns {string} The URL to fetch replies for the specified comment.
   */
  GET_COMMENT_REPLIES: (comment_id: string) =>
    fmt(`%s/post/comments/%s/replies`, NEXT_PUBLIC_TS_EXPRESS_URL, comment_id),

  /**
   * Endpoint for fetching posts for the home page.
   * @type {string}
   */
  GET_HOME_POSTS: `/feeds/home`,
  // GET_HOME_POSTS: `${NEXT_PUBLIC_TS_EXPRESS_URL}/home/posts`,

  /**
   * Endpoint for purchasing points
   * @type {string}
   */
  PURCHASE_POINTS: `/points/purchase`,

  /**
   * Endpoint for fetching conversionrate for points
   * @type {string}
   */
  GET_POINTS_CONVERSION_RATE: fmt(`%s/points/rate`, NEXT_PUBLIC_TS_EXPRESS_URL),

  /**
     *
     * Endpoint for upload progress posts
     * @type {string}

     */
  UPLOAD_POST_MEDIA_ENDPOINT: fmt(`%s/post/upload-post-media`, NEXT_PUBLIC_TS_EXPRESS_URL),
  /**
   *
   * Endpoint for fetching exchange rate
   */
  GET_PLATFROM_EXCHANGE_RATE: fmt(`%s/rates/platfrom-rate`, NEXT_PUBLIC_TS_EXPRESS_URL),

  /**
   * Endpoint for account suspended ticket.
   */

  ACCOUNT_SUSPENDED_TICKET: fmt(`%s/support/ticket`, NEXT_PUBLIC_TS_EXPRESS_URL),

  /**
   * Endpoint for fetching system configs
   * @type {string}
   */
  GET_SYSTEM_CONFIGS: fmt(`%s/configs`, NEXT_PUBLIC_TS_EXPRESS_URL),

  /**
   * Endpoint for store checkout
   * @type {string}
   */
  STORE_CHECKOUT: `/store/checkout`,

  /**
   * Endpoint for verifying payment
   * @param {string} reference - The payment reference
   * @returns {string} The URL to verify payment
   */
  VERIFY_PAYMENT: (reference: string) => fmt(`%s/store/verify-payment/%s`, NEXT_PUBLIC_TS_EXPRESS_URL, reference),

  /**
   * Endpoint for fetching user orders
   * @type {string}
   */
  GET_USER_ORDERS: `/store/orders`,

  /**
   * Endpoint for updating order status
   * @param {string} order_id - The order ID
   * @returns {string} The URL to update order status
   */
  UPDATE_ORDER_STATUS: (order_id: string) =>
    fmt(`%s/store/orders/%s/status`, NEXT_PUBLIC_TS_EXPRESS_URL, order_id),

  /**
   * Endpoint for adding product to wishlist
   * @type {string}
   */
  WISHLIST_ADD: fmt(`%s/wishlist/add`, NEXT_PUBLIC_TS_EXPRESS_URL),

  /**
   * Endpoint for removing product from wishlist
   * @param {string} product_id - The product ID
   * @returns {string} The URL to remove product from wishlist
   */
  WISHLIST_REMOVE: (product_id: string) =>
    fmt(`%s/wishlist/remove/%s`, NEXT_PUBLIC_TS_EXPRESS_URL, product_id),

  /**
   * Endpoint for fetching user's wishlist
   * @type {string}
   */
  WISHLIST_GET: fmt(`%s/wishlist`, NEXT_PUBLIC_TS_EXPRESS_URL),

  /**
   * Endpoint for checking if product is in wishlist
   * @param {string} product_id - The product ID
   * @returns {string} The URL to check wishlist status
   */
  WISHLIST_CHECK: (product_id: string) =>
    fmt(`%s/wishlist/check/%s`, NEXT_PUBLIC_TS_EXPRESS_URL, product_id),

  /**
   * Endpoint for getting wishlist count
   * @type {string}
   */
  WISHLIST_COUNT: fmt(`%s/wishlist/count`, NEXT_PUBLIC_TS_EXPRESS_URL),

  /**
   * Endpoint for clearing entire wishlist
   * @type {string}
   */
  WISHLIST_CLEAR: fmt(`%s/wishlist/clear`, NEXT_PUBLIC_TS_EXPRESS_URL),
};

export default ROUTE;
