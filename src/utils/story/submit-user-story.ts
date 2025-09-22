import type { StoryType } from "@/contexts/StoryContext";
import axiosInstance from "../Axios";

interface SubmitUserStoryResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    user_id: number;
    story_id: string;
    created_at: string;
    updated_at: string;
    StoryMedia: Array<{
      id: number;
      media_id: string;
      media_type: string;
      filename: string;
      media_url: string;
      media_state: string;
      duration: number;
      story_content?: string;
      captionElements?: string;
      user_story_id: number;
      created_at: string;
      updated_at: string;
    }>;
  } | null;
}

async function SubmitUserStory(
  stories: StoryType[],
): Promise<SubmitUserStoryResponse> {
  try {
    const sendData = await axiosInstance.post(`/stories/save`, {
      stories,
    });

    if (!sendData || !sendData.data) {
      return {
        success: false,
        message: "Failed to submit story",
        data: null,
      };
    }

    return {
      success: true,
      message: "Story submitted successfully",
      data: sendData.data.data, // Return the story data from the server
    };
  } catch (error) {
    console.error("Error submitting story:", error);
    return {
      success: false,
      message: "Failed to submit story",
      data: null,
    };
  }
}

export default SubmitUserStory;
