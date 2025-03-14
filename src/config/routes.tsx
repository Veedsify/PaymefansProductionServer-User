const NEXT_PUBLIC_EXPRESS_URL = process.env.NEXT_PUBLIC_EXPRESS_URL;

/**
 * An object containing various API route endpoints for the application.
 */
const ROUTE = {
  /**
   * Endpoint for uploading a banner image for a profile.
   * @type {string}
   */
  BANNER_IMAGE_UPLOAD: `${NEXT_PUBLIC_EXPRESS_URL}/profile/banner/change`,

  /**
   * Endpoint for updating the profile image.
   * @type {string}
   */
  PROFILE_UPDATE: `${NEXT_PUBLIC_EXPRESS_URL}/profile/image/change`,

  /**
   * Endpoint for creating a new post.
   * @type {string}
   */
  POST_CREATE: `${NEXT_PUBLIC_EXPRESS_URL}/post/create`,

  /**
   * Endpoint for fetching all products from the store.
   * @type {string}
   */
  FETCH_STORE_PRODUCTS: `${NEXT_PUBLIC_EXPRESS_URL}/store/products`,

  /**
   * Endpoint for fetching a specific product from the store.
   * @type {string}
   */
  FETCH_PRODUCT: `${NEXT_PUBLIC_EXPRESS_URL}/store/product`,

  /**
   * Endpoint for fetching comments for a specific post.
   * @param {number} post_id - The ID of the post.
   * @returns {string} The URL to fetch comments for the specified post.
   */
  GET_COMMENTS: (post_id: number) =>
    `${NEXT_PUBLIC_EXPRESS_URL}/post/${post_id}/comments`,

  /**
   * Endpoint for fetching posts for the home page.
   * @type {string}
   */
  GET_HOME_POSTS: `http://localhost:3009/api/feeds/home`,
  // GET_HOME_POSTS: `${NEXT_PUBLIC_EXPRESS_URL}/home/posts`,

  /**
   * Endpoint for purchasing points
   * @type {string}
   */
  PURCHASE_POINTS: `${NEXT_PUBLIC_EXPRESS_URL}/points/purchase`,

  /**
   * Endpoint for fetching conversionrate for points
   * @type {string}
   */
  GET_POINTS_CONVERSION_RATE: `${NEXT_PUBLIC_EXPRESS_URL}/point/rate`,

  /**
     * 
     * Endpoint for upload progress posts
     * @type {string}
    
     */
  UPLOAD_POST_MEDIA_ENDPOINT: `${NEXT_PUBLIC_EXPRESS_URL}/post/upload-post-media`,
};

export default ROUTE;
