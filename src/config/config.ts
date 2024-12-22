const POST_CONFIG = {
    MODEL_POST_LIMIT: 30,
    MODEL_POST_LIMIT_ERROR_MSG: `Models can only upload 30 files per post`,  // Fixed typo here
    USER_POST_LIMIT: 5,
    USER_POST_LIMIT_ERROR_MSG: "Models can only upload 5 files per post",
    QUICK_ACTION_CONFIG: {
        VISIBILITY_SUCCESSFUL: "Post Visibility Has Been Set Successfully"
    },
    POST_CREATED_SUCCESS_MSG: "Post Created Successfully",
    POST_DELETED_SUCCESS_MSG: "Post Deleted Successfully",
    COMMENT: {
        COMMENT_CREATED_SUCCESS_MSG: "Post Comment Created Successfully",
    }
}

const LOGIN_CONFIG = {
    LOGIN_SUCCESSFUL_MSG: `Login successfully.`,
}

export {POST_CONFIG, LOGIN_CONFIG}