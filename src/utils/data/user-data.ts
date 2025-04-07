import { AuthUserProps } from "@/types/user";
import axiosInstance from "../axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import { cache } from "react";

const getUserData = cache(async (): Promise<AuthUserProps | null> => {
  const token = (await cookies()).get("token");

  if (!token) {
    redirect("/login");
  }

  try {
    const res: AxiosResponse<{ user: AuthUserProps }> = await axios.get(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/retrieve`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.value}`,
        }
      }
    );

    if (res.status === 200 && res.data?.user) {
      return res.data.user as AuthUserProps;
    }

    return null;

  } catch (error) {
    console.error('Error fetching user data:', error);
    redirect("/login");
    return null;
  }
});

export default getUserData;
