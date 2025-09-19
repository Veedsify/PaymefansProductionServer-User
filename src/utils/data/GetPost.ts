import axios from "axios";
import axiosInstance from "../Axios";

export const getPost = async (postId: string) => {
  try {
    const request = await axiosInstance.post(
      `/post/single/${postId}`, {}
    );
    return request.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
