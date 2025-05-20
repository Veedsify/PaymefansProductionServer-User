import { ProfileUserProps } from "@/types/user";
import { getToken } from "../cookie.get";

type getUserProfileProps = {
    user_id: string;
};

const getUserProfile = async ({ user_id }: getUserProfileProps) => {
    const token = getToken()
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/user`,
        {
            method: "POST",
            body: JSON.stringify({
                username: user_id,
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
