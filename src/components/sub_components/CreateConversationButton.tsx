"use client";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { createNewConversation } from "@/utils/data/CreateConversation";
import { LucideLoader2, LucideMail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateConversationButton({
  profileId,
}: {
  profileId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useUserAuthContext();
  const createConversation = async () => {
    setLoading(true);
    createNewConversation({ userId: user?.user_id as string, profileId })
      .then((res) => {
        if (res?.status === 200 && res.data.status === true) {
          router.push(`/chats/${res.data.conversation_id}`);
          setLoading(false);
        } else {
          toast.error("sorry you cant message this user at the moment");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  return (
    <button
      onClick={createConversation}
      className="p-1 text-white cursor-pointer rounded bg-primary-dark-pink flex items-center"
    >
      <LucideMail className="w-5 h-5" />
      {loading && <LucideLoader2 className="animate-spin" />}
    </button>
  );
}
