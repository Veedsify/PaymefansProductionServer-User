const POST_CONFIG = {
    MODEL_POST_LIMIT: 30,
    MODEL_POST_LIMIT_ERROR_MSG: `Models can only upload 30 files per post`,  // Fixed typo here
    USER_POST_LIMIT: 5,
    USER_POST_LIMIT_ERROR_MSG: "Users can only upload 5 files per post",
    QUICK_ACTION_CONFIG: {
        VISIBILITY_SUCCESSFUL: "Post Visibility Has Been Set Successfully"
    },
    POST_CREATED_SUCCESS_MSG: "Post Created Successfully",
    POST_DELETED_SUCCESS_MSG: "Post Deleted Successfully",
    POST_DELETING_STATUS: "Deleting post...",
    COMMENT: {
        COMMENT_CREATED_SUCCESS_MSG: "Post Comment Created Successfully",
    },
    IMAGE_FILE_SIZE_LIMIT: 10000000,
    IMAGE_FILE_SIZE_LIMIT_ERROR_MSG: "File size should not exceed 10MB",
}

const LOGIN_CONFIG = {
    LOGIN_SUCCESSFUL_MSG: `Login successfully.`,
}

const PROFILE_CONFIG = {
    PROFILE_UPDATED_SUCCESS_MSG: `Profile updated successfully.`,
    PROFILE_UPDATED_ERROR_MSG: `Failed to update profile.`,
    PROFILE_UPDATING_MSG: `Updating profile...`,
    PROFILE_IMAGE_CHANGE_SUCCESS_MSG: `Profile image changed successfully.`,
    PROFILE_IMAGE_CHANGE_ERROR_MSG: `Failed to change profile image.`,
    PROFILE_IMAGE_CHANGE_LIMIT_ERROR_MSG: `Profile image change limit reached.`,
    PROFILE_IMAGE_CHANGE_LIMIT: 5,
}

const POINTS_CONFIG = {
    POINT_MINIMUM_DEPOSIT: 2000,
    POINTS_PURCHASE_FAILED: `Sorry An Error Occured While Purchasing Points`,
    POINT_PENDING_PAYMENTS:  `Processing Payments...`,
    POINTS_PURCHASE_SUCCESSFUL: `Point Purchase Successful`,
    POINTS_MINIMUM_DEPOSIT_ERROR: `Minimum deposit is 2000`
}

export {POST_CONFIG, LOGIN_CONFIG, PROFILE_CONFIG, POINTS_CONFIG}
