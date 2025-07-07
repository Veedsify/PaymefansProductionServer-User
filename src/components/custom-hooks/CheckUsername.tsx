import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthUserProps } from "@/types/User";
import { getToken } from "@/utils/Cookie";
import _ from "lodash";
import useDebounce from "./Debounce"; // Adjust the import path as necessary
const useCheckUsername = (user: AuthUserProps, usernameCheck: string) => {
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
        const token = getToken();
        const api = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/settings/check-username?username=${usernameCheck}`;
        const response = await axios.post(
          api,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
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
