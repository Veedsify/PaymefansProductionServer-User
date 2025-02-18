import axios, { AxiosProgressEvent } from "axios";
import { getToken } from "./cookie.get";
import ROUTE from "@/config/routes";
import toast from "react-hot-toast";

type SavePostType = {
    data: FormData;
    action: string;
    post_id: string;
    onProgress: (progress: number) => void;
};

export const SavePost = async ({ data, action, post_id, onProgress }: SavePostType) => {
    try {
        const token = getToken();
        const url = action === 'create' ? ROUTE.POST_CREATE : `${process.env.NEXT_PUBLIC_EXPRESS_URL}/post/update/${post_id}`;

        // Make an axios POST request with onUploadProgress to track the progress
        const res = await axios.post(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                "Authorization": `Bearer ${token}`
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                // Calculate the progress percentage
                if (progressEvent?.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress); // Call the provided onProgress function
                }
            }
        });

        return res.data;
    } catch (error: any) {
        toast.dismiss();
        return {
            status: false,
            message: error.response.data.message,
            error: true
        }
    }
};
