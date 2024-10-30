"use client"
import { socket } from "@/components/sub_components/sub/socket";
import { useUserAuthContext } from "@/lib/userUseContext";
import { MessagesConversationContextValue, UserConversations } from "@/types/components";
import { Conversation, LastMessage } from "@/types/conversations";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { Notification, useNotificationStore } from "./notification-context";
import axios from "axios";
import { getToken } from "@/utils/cookie.get";

const MessagesConversationContext = createContext<MessagesConversationContextValue | null>(
    null
);

export const useConversationsContext = () => {
    const context = useContext(MessagesConversationContext);
    if (!context) {
        throw new Error("useMessagesContext must be used within a MessagesConversationProvider");
    }
    return context;
};

export const MessagesConversationProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUserAuthContext()
    const { addAllNotifications, setTotalNotifications } = useNotificationStore()
    const [conversations, setConversations] = useState<UserConversations[]>([]);

    const userid = useMemo(() => user?.user_id, [user?.user_id]);
    const username = useMemo(() => user?.username, [user?.username]);

    useEffect(() => {
        const token = getToken()
        const url = `${process.env.NEXT_PUBLIC_EXPRESS_URL}/notifications/1`
        const getNotifications = async () => {
            const myNotitifications = await axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (myNotitifications.status == 200) {
                addAllNotifications(myNotitifications.data.data.map((notification: Notification) => {
                    return {
                        ...notification,
                        created_at: notification.created_at
                    }
                }))
                setTotalNotifications(Number(myNotitifications.data.total))
            } else {
                return
            }
        }

        getNotifications()
        return () => {
            getNotifications()
        }
    }, [setTotalNotifications, addAllNotifications])


    useEffect(() => {
        if (userid && username) {
            socket.emit("user-connected", {
                userId: userid,
                username: username
            });
        }
    }, [userid, username]);

    useEffect(() => {
        const handleConversations = (data: any) => {
            setConversations(data.conversations);
        };

        socket.on("conversations", handleConversations);

        return () => {
            socket.off("conversations", handleConversations);
        };
    }, []);

    const countUnreadMessages = conversations?.filter((item: UserConversations) => {
        return !item.lastMessage.seen && item.lastMessage.sender_id !== user?.user_id;
    }) || [];

    const value: MessagesConversationContextValue = {
        conversations: conversations || [],
        lastMessage: conversations[conversations.length - 1]?.lastMessage,
        count: countUnreadMessages.length
    };

    return (
        <MessagesConversationContext.Provider value={value}>
            {children}
        </MessagesConversationContext.Provider>
    );
};
