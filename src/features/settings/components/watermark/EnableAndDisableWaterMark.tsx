import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import Toggle from "@/components/common/toggles/Checked";
import axiosInstance from "@/utils/Axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EnableAndDisableWaterMark = () => {
    const [isWatermarkEnabled, setIsWatermarkEnabled] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["watermark"],
        queryFn: () => axiosInstance.get("/settings/watermark"),
    });

    useEffect(() => {
        if (!isLoading && data && data.data) {
            setIsWatermarkEnabled(data.data.enabled);
        }
    }, [data, isLoading]);

    const toggleWatermark = async () => {
        try {
            setIsWatermarkEnabled(!isWatermarkEnabled);
            const response = await axiosInstance.post("/settings/watermark", {
                enabled: !isWatermarkEnabled,
            });

            if (!response.data.error) {
                setIsWatermarkEnabled(!isWatermarkEnabled);
                toast.success(response.data.message, {
                    id: "togglewatermark",
                });
                return;
            }

            toast.error("Failed to Enable watermark");
        } catch (error) {
            toast.error("Failed to Enable watermark", {
                id: "togglewatermark",
            });
            await new Promise((resolve) => setTimeout(resolve, 500));
            setIsWatermarkEnabled(isWatermarkEnabled);
        }
    };

    return (
        <div>
            <h2 className="mt-10 mb-4 font-bold dark:text-white">
                Enable Watermark
            </h2>
            <p className="mb-3 dark:text-white">
                Enable watermark to add a watermark to your videos. This will
                help you identify your videos and prevent unauthorized use.
            </p>
            <div>
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <Toggle set={toggleWatermark} state={isWatermarkEnabled} />
                )}
            </div>
        </div>
    );
};

export default EnableAndDisableWaterMark;
