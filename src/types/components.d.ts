import { Call } from "@stream-io/video-react-sdk";
import React, { ChangeEvent, ReactNode, SetStateAction } from "react";
import { ProfileUserProps } from "./user";
import { LastMessage } from "./conversations";

// POST COMPONENT PROPS
export type PostShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
};

export type PostEditorProps = {
  posts?: {
    id: number;
    content: string;
    post_id: string;
    post_audience: "private" | "public" | "subscribers";
    created_at: string;
    post_likes: number;
    post_comments: number;
    post_reposts: number;
    PostLike: any[];
    UserMedia: UserMediaProps[];
  };
};

export interface PostData {
  id: number;
  post: string;
  post_id: string;
  content: string;
  post_audience: string;
  post_likes?: number;
  post_comments?: number;
  post_shares?: number;
  post_status: string;
  post_reposts?: number;
  post_impressions?: number;
  repost_username?: string;
  was_repost?: boolean;
  repost_id?: string;
  time: string;
  created_at: Date;
  likedByme: boolean;
  media: UserMediaProps[];
  user?: {
    id: number;
    name: string;
    username: string;
    user_id: string;
    is_model: boolean;
    profile_image: string;
  };
  PostComment?: PostCompomentProps[];
}

export interface BannerModalProps {
  user: any;
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}

export interface PostCommentAttachments {
  path: string;
  type: string;
  name: string;
}

export interface PostCompomentProps {
  id: number;
  date: string;
  profile_image: string;
  name: string;
  comment_id: string;
  userId: string; // or ObjectId
  postId: number;
  parentId: string | null;
  comment: string;
  replies: number;
  attachment: { name: string; path: string; type: string }[] | null;
  likes: number;
  impressions: number;
  username: string;
}

export interface UserMediaProps {
  id: number;
  media_id: string;
  post_id: number;
  media_type: string;
  media_state: "completed" | "processing";
  url: string;
  blur: string;
  poster: string;
  locked: boolean;
  accessible_to: string;
  created_at: string;
  updated_at: string;
  userId?: number;
  index: number;
}

interface RemovedMediaIdProps {
  id: string;
  type: string;
}

interface PostComponentProps {
  was_repost?: boolean;
  repost_username?: string;
  repost_id?: string;
  user: {
    id: number;
    user_id: string;
    name: string;
    link: string;
    username: string;
    image: string;
  };
  data: PostData;
}

interface VideoComponentProps {
  media: UserMediaProps;
  data: PostData;
  clickImageEvent: (media: UserMediaProps) => void;
  isSubscriber: boolean;
}

interface FileHolderProps {
  file: File;
  remove: (file: File) => void;
}

interface Comment {
  text: string;
  files: File[];
  author_username: string;
  time: Date;
  name: string;
  profile_image: string;
}

export interface ReplyPostProps {
  options: {
    id: number;
    post_id: string;
    post_audience: string;
    author_username: string;
    reply_to?: string;
    setNewComment?: (comment: Comment) => void;
  };
}

export type UserPostProps = {
  id: number;
  content: string;
  post_id: string;
  post_audience: string;
  post_likes: number;
  post_comments: number;
  post_shares: number;
  post_status: string;
  post_reposts: number;
  is_model: boolean;
  UserMedia: UserMediaProps[];
  created_at: Date;
  user: {
    id: number;
    user_id: string;
    name: string;
    username: string;
    profile_image: string;
    is_model: boolean;
    Subscribers: {
      subscriber_id: number;
    }[];
  };
  likedByme: boolean;
};

type UserPostPropsOther = {
  id: number;
  content: string;
  post_id: string;
  post_audience: string;
  post_status: string;
  post_likes: number;
  post_comments: number;
  post_shares: number;
  post_reposts: number;
  UserMedia: UserMediaProps[];
  likedByme: boolean;
  user: {
    id: number;
    name: string;
    username: string;
    user_id: string;
    is_model: boolean;
    profile_image: string;
    Subscribers: {
      subscriber_id: number;
    }[];
  };
  created_at: Date;
};

