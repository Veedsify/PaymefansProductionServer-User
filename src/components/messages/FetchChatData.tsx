// "use client";
// import { FetchConversationData } from "@/utils/data/GetConversationMessages";
// import Chats from "./Chats";
// import { useRouter } from "next/navigation";
// import { Message } from "@/types/Components";
// import { useEffect, useCallback, useState } from "react";
// import { getSocket } from "../sub_components/sub/Socket";
// import _ from "lodash";
// import { MediaProvider } from "@/contexts/MessageMediaContext";
// import NoSsrWrapper from "@/providers/NoSSRWrapper";

// const FetchChatData = ({ stringId }: { stringId: string }) => {
//   const socket = getSocket();
//   const router = useRouter();
//   // Prepend new messages to the start of the array
//   const [allMessages, setAllMessages] = useState<Message[]>([]);
//   const [cursor, setCursor] = useState(0);
//   const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isError, setIsError] = useState(false);
//   const [receiver, setReceiver] = useState<any>(null);
//   const [invalidConversation, setInvalidConversation] = useState(false);
//   const conversationId = stringId;

//   // Fetch messages function
//   const fetchMessages = useCallback(
//     async (pageParam: number) => {
//       try {
//         if (cursor === 1) return;
//         setIsFetchingNextPage(true);
//         const res = await FetchConversationData({
//           pageParam,
//           conversationId,
//           cursor,
//         });
//         if (res.invalid_conversation && res.status === false) {
//           setInvalidConversation(true);
//           setIsError(true);
//           setIsLoading(false);
//           return;
//         }
//         setReceiver(res.receiver);
//         setCursor(Number(res.nextCursor));
//         const messages = res.messages.map((message: Message) => ({
//           ...message,
//           triggerSend: false,
//           rawFiles: Array.isArray(message.rawFiles) ? message.rawFiles : [],
//         }));

//         setAllMessages((prev) => _.uniqBy([...messages, ...prev], "id"));
//         setIsLoading(false);
//         setIsFetchingNextPage(false);
//       } catch (error) {
//         setIsError(true);
//         setIsLoading(false);
//         setIsFetchingNextPage(false);
//       }
//     },
//     [conversationId, cursor]
//   );

//   // Initial fetch
//   useEffect(() => {
//     setIsLoading(true);
//     setAllMessages([]);
//     setCursor(1);
//     setIsError(false);
//     setInvalidConversation(false);
//     fetchMessages(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [conversationId]);

//   const lastMessage = allMessages[allMessages.length - 1];
//   const loadMoreMessages = useCallback(() => {
//     if (!isFetchingNextPage) {
//       fetchMessages(cursor);
//     }
//   }, [isFetchingNextPage, cursor, fetchMessages]);

//   // Handle invalid conversation
//   useEffect(() => {
//     if (invalidConversation) {
//       router.push("/messages");
//     }
//   }, [invalidConversation, router]);

//   // Socket connection for joining/leaving conversation
//   useEffect(() => {
//     socket.emit("join", conversationId);
//     return () => {
//       socket.emit("leave", conversationId);
//     };
//   }, [conversationId, socket]);

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full py-8 space-y-4">
//         <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
//         <span className="text-pink-500 text-base font-medium">
//           Loading messages...
//         </span>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full py-8 space-y-4 text-center">
//         <svg
//           className="w-10 h-10 text-red-500"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728"
//           />
//         </svg>
//         <p className="text-red-500 text-base font-medium">
//           Failed to load the conversation.
//         </p>
//         <p className="text-gray-500 text-sm">
//           Please check your connection or try refreshing the page.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <MediaProvider>
//       <Chats
//         receiver={receiver}
//         allMessages={allMessages}
//         setAllMessages={setAllMessages}
//         lastMessage={lastMessage}
//         conversationId={conversationId}
//         onLoadMore={loadMoreMessages}
//         isFetchingMore={isFetchingNextPage}
//       />
//     </MediaProvider>
//   );
// };

// export default FetchChatData;
