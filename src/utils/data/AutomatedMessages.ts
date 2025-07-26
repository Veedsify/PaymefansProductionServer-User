import { getToken } from "@/utils/Cookie";

interface AutomatedMessageData {
    followers?: {
        text: string;
        attachments: any[];
        isActive: boolean;
    };
    subscribers?: {
        text: string;
        attachments: any[];
        isActive: boolean;
    };
}

export const automatedMessagesAPI = {
    // Get automated messages
    getMessages: async () => {
        const token = getToken();
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/automated-messages`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch automated messages");
        }

        return response.json();
    },

    // Update automated messages
    updateMessages: async (data: AutomatedMessageData) => {
        const token = getToken();
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/automated-messages/update`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update automated messages");
        }

        return response.json();
    },

    // Delete automated message
    deleteMessage: async (messageType: "followers" | "subscribers") => {
        const token = getToken();
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/automated-messages/${messageType}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete automated message");
        }

        return response.json();
    },
};