export type RespostPanelProps = {
  userdata?: ProfileUserProps;
};

export type RespotPanelFetchProps = {
  isForViewer: boolean;
  pageNumber: number;
  userdata?: ProfileUserProps;
};

// MESSAGE INPUT PROPS
export interface Attachment {
  type: string;
  extension: string;
  size: number;
  name: string;
  url: string;
}

export interface Message {
  message_id: number;
  message: string;
  sender_id: string;
  receiver_id?: string;
  attachment: Attachment[] | null;
  seen: boolean;
  conversationId?: string;
  created_at: string;
}

export interface MessageInputProps {
  sendMessage: ({}: Message) => void;
  sendTyping: (value: string) => void;
  receiver: any;
  isFirstMessage: boolean;
}

// MESSAGE BUBBLE PROPS
type MessageBubbleProps = {
  message?: string | TrustedHTML;
  attachment: Attachment[] | null;
  sender: string;
  seen: boolean;
  date: string;
};

// MESSAGE CONVERSATION PROPS
interface UserConversations {
  conversation: Conversation;
  conversation_id: string;
  lastMessage: LastMessage;
  receiver: {
    user_id: string;
    username: string;
    name: string;
    profile_image: string;
  };
}

// MESSAGE CONVERSATION CONTEXT PROPS
export interface MessagesConversationContextValue {
  count?: number;
  hasMore: boolean;
  conversations: UserConversations[];
  lastMessage?: LastMessage;
  addConversations?: (conversations: Conversation) => void;
}

// POST AUDIENCE DATA PROPS

type OwnerOption =
  | {
      name: string;
      icon: React.ReactNode;
      func?: (e: React.MouseEvent<HTMLButtonElement>) => void;
      link?: undefined;
    }
  | { name: string; icon: React.ReactNode; func?: undefined; link?: URL };

export interface PostAudienceDataProps {
  id: number;
  name: "Public" | "Subscribers" | "Price";
  icon: React.JSX.Element;
}
type postAudienceDataProps2 = {
  id: number;
  name: string;
  icon: React.JSX.Element;
};
type UploadedImageProp = {
  public: string;
  blur: string;
  id: string;
  fileId: string;
  type: string;
};
type postAudienceDataProps = {
  id: number;
  name: "Public" | "Subscribers" | "Price";
  icon: JSX.Element;
};

// COMMENT AND REPLY PROPS
interface Comment {
  text: string;
  files: File[];
  author_username: string;
  time: Date;
  name: string;
  profile_image: string;
}

// FOLLOWERS DISPLAY PROPS
interface PaginateProps {
  min: number;
  max: number;
}

export interface Followers {
  user: {
    id: string;
    username: string;
    fullname: string;
    profile_image: string;
    name: string;
  };
  iAmFollowing: boolean;
}

// UPLOAD MEDIA PROPS
type UploadMediaCompProps = {
  open: boolean;
  close: () => void;
  sendNewMessage: (attachment: Attachment[]) => void;
  setMessage: (message: string) => void;
  message: string;
};

// MEDIA PANEL IMAGE CARD PROPS
type MediaType = { media: string; type: string } | null;
type MediaDataType = {
  id: number;
  url: string;
  blur: string;
  media_state: "completed" | "processing";
  locked: boolean;
  media_type: string;
  duation: string;
  poster?: string;
};

// MEDIA PANEL IMAGE CARD OTHER PROPS
type MediaDataTypeOtherProps = {
  id: number;
  url: string;
  blur: string;
  locked: boolean;
  media_type: string;
  media_state: "completed" | "processing";
  poster?: string;
  duration: string;
  media_id: string;
  accessible_to: string;
  post: {
    id: number;
    user: {
      id: number;
    };
  };
};

// UPLOAD MEDIA PREVIEW PROPS
interface MediaPreviewProps {
  files: FileList;
  setMessage: (message: string) => void;
  sendNewMessage: (attachment: Attachment[]) => void;
  close: () => void;
  message: string;
}

