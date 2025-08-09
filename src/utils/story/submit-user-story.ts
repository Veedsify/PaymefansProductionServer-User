import { StoryType } from "@/contexts/StoryContext";
import axios from "axios";
import { getToken } from "../Cookie";
import axiosInstance from "../Axios";

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
