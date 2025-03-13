import axios from "axios";

export const UpdateLastMessageSeen = async (conversation_id: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_EXPRESS_URL_DIRECT}/api/messages/update-last-message-seen`, { conversation_id }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response
};