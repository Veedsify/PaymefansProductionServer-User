import { AuthUserProps } from "@/types/User";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios, { AxiosResponse } from "axios";
const getUserData = async (): Promise<Partial<AuthUserProps> | null> => {
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
          Authorization: `Bearer ${token?.value}`,
        },
      },
    );

    if (res.status === 200 && res.data?.user) {
      return res.data.user as AuthUserProps;
    }
    if (res.status === 401) {
      redirect("/login");
    }
    return null;
  } catch (error) {
    redirect("/login");
  }
};
export default getUserData;
