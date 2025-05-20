import { AuthUserProps, ProfileUserProps } from "@/types/user";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type getUserProfileProps = {
    user_id: string;
};

const getUserProfile = async ({ user_id }: getUserProfileProps) => {
    const token = (await cookies()).get("token");
    if (token?.value == '' || token?.value == null) redirect("/login");
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/user`,
        {
            method: "POST",
            body: JSON.stringify({
                username: user_id,
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.value}`,
            },
        }
    );
    if (res.ok && res.status === 200) {
        const user = await res.json();
        if (user.status === true) {
            return user.user as ProfileUserProps;
        }
        return null;
    } else {
        return null;
    }
};

export default getUserProfile;
