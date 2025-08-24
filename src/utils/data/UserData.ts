import { AuthUserProps } from "@/types/User";
import { cookies, headers } from "next/headers";
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
    return res.data.user as AuthUserProps;
  } catch (error) {
    axios
      .post(`/auth/token/refresh`, {}, {
        withCredentials: true,
      })
      .then(() => {
        console.log("refresihing token");
        return;
      })
      .catch((err) => {
        console.log(err);
        const loginUrl = new URL("/login");
        redirect(loginUrl.toString());
      });
    return null;
  }
};
export default getUserData;
