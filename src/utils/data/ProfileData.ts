import { ProfileUserProps } from "@/types/User";
import { getToken } from "../Cookie";

type getUserProfileProps = {
    user_id: string;
};

const getUserProfile = async ({ user_id }: getUserProfileProps) => {
    const token = getToken()
    const username = user_id.startsWith('@') ? user_id : `@${user_id}`;
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/user`,
        {
            method: "POST",
            body: JSON.stringify({
                username: username,
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    if (!res.ok) {
        throw new Error("Failed to fetch user profile");
    }
    const data = await res.json();
    if (data.status) {
        return data.user as ProfileUserProps;
    }
    return null;
}


export default getUserProfile;
