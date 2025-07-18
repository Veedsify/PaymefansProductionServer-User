import { UploadResponseResponse } from "@/types/Components";
import { getMaxDurationBase64 } from "./GetVideoMaxDuration";
import { getToken } from "./Cookie";
import axios from "axios";

const token = getToken();

export const GetUploadUrl = async (
    file: File,
    user: { username: string }
): Promise<UploadResponseResponse> => {
    if (!file) throw new Error("File is not defined");
    const isVideo = file.type.startsWith("video/");
    const maxVideoDuration = isVideo ? await getMaxDurationBase64(file) : null;
    const payload: any = {
        type: isVideo ? "video" : "image",
        fileName: btoa(`paymefans-attachment-${user?.username}-${Date.now()}`),
        fileSize: file.size,
        fileType: btoa(file.type),
        explicitImageType: file.type,
    };
    if (isVideo && maxVideoDuration) payload.maxDuration = maxVideoDuration;

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/media/signed-url`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        if (response.data.error) {
            throw new Error(response.data.message || "Failed to get upload URL");
        }
        return response.data as UploadResponseResponse;
    } catch (error) {
        console.error("Error getting upload URL:", error);
        throw new Error("Failed to get upload URL. Please try again.");
    }
};