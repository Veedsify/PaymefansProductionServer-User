"use server"
import { AuthUserProps } from "@/types/user";
import axiosInstance from "../axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AxiosResponse } from "axios";

const getUserData = async (): Promise<AuthUserProps | null> => {
  const token = (await cookies()).get("token");

  if (!token) {
    redirect("/login");
  }

  try {
    const res: AxiosResponse<{ user: AuthUserProps }> = await axiosInstance.get(
      `${process.env.NEXT_PUBLIC_EXPRESS_URL}/retrieve`,
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
};

export default getUserData;
