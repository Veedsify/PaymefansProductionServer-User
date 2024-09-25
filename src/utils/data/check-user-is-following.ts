import { AuthUserProps } from "@/types/user";
import { cookies } from "next/headers";

export const checkUserIsFollowing = async (
  user: any,
  thisuser: any
) => {
  return fetch(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/follow/check`, {
    method: "POST",
    body: JSON.stringify({
      userId: user?.user_id,
      followerId: thisuser?.user_id,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies().get("token")?.value}`,
    },
  }).then((res) => res.json());
};
