import axios from "axios";
import type { StoryType } from "@/contexts/StoryContext";
import axiosInstance from "../Axios";
import { getToken } from "../Cookie";

async function SubmitUserStory(stories: StoryType[]) {
  const sendData = await axiosInstance.post(`/stories/save`, {
    stories,
  });

  if (!sendData) {
    return {
      success: false,
      message: "Failed to submit story",
    };
  }

  return {
    success: true,
    message: "Story submitted successfully",
  };
}

export default SubmitUserStory;