interface PreviewTypes {
  type: "image" | "video";
  src: string;
  poster?: string;
}

// USER FOLLOW COMP PROPS
interface UserFollowCompProps {
  follower: {
    user: {
      id: string;
      username: string;
      fullname: string;
      profile_image: string;
      name: string;
    };
    iAmFollowing: boolean;
  };
}

// Story Types
interface StoryHeaderProps {
  profileImage: string;
  username: string;
  timestamp: string;
}

interface SelectMoreProps {
  openMore: boolean;
  handleOpenMore: () => void;
}

type Story = {
  id?: number;
  url: string;
  caption?: string;
  user: {
    id: number;
    username: string;
    profile_image: string;
  };
  created_at: string;
  type: string;
  duration: number;
};

type StoryPreviewProps = {
  className: string;
  onAllStoriesEnd: () => Promise<void>;
  stories: Story[];
};

type StoryPreviewControlProps = {
  type: string;
  moveToNextSlide: () => void;
  clickToPlay: () => void;
  playVideoOnLoad: (canplay: boolean) => void;
  moveToPrevSlide: () => void;
  stories: Story[];
  index: number;
};

interface StoryMediaFetchProps {
  page: number;
}

interface StoryCaptionComponentProps {
  close: () => void;
}

// Active Profile Tag Props
type ActiveProfileTagProps = {
  userid: string;
  scale?: number;
  withText?: boolean;
};

type handleActiveUsersProps = {
  username: string;
};

type MediaDeviceInfo = {
  deviceId: string;
  kind: string;
  label: string;
};

type StreamStatsProp = {
  streamData: streamDataProps;
  participantCount: number;
  handleCameraChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  devices: MediaDeviceInfo[];
  handleMuteMic: () => void;
  isMicEnabled: boolean;
  handleCamDisable: () => void;
  isCamEnabled: boolean;
  handleLiveStreamEnd: () => void;
  isLive: boolean;
  call?: Call;
  handleCreateStream: () => void;
};

type streamDataProps = {
  title: string;
  user_id: string;
  participants: number;
  stream_call_id: string;
  stream_token: string;
  stream_id: string;
  stream_call_id: string;
  user: {
    user_id: string;
    username: string;
    profile_image: string;
    profile_banner: string;
    email: string;
    name: string;
  };
  user_stream_id: string;
  authToken: string;
};

type LiveStreamSocketProps = {
  streamId: string | string[];
};

export type QuickPostActionsProps = {
  options: {
    content: string;
    post_id: string;
    post_audience: string;
    username: string;
  };
};

type ImageCompProps = {
  media: UserMediaProps;
  data: PostData;
  clickImageEvent: (media: UserMediaProps) => void;
};

//Subscriptions Tiers

type SubscriptionTiersProps = {
  tier_name: string;
  tier_price: number;
  tier_description: string;
  tier_duration: string;
  subscription_id?: string;
};

// Store Types

type StoreProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  instock: number;
  product_id: string;
  category: {
    name: string;
  };
  images: {
    id: number;
    image_url: string;
  }[];
  sizes: {
    size: {
      name: string;
    };
  }[];
};

type StoreAllProductsResponse =
  | {
      error: boolean;
      message: string;
      totalProducts: number;
      hasMore: boolean;
      data: StoreProduct[];
    }
  | {
      error: boolean;
      message: string;
      data: null;
    };

export type Product = {
  id: number;
  product_id: string;
  name: string;
  description: string;
  price: number;
  instock: number;
  category: {
    name: string;
  };
  images: {
    id: number;
    image_url: string;
  }[];
  sizes: {
    size: {
      name: string;
    };
  }[];
};

export type fetstoreProps = {
  error: boolean;
  message?: string;
  data?: Product[];
};

export type fetchSingleProps = {
  error: boolean;
  message?: string;
  data?: Product;
};

//Help
export type HelpCategoryProp = {
  name: string;
  description?: string;
  id: number;
};
