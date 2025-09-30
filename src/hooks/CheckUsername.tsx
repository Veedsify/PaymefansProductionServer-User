import { useEffect, useState } from "react";
import type { AuthUserProps } from "@/features/user/types/user";
import axiosInstance from "@/utils/Axios";

const useCheckUsername = (
  user: Partial<AuthUserProps>,
  usernameCheck: string,
) => {
  const [canSave, setCanSave] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const setUpUsernameCheck = async () => {
      try {
        if (!usernameCheck || usernameCheck == "") {
          setIsloading(false);
          setCanSave(true);
          setMessage("");
          return;
        }
        setIsloading(true);
        setCanSave(true);
        setMessage("");
        const api = `/settings/check-username?username=${usernameCheck}`;
        const response = await axiosInstance.post(api, {});
        if (!response.data.error) {
          setError(false);
          setMessage(response.data.message);
          setCanSave(true);
          setIsloading(false);
        }
      } catch (error: any) {
        setMessage(
          error.response.data.message ||
            error.response.message ||
            "An Error Occured",
        );
        setError(true);
        setIsloading(false);
        setCanSave(false);
      }
    };

    setUpUsernameCheck();
  }, [user, usernameCheck]);
  return { canSave, message, error, isLoading };
};
export default useCheckUsername;
