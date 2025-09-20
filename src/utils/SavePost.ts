import axios, { type AxiosProgressEvent } from "axios";
import toast from "react-hot-toast";
import ROUTE from "@/config/routes";
import type {
  RemovedMediaIdProps,
  UploadedImageProp,
} from "@/types/Components";
import axiosInstance from "./Axios";
import { getToken } from "./Cookie";

type SavePostType = {
  data: {
    media: UploadedImageProp[];
    content: string;
    visibility: string;
    removedMedia: RemovedMediaIdProps[];
    isWaterMarkEnabled?: boolean;
  };
  action: string;
  post_id: string;
};

export const SavePost = async ({ data, action, post_id }: SavePostType) => {
  try {
    const url =
      action === "create" ? ROUTE.POST_CREATE : `/post/update/${post_id}`;

    // Make an axios POST request with onUploadProgress to track the progress
    const res = await axiosInstance.post(url, data, {
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        // Calculate the progress percentage
        if (progressEvent?.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
        }
      },
    });

    return res.data;
  } catch (error: any) {
    toast.dismiss();
    return {
      status: false,
      message: error.response.data.message,
      error: true,
    };
  }
};
