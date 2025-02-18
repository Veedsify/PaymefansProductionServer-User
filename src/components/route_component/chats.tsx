"use client";
import React, {
    useCallback,
    useEffect,
    useLayoutEffect, useMemo,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { LucideArrowLeft, LucideGrip, LucideVerified } from "lucide-react";
import MessageBubble from "../sub_components/message_bubble";
import MessageInput from "../sub_components/message_input";
import { useUserAuthContext } from "@/lib/userUseContext";
import { socket } from "../sub_components/sub/socket";
import swal from "sweetalert";
import { Message } from "@/types/components";
import ActiveProfileTag from "../sub_components/sub/active-profile-tag";

const Chats = React.memo(({
  allmessages,
  lastMessage,
  conversationId,
  receiver,
}: {
  allmessages: Message[];
  lastMessage: Message | undefined | null;
  conversationId: string;
  receiver?: any;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useUserAuthContext();
  const heightRef = useRef<HTMLDivElement>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  const handleJoined = useCallback((message: { message: string }) => {
    // toast.success(message.message);
  }, []);

  useEffect(() => {
    setMessages(allmessages);
  }, [allmessages]);

  const sendMessageToReceiver = useCallback(
    ({ message_id, message, sender_id, attachment }: Message) => {
      const newMessage = {
        id: messages.length + 1,
        message_id,
        message,
        sender_id,
        attachment,
        seen: false,
        created_at: new Date().toISOString(), // Using ISO format for consistency
      };
      console.log({ ...newMessage });
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      socket.emit("new-message", {
        ...newMessage,
        receiver_id: receiver.user_id,
        conversationId,
        date: newMessage.created_at,
      });
    },
    [setMessages, receiver, conversationId, messages]
  );

  useEffect(() => {
    const handleMessageReceived = (message: Message) => {
      if (message) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            message_id: message.message_id,
            seen: false,
            attachment: message.attachment,
            message: message.message,
            sender_id: message.sender_id,
            created_at: new Date().toISOString(),
          },
        ]);

        if (message.sender_id !== user?.user_id) {
          socket.emit("message-seen", {
            conversationId,
            lastMessageId: message.message_id,
            userId: user?.user_id,
            receiver_id: receiver.user_id,
          });
        }
      }
    };

    const handleSeenByReceiver = (data: any) => {
      if (data.messageId) {
        setMessages((prevMessages) =>
          prevMessages && prevMessages.map((message) => {
            if (message.seen !== true) {
              return {
                ...message,
                seen: true,
              }
            } else {
              return message;
            }
          })
        );
      }
    };

    const handMessageError = () => {
      swal({
        title: "Error",
        text: "The Last Message You Sent Didn't go through, refresh the page and try again.",
        icon: "error",
        buttons: {
          cancel: true,
          confirm: {
            text: "Refresh",
            className: "bg-primary-dark-pink text-white",
          }
        }
      }).then((value) => {
        if (value) {
          window.location.reload();
        }
      });
    }

    socket.emit("join", conversationId);
    socket.on("joined", handleJoined);
    socket.on("message", handleMessageReceived);
    socket.on("message-seen-updated", handleSeenByReceiver);
    socket.on("message-error", handMessageError);
    socket.on("sender-typing", (data: any) => {
      if (data.sender_id === user?.user_id) return;
      setTyping(data.value);
      if (typing) {
        setLastActivityTime(Date.now());
      }
    });
    return () => {
      socket.off("message", handleMessageReceived);
      socket.off("joined", handleJoined);
      socket.off("sender-typing");
      socket.off("message-error");
      socket.off("message-seen-updated", handleSeenByReceiver);
    };
  }, [conversationId, setMessages, messages, user, handleJoined, typing, receiver.user_id]);
  useEffect(() => {
    const checkForInactivity = () => {
      if (Date.now() - lastActivityTime > 10000) { // 10 seconds of inactivity
        setTyping("");
      }
    };

    const intervalId = setInterval(checkForInactivity, 1000);

    return () => clearInterval(intervalId);
  }, [lastActivityTime]);
  const sendTyping = (value: string) => {
    socket.emit("typing", {
      sender_id: user?.user_id,
      value,
      conversationId,
    });
  };
  useEffect(() => {
    const height_ref = heightRef.current;
    if (height_ref) {
      height_ref.scrollTop = height_ref.scrollHeight;
    }
  }, [heightRef, messages]);

  useEffect(() => {
    ref.current?.scrollTo(0, ref.current.scrollHeight);
    const handleSeen = () => {
      if (lastMessage && lastMessage.sender_id !== user?.user_id) {
        socket.emit("message-seen", {
          conversationId,
          lastMessageId: lastMessage.message_id,
          userId: user?.user_id,
          receiver_id: receiver.user_id,
        });
      }
    };
    handleSeen();
  }, [lastMessage, user, conversationId, receiver.user_id]);
const profilePicture = useMemo(()=> (receiver.profile_image ? receiver.profile_image : "/site/avatar.png"), [receiver.profile_image])
  return (
    <div className="relative chat_height">
      <div className="flex items-center border-b dark:border-gray-800 py-6 px-5 pb-6">
        <div className="mr-6 sm:mr-10 dark:text-white">
          <Link href="/messages">
            <LucideArrowLeft size={30} className="cursor-pointer" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <Image
              className="rounded-full aspect-square object-cover"
              width={50}
              height={50}
              priority
              src={profilePicture}
              alt=""
            />
          </div>
          <div className="dark:text-white">
            <div className="font-bold text-sm md:text-base">
              <Link
                href={`/${receiver.username}`}
                className="flex gap-1 duration-300 items-center"
              >
                <span>{receiver ? receiver.name : ""}</span>
                {receiver.username === '@paymefans' && (<LucideVerified className="text-yellow-600"/>)}
                <span className="text-xs fw-bold text-primary-dark-pink inline-block ml-3">
                  {typing.length > 0 ? "typing..." : ""}
                </span>
              </Link>
            </div>
            <div className="flex gap-1 items-center text-xs md:text-xs ">
              <ActiveProfileTag userid={receiver.username} withText />
            </div>
          </div>
        </div>
        <div className="ml-auto dark:text-white">
          <LucideGrip size={30} className="cursor-pointer" />
        </div>
      </div>
      <div className="max-h-[80vh] overflow-auto pb-5" ref={heightRef}>
        {messages?.map((message: Message, index: number) => (
          <div
            key={index}
            data-id={message.message_id}
            className="p-4 message-bubbles"
            ref={index === messages.length - 1 ? ref : null}
          >
            <MessageBubble
              seen={message.seen}
              attachment={message.attachment}
              sender={message.sender_id}
              date={message.created_at}
              message={message.message}
            />
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 z-[50] md:z-[65] lg:w-[43.7%] w-full bg-white dark:bg-gray-800">
        <MessageInput
          receiver={receiver}
          isFirstMessage={messages.length === 0}
          sendMessage={sendMessageToReceiver}
          sendTyping={sendTyping}
        />
      </div>
    </div>
  );
});

Chats.displayName = "Chats";

export default Chats;
