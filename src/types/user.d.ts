export type UserRegisterType = {
  name: string;
  email: string;
  phone: string;
  location: string;
  password: string;
  terms: string;
};

export type AuthUserProps = {
  id: number;
  email: string;
  name: string;
  fullname: string;
  user_id: string;
  username: string;
  admin: boolean;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_email_verified: boolean;
  is_model: boolean;
  email_verify_code: string | null;
  email_verify_time: string | null;
  is_phone_verified: boolean;
  phone: string;
  profile_image: string;
  profile_banner: string;
  bio: string | null;
  location: string;
  website: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zip: string | null;
  post_watermark: string | null;
  total_followers: number;
  total_following: number;
  total_subscribers: number;
  admin_status: boolean;
  created_at: Date;
  updated_at: Date;
  iat: number;
  exp: number;
  UserPoints: {
    points: number;
  };
  _count: {
    Follow: number;
    Subscribers: number
  }
  Settings?: {
    price_per_message: number;
    subscription_active: boolean;
    subscription_duration: number;
    enable_free_message: boolean;
    subscription_price: number;
  },
  following: number;
  Model?: {
    hookup: boolean;
    verification_status: boolean;
    verification_state: ' not_started' | 'pending' | 'approved' | 'rejected' | 'started';
  },
  subscriptions?: number[];
  purchasedPosts?: number[];
}

export type AllModelsProps = {
  id: number;
  email: string;
  name: string;
  fullname: string;
  user_id: string;
  username: string;
  admin: boolean;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_email_verified: boolean;
  is_model: boolean;
  email_verify_code: string | null;
  email_verify_time: string | null;
  is_phone_verified: boolean;
  phone: string;
  profile_image: string;
  profile_banner: string;
  bio: string | null;
  location: string;
  website: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zip: string | null;
  post_watermark: string | null;
  total_followers: number;
  total_following: number;
  total_subscribers: number;
  admin_status: boolean;
  created_at: Date;
  updated_at: Date;
  iat: number;
  exp: number;
};

export type UserUpdateProfileType = {
  profile_image?: File;
  name: string;
  email: string;
  location: string;
  bio: string | null;
  website: string | null;
  instagram?: string;
  twitter?: string;
  facebook?: string;
};

export type ProfileUserProps = {
  id: number;
  email: string;
  name: string;
  fullname: string;
  user_id: string;
  username: string;
  admin: boolean;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_email_verified: boolean;
  is_model: boolean;
  email_verify_code: string | null;
  email_verify_time: string | null;
  is_phone_verified: boolean;
  phone: string;
  profile_image: string;
  profile_banner: string;
  bio: string | null;
  location: string;
  website: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zip: string | null;
  post_watermark: string | null;
  total_followers: number;
  total_following: number;
  total_subscribers: number;
  admin_status: boolean;
  created_at: string;
  updated_at: string;
  Subscribers: {
    subscriber_id: number;
  }[];
};
