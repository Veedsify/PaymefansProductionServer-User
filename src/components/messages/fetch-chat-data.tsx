"use client"
import GetConversationMessages from "@/utils/data/get-conversation-messages";
import Chats from "./chats";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Message } from "@/types/components";

const FetchChatData = ({ stringId }: { stringId: string }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [receiver, setReceiver] = useState(null);
    const [lastMessage, setLastMessage] = useState<Message | undefined | null>();
    const router = useRouter();
    const conversationId = stringId;

    useEffect(() => {
        const fetchData = async () => {
            const data = await GetConversationMessages(conversationId);
            if (data?.invalid_conversation === true && data?.status === false) {
                return router.push("/messages")
            }
            setMessages(data?.messages)
            setReceiver(data?.receiver)
            setLastMessage(data?.messages[data?.messages.length - 1])
        }

        fetchData();

    }, [conversationId, router, setMessages, setReceiver, setLastMessage])

    return <Chats receiver={receiver} allMessages={messages} lastMessage={lastMessage} conversationId={conversationId} />;
}

export default FetchChatData;
