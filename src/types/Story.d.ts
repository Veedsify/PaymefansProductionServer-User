
export type ApiResponse = {
     success: boolean;
     data: UserData[];
     count: number;
};

export type UserData = {
     user: User;
     stories: Story[];
     storyCount: number;
};

export type User = {
     id: number;
     username: string;
     profile_image: string;
     bio: string | null;
     fullname: string;
     name: string;
     LiveStream: unknown[]; // Define more specific export type if available
     Follow: unknown[];     // Define more specific export type if available
     Subscribers: unknown[]; // Define more specific export type if available
     role: string;
};

export type Story = {
     id: number;
     story_id: string;
     user_id: number;
     created_at: string;
     updated_at: string;
     user: User;
     StoryMedia: StoryMedia[];
};

export type StoryMedia = {
     id: number;
     media_id: string;
     media_type: string;
     filename: string;
     duration: number;
     caption: string;
     captionElements: string;
     story_content: string | null;
     media_url: string;
     user_id: number;
     created_at: string;
     updated_at: string;
     user: User
};

export type CaptionStyle = {
     color: string;
     fontSize: string;
     fontFamily: string;
     fontWeight: string;
};
