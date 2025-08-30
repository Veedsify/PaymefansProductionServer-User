import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { AuthUserProps } from "@/features/user/types/user";

export const useUser = () => {
    return useQuery({
        queryKey: ["user"],
        queryFn: async (): Promise<Partial<AuthUserProps> | null> => {
            const token = getToken();

            if (!token) {
                throw new Error("No token found");
            }

            const response = await axiosInstance.get("/auth/retrieve", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200 && response.data?.user) {
                return response.data.user as AuthUserProps;
            }

            if (response.status === 401) {
                throw new Error("Unauthorized");
            }

            return null;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
};