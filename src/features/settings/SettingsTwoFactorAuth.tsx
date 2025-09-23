"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/contexts/UserUseContext";
import axiosInstance from "@/utils/Axios";
import Toggle from "../../components/common/toggles/Checked";
import { debounce } from "lodash-es";

const TwoFactorAuth = () => {
  const { user } = useAuthContext();
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const toggleTwoFactorAuthentication = async () => {
    try {
      const response = await axiosInstance.post(
        `/auth/two-factor-authentication`,
        { two_factor_auth: !twoFactorAuth }
      );
      const data = response.data;
      if (data.success) {
        toast.success(data.message);
        setTwoFactorAuth(!twoFactorAuth);
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to update two factor authentication");
    }
  };

  // Debounce the toggleTwoFactorAuthentication function
  const debouncedToggleTwoFactorAuthentication = debounce(
    toggleTwoFactorAuthentication,
    300
  );
  useEffect(() => {
    setTwoFactorAuth(user?.Settings?.two_factor_auth!);
  }, [user]);
  return (
    <div>
      <h2 className="mt-10 mb-4 font-bold dark:text-white">
        Two Factor Authentication
      </h2>
      <p className="mb-3 dark:text-white">
        When you log in, you will be asked for a verification code sent to your
        email address. This code is valid for 30 minutes.
      </p>
      <div>
        <Toggle
          set={debouncedToggleTwoFactorAuthentication}
          state={twoFactorAuth}
        />
      </div>
    </div>
  );
};

export default TwoFactorAuth;
