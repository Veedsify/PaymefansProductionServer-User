import { StoryType } from "@/contexts/story-context";
import axios from "axios";
import { getToken } from "../cookie.get";

async function SubmitUserStory(stories: StoryType[]) {     
     const token = getToken();
     const sendData =  await axios.post(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/save/story`, {
          stories
     },{
          headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
          }
     })

     if(!sendData) {
          return {
               success: false,
               message: "Failed to submit story"
          };
     }

     return {
          success: true,
          message: "Story submitted successfully"
     };
}

export default  SubmitUserStory;