import axiosInstance from "../Axios";

export const GetUserPointBalance = async (user_id: number) => {
  return await axiosInstance.post(`/points/get-points`, { user_id });
};
