"use client";

import { useUserAuthContext } from "@/lib/userUseContext";
import { useEffect, useState } from "react";
import Toggle from "./checked";
import { getToken } from "@/utils/cookie.get";
import toast from "react-hot-toast";
import _ from "lodash"

const TwoFactorAuth = () => {
  const { user } = useUserAuthContext();
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const token = getToken();
  const toggleTwoFactorAuthentication = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/two-factor-authentication`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ two_factor_auth: !twoFactorAuth }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setTwoFactorAuth(!twoFactorAuth);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update two factor authentication");
    }
  };

  // Debounce the toggleTwoFactorAuthentication function
  const debouncedToggleTwoFactorAuthentication = _.debounce(
    toggleTwoFactorAuthentication,
    300
  );
  useEffect(() => {
    setTwoFactorAuth(user?.Settings?.two_factor_auth!);
  }, [user]);
  return (
    <div>
      <h2 className="mb-4 font-bold mt-10 dark:text-white">Two Factor Authentication</h2>
      <p className="mb-3 dark:text-white">
        When you log in, you will be asked for a verification code sent to your
        email address. This code is valid for 30 minutes.
      </p>
      <div>
        <Toggle set={debouncedToggleTwoFactorAuthentication} state={twoFactorAuth} />
      </div>
    </div>
  );
};

export default TwoFactorAuth;
