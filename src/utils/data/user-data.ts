import { AuthUserProps } from "@/types/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios, { AxiosResponse } from "axios";
const getUserData = async (): Promise<AuthUserProps | null> => {
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
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    if (res.status === 200 && res.data?.user) {
      return res.data.user as AuthUserProps;
    }
    if (res.status === 401) {
      redirect("/login");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log response if available
      // console.error("Error response:", error.response?.data);
      // console.error("Error status:", error.response?.status);
    } else {
      // console.error("Unexpected error:", error);
    }
    redirect("/login");
  }
};
export default getUserData;
