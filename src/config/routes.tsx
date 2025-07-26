const NEXT_PUBLIC_TS_EXPRESS_URL = process.env.NEXT_PUBLIC_TS_EXPRESS_URL;

/**
 * An object containing various API route endpoints for the application.
 */
const ROUTE = {
  /**
   * Endpoint for uploading a banner image for a profile.
   * @type {string}
   */
  BANNER_IMAGE_UPLOAD: `${NEXT_PUBLIC_TS_EXPRESS_URL}/profile/banner/change`,

  /**
   * Endpoint for updating the profile image.
   * @type {string}
   */
  PROFILE_UPDATE: `${NEXT_PUBLIC_TS_EXPRESS_URL}/profile/update`,

  /**
   * Endpoint for creating a new post.
   * @type {string}
   */
  POST_CREATE: `${NEXT_PUBLIC_TS_EXPRESS_URL}/post/create`,

  /**
   * Endpoint for fetching all products from the store.
   * @type {string}
   */
  FETCH_STORE_PRODUCTS: (page: number) =>
    `${NEXT_PUBLIC_TS_EXPRESS_URL}/store/products?page=${page}`,

  /**
   * Endpoint for fetching a specific product from the store.
   * @type {string}
   */
  FETCH_PRODUCT: `${NEXT_PUBLIC_TS_EXPRESS_URL}/store/product`,

  /**
   * Endpoint for fetching comments for a specific post.
   * @param {number} post_id - The ID of the post.
   * @returns {string} The URL to fetch comments for the specified post.
   */
  GET_COMMENTS: (post_id: string) =>
    `${NEXT_PUBLIC_TS_EXPRESS_URL}/post/${post_id}/comments`,

  /**
   * Endpoint for fetching posts for the home page.
   * @type {string}
   */
  GET_HOME_POSTS: `${NEXT_PUBLIC_TS_EXPRESS_URL}/feeds/home`,
  // GET_HOME_POSTS: `${NEXT_PUBLIC_TS_EXPRESS_URL}/home/posts`,

  /**
   * Endpoint for purchasing points
   * @type {string}
   */
  PURCHASE_POINTS: `${NEXT_PUBLIC_TS_EXPRESS_URL}/points/purchase`,

  /**
   * Endpoint for fetching conversionrate for points
   * @type {string}
   */
  GET_POINTS_CONVERSION_RATE: `${NEXT_PUBLIC_TS_EXPRESS_URL}/points/rate`,

  /**
     *
     * Endpoint for upload progress posts
     * @type {string}

     */
  UPLOAD_POST_MEDIA_ENDPOINT: `${NEXT_PUBLIC_TS_EXPRESS_URL}/post/upload-post-media`,
  /**
   *
   * Endpoint for fetching exchange rate
   */
  GET_PLATFROM_EXCHANGE_RATE: `${NEXT_PUBLIC_TS_EXPRESS_URL}/rates/platfrom-rate`,

  /**
   * Endpoint for account suspended ticket.
   */

  ACCOUNT_SUSPENDED_TICKET: `${NEXT_PUBLIC_TS_EXPRESS_URL}/support/ticket`,

  /**
   * Endpoint for fetching system configs
   * @type {string}
   */
  GET_SYSTEM_CONFIGS: `${NEXT_PUBLIC_TS_EXPRESS_URL}/configs`,

  /**
   * Endpoint for store checkout
   * @type {string}
   */
  STORE_CHECKOUT: `${NEXT_PUBLIC_TS_EXPRESS_URL}/store/checkout`,

  /**
   * Endpoint for verifying payment
   * @param {string} reference - The payment reference
   * @returns {string} The URL to verify payment
   */
  VERIFY_PAYMENT: (reference: string) =>
    `${NEXT_PUBLIC_TS_EXPRESS_URL}/store/verify-payment/${reference}`,

  /**
   * Endpoint for fetching user orders
   * @type {string}
   */
  GET_USER_ORDERS: `${NEXT_PUBLIC_TS_EXPRESS_URL}/store/orders`,

  /**
   * Endpoint for updating order status
   * @param {string} order_id - The order ID
   * @returns {string} The URL to update order status
   */
  UPDATE_ORDER_STATUS: (order_id: string) =>
    `${NEXT_PUBLIC_TS_EXPRESS_URL}/store/orders/${order_id}/status`,

  /**
   * Endpoint for adding product to wishlist
   * @type {string}
   */
  WISHLIST_ADD: `${NEXT_PUBLIC_TS_EXPRESS_URL}/wishlist/add`,

  /**
   * Endpoint for removing product from wishlist
   * @param {string} product_id - The product ID
   * @returns {string} The URL to remove product from wishlist
   */
  WISHLIST_REMOVE: (product_id: string) =>
    `${NEXT_PUBLIC_TS_EXPRESS_URL}/wishlist/remove/${product_id}`,

  /**
   * Endpoint for fetching user's wishlist
   * @type {string}
   */
  WISHLIST_GET: `${NEXT_PUBLIC_TS_EXPRESS_URL}/wishlist`,

  /**
   * Endpoint for checking if product is in wishlist
   * @param {string} product_id - The product ID
   * @returns {string} The URL to check wishlist status
   */
  WISHLIST_CHECK: (product_id: string) =>
    `${NEXT_PUBLIC_TS_EXPRESS_URL}/wishlist/check/${product_id}`,

  /**
   * Endpoint for getting wishlist count
   * @type {string}
   */
  WISHLIST_COUNT: `${NEXT_PUBLIC_TS_EXPRESS_URL}/wishlist/count`,

  /**
   * Endpoint for clearing entire wishlist
   * @type {string}
   */
  WISHLIST_CLEAR: `${NEXT_PUBLIC_TS_EXPRESS_URL}/wishlist/clear`,
};

export default ROUTE;
