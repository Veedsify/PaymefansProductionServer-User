"use client"
import {socket} from "@/components/sub_components/sub/socket";
import {useUserAuthContext} from "@/lib/userUseContext";
import {MessagesConversationContextValue, UserConversations} from "@/types/components";
import {ReactNode, createContext, useContext, useEffect, useMemo, useState} from "react";
import axios from "axios";
import {getToken} from "@/utils/cookie.get";
import _ from "lodash";
import {MESSAGE_CONFIG} from "@/config/config";

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

export const MessagesConversationProvider = ({children}: { children: ReactNode }) => {
    const {user} = useUserAuthContext()
    const [hasMore, setHasMore] = useState(false)
    const [page, setPage] = useState(1)
    const [conversations, setConversations] = useState<UserConversations[]>([]);

    const userid = useMemo(() => user?.user_id, [user?.user_id]);
    const username = useMemo(() => user?.username, [user?.username]);
    const token = getToken()

    useEffect(() => {
        if (userid && username) {
            socket.emit("user-connected", {
                userId: userid,
                username: username
            });
        }
    }, [userid, username]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/conversations/my-conversations?page=${page}&limit=${MESSAGE_CONFIG.MESSAGE_PAGINATION}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setConversations(prev => {
                    return _.uniqBy([...prev, ...response.data.conversations], 'id')
                })
                setHasMore(response.data.hasMore)
            } catch (error) {
                console.error(error)
            }
        }
        fetchConversations()
    }, [page, token]);

    const countUnreadMessages = conversations?.filter((item: UserConversations) => {
        return !item.lastMessage.seen && item.lastMessage.sender_id !== user?.user_id;
    }) || [];

    const value: MessagesConversationContextValue = {
        conversations: conversations || [],
        setPage: setPage,
        hasMore,
        lastMessage: conversations[conversations.length - 1]?.lastMessage,
        count: countUnreadMessages.length
    };

    return (
        <MessagesConversationContext.Provider value={value}>
            {children}
        </MessagesConversationContext.Provider>
    );
};
