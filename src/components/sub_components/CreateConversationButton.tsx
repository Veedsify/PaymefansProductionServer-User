"use client";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { createNewConversation } from "@/utils/data/CreateConversation";
import { LucideMail } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateConversationButton({
  profileId,
}: {
  profileId: string;
}) {
  const router = useRouter();
  const { user } = useUserAuthContext();
  const createConversation = async () => {
    toast.loading("");
    createNewConversation({ userId: user?.user_id as string, profileId })
      .then((res) => {
        if (res?.status === 200 && res.data.status === true) {
          router.push(`/chats/${res.data.conversation_id}`);
          toast.dismiss();
        } else {
          toast.dismiss();
          toast.error("sorry you cant message this user at the moment");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <button
      onClick={createConversation}
      className="p-1 text-white cursor-pointer rounded bg-primary-dark-pink"
    >
      <LucideMail className="w-5 h-5" />
    </button>
  );
}
