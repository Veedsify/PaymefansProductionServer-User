import { AuthUserProps } from "@/features/user/types/user";
import { cookies } from "next/headers";
import axios, { AxiosResponse } from "axios";
const getUserData = async (): Promise<Partial<AuthUserProps> | null> => {
  const token = (await cookies()).get("token");
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
    return {
      email: "Guest",
      id: 0,
      name: "Guest",
      active_status: true,
      username: "@guest",
    };
  }
};
export default getUserData;
