const NEXT_PUBLIC_EXPRESS_URL = process.env.NEXT_PUBLIC_EXPRESS_URL;

const ROUTE = {
  BANNER_IMAGE_UPLOAD: `${NEXT_PUBLIC_EXPRESS_URL}/profile/banner/change`,
  PROFILE_UPDATE: `${NEXT_PUBLIC_EXPRESS_URL}/profile/image/change`,
  POST_CREATE: `${NEXT_PUBLIC_EXPRESS_URL}/post/create`,
  FETCH_STORE_PRODUCTS: `${NEXT_PUBLIC_EXPRESS_URL}/store/products`,
  FETCH_PRODUCT: `${NEXT_PUBLIC_EXPRESS_URL}/store/product`,
  GET_COMMENTS: (post_id: number) =>
    `${NEXT_PUBLIC_EXPRESS_URL}/post/${post_id}/comments`,
  GET_HOME_POSTS: `${NEXT_PUBLIC_EXPRESS_URL}/home/posts` 
};

export default ROUTE;
