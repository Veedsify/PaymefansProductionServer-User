import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";

export interface StoryMentionUser {
  id: number;
  user_id: string;
  username: string;
  name: string;
  profile_image: string;
}

export interface StoryMention {
  id: number;
  story_media_id: string;
  mentioned_user_id: number;
  mentioner_id: number;
  created_at: string;
  mentioned_user: StoryMentionUser;
}

export interface FetchStoryMentionsResponse {
  error: boolean;
  message: string;
  data: {
    mentions: StoryMention[];
    storyMediaId: string;
  };
}

export interface AddStoryMentionsResponse {
  error: boolean;
  message: string;
  data: {
    storyMediaId: string;
    mentionedUserIds: number[];
  };
}

export const fetchStoryMentions = async (
  storyMediaId: string,
): Promise<FetchStoryMentionsResponse> => {
  try {
    const response = await axiosInstance.get(
      `/story/mentions/${storyMediaId}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching story mentions:", error);
    throw error.response?.data || error;
  }
};

export const addStoryMentions = async (
  storyMediaId: string,
  mentionedUserIds: number[],
): Promise<AddStoryMentionsResponse> => {
  console.log("Adding story mentions:", { storyMediaId, mentionedUserIds });
  try {
    const response = await axiosInstance.post("/stories/mentions", {
      storyMediaId,
      mentionedUserIds,
    });
    console.log("Add mentions response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding story mentions:", error);
    throw error;
  }
};
