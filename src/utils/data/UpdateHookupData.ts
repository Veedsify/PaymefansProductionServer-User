import axiosInstance from "../Axios";

export const updateHookupData = async ({ hookup }: { hookup: boolean }) => {
  const response = axiosInstance.post(`/settings/update/hookup-status`, {
    hookup,
  });

  return response;
};
