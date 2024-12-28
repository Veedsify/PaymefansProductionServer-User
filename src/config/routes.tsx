const NEXT_PUBLIC_EXPRESS_URL = process.env.NEXT_PUBLIC_EXPRESS_URL

const ROUTE = {
     BANNER_IMAGE_UPLOAD: `${NEXT_PUBLIC_EXPRESS_URL}/profile/banner/change`,
     PROFILE_UPDATE: `${NEXT_PUBLIC_EXPRESS_URL}/profile/image/change`,
     POST_CREATE: `${NEXT_PUBLIC_EXPRESS_URL}/post/create`,
}

export default ROUTE
