import axios from "axios";
type UploadImageToCloudflareProps = {
      file: File;
      setProgress: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
      setUploadError: React.Dispatch<
            React.SetStateAction<{ [key: string]: boolean }>
      >;
      uploadUrl: string;
      id: string;
};
export default async function UploadImageToCloudflare({
      file,
      setProgress,
      setUploadError,
      id,
      uploadUrl,
}: UploadImageToCloudflareProps) {
      try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await axios.post(uploadUrl, formData, {
                  onUploadProgress: (progressEvent) => {
                        const percentage = Math.round(
                              (progressEvent.loaded * 100) /
                              (progressEvent.total ?? progressEvent.loaded)
                        );
                        setProgress((prev) => ({
                              ...prev,
                              [id]: percentage,
                        }));
                  },
            });
            if (response.status === 200) {
                  setProgress((prev) => ({
                        ...prev,
                        [id]: 100,
                  }));
                  console.log(response.data);
                  return response.data;
            } else {
                  throw new Error("Upload failed");
            }
      } catch (error) {
            setUploadError((prev) => ({
                  ...prev,
                  [id]: true,
            }));
            console.error("Image upload error:", error);
            throw error;
      }
}
