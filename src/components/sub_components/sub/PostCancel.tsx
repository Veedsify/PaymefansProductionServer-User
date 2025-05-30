"use client"
import { useNewPostStore } from "@/contexts/NewPostContext";
import { useRouter } from "next/navigation";
import swal from "sweetalert";

export const PostCancel = () => {
    const router = useRouter()
    const { clearAll } = useNewPostStore();
    const confirmCancel = () => {
        swal({
            title: "Are you sure?",
            text: "You want to cancel this post?",
            icon: "/icons/warning.gif",
            className: "mx-auto",
            buttons: {
                cancel: true,
                confirm: {
                    text: "Yes",
                    className: "bg-primary-dark-pink text-white p-2 px-8 rounded ml-auto ",
                    value: "yes"
                }
            }
        }).then((res) => {
            if (res === "yes") {
                router.push("/")
                clearAll();
            }
        })
    }
    return (
        <button onClick={confirmCancel} className="text-sm font-medium">Cancel</button>
    );
}