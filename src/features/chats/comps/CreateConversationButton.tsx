"use client";
import { LucideLoader, LucideMail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import { createNewConversation } from "@/utils/data/CreateConversation";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

export default function CreateConversationButton({
  profileId,
}: {
  profileId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user, isGuest } = useAuthContext();
  const { toggleModalOpen } = useGuestModal();
  const createConversation = async () => {
    if (!isGuest) {
      setLoading(true);
      try {
        const res = await createNewConversation({
          userId: user?.user_id as string,
          profileId,
        });
        if (res?.status === 200 && res.data.status) {
          router.push(`/chats/${res.data.conversation_id}`);
          setLoading(false);
        } else {
          toast.error("sorry you cant message this user at the moment");
          setLoading(false);
        }
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
      return;
    }
    toggleModalOpen("You need to login continue");
  };
  return (
    <button
      onClick={createConversation}
      className="flex items-center p-1 text-white rounded cursor-pointer bg-primary-dark-pink"
    >
      <LucideMail className="w-5 h-5" />
      {loading && <LoadingSpinner />}
    </button>
  );
}
