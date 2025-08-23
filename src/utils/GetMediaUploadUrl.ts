import { UploadResponseResponse } from "@/types/Components";
import { getMaxDurationBase64 } from "./GetVideoMaxDuration";
import axiosInstance from "./Axios";
export const GetUploadUrl = async (
  file: File,
  user: { username: string; shouldUseSignedUrls: boolean },
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
    shouldUseSignedUrls: user.shouldUseSignedUrls,
  };
  if (isVideo && maxVideoDuration) payload.maxDuration = maxVideoDuration;

  try {
    const response = await axiosInstance.post(
      `/post/media/signed-url`,
      payload,
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
