import axiosInstance from "@/utils/Axios";

const getSideModels = async ({limit}: { limit?: number }) => {
    const res = await axiosInstance(`/models/all`, {
        method: "POST",
        data: {
            limit,
        },
    });

    const {models} = await res.data
    return models;

};

export default getSideModels;
