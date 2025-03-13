import { useEffect, useState } from "react";
import { HiCamera } from "react-icons/hi";
import axiosServer from '@/utils/axios';
import { getToken } from "@/utils/cookie.get";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useStoryStore } from "@/contexts/story-context";

const StoryUploadForm = () => {
    const [selected, setSelected] = useState<File[]>([])
    const { addToStory } = useStoryStore()
    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileArrays = Array.from(e.target.files || [])
        setSelected(fileArrays)
    }
    const token = getToken()

    useEffect(() => {
        const UploadImagesAndAddToStory = async () => {
            const formData = new FormData()
            selected.forEach((file) => {
                formData.append("files[]", file)
            })
            try {
                toast.promise(axiosServer.post("/upload/story", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    }
                }), {
                    loading: "Uploading Media...",
                    success: "Media uploaded successfully",
                    error: (err: AxiosError) => {
                        console.error("Error while uploading images", err)
                        return "Error while uploading images"
                    }
                }).then(({ data }) => {
                    data.data.map((item: any) => {
                        addToStory({
                            id: Math.random() * 1000,
                            media_url: item.filename,
                            media_type: item.mimetype.split("/")[0]
                        })
                    })
                })

            } catch (err: unknown) {
                console.error("Error while uploading images", err)
            }
        }
        if (selected.length > 0) {
            UploadImagesAndAddToStory()
        }
    }, [selected, token, addToStory])


    return (
        <form className="flex-1 h-full">
            <label htmlFor="file"
                className="text-sm font-semibold w-full h-full flex flex-1 gap-3 flex-col items-center justify-center dark:hover:bg-gray-800 dark:bg-gray-900 dark:text-white p-5 hover:bg-gray-100 duration-300 ease-in-out">
                <HiCamera size={40} />
                <span>Select a photo or video</span>
                <input type="file" multiple id="file" onChange={handleSelect}
                    className="p-2 border-2 rounded-lg hidden" />
            </label>
        </form>
    );
}

export default StoryUploadForm;