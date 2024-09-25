import { AuthUserProps, ProfileUserProps } from "@/types/user";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type getUserProfileProps = {
  user_id: string;
};

const getUserProfile = async ({ user_id }: getUserProfileProps) => {
  if (!cookies().get("token")?.value) redirect("/login");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_EXPRESS_URL}/profile/user`,
    {
      method: "POST",
      body: JSON.stringify({
        username: user_id,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies().get("token")?.value}`,
      },
    }
  );
  if (res.ok && res.status === 200) {
    const user = await res.json();
    if (user.status === true) {
      return user.user as ProfileUserProps;
    }
    return null;
  }
};

export default getUserProfile;
