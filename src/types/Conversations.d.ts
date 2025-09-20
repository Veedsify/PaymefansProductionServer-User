export interface Message {
  id: number;
  message_id: string;
  sender_id: string;
  receiver_id: string;
  seen: boolean;
  message: string;
  attachment: any[];
  created_at: string;
  updated_at: string;
  conversationsId: string;
}

export interface Conversation {
  id: number;
  user_id: string;
  name: string;
  username: string;
  profile_image: string;
  Messages: Message[];
}

export interface LastMessage {
  id: number;
  message_id: string;
  sender_id: string;
  receiver_id: string;
  seen: boolean;
  message: string;
  attachment: any[];
  created_at: string;
  updated_at: string;
  conversationsId: string;
}
