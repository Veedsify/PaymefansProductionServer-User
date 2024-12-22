import {
    LucideEye,
    LucideEyeOff,
    LucidePen,
    LucideTrash,
    Repeat2,
} from "lucide-react";
import axiosInstance from "./axios";
import {MouseEvent} from "react";
import {OwnerOption, QuickPostActionsProps} from "@/types/components";
import {getToken} from "./cookie.get";
import toast from "react-hot-toast";
import {usePathname, useRouter} from "next/navigation";
import swal from "sweetalert";
import {useUserAuthContext} from "@/lib/userUseContext";
import {POST_CONFIG} from "@/config/config";

const token = getToken();

const QuickPostActionHooks = ({options}: QuickPostActionsProps) => {
    const {user} = useUserAuthContext();
    const router = useRouter();
    const path = usePathname();
    const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this post!",
            icon: "/icons/error.svg",
            buttons: ["Cancel", "Delete"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const deletePost = await axiosInstance.delete(
                        `/post/${options.post_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    if (deletePost.status === 200) {
                        toast.success(POST_CONFIG.POST_DELETED_SUCCESS_MSG);
                        if (path.startsWith("/profile")) {
                            window.location.reload();
                        } else {
                            window.location.href = "/profile";
                        }
                    }
                } catch (error) {
                    console.log(error);
                    swal("Something went wrong!", {
                        icon: "error",
                    });
                }
            }
        });
    };

    const handleSetvisibility = (e: MouseEvent<HTMLButtonElement>) => {
        const modal = document.createElement("div");
        modal.innerHTML = `
        <div class="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            id="modal-bg"
        >
            <div class="bg-white dark:bg-slate-800 p-5 aspect-video rounded-md">
                <h1 class="text-lg font-semibold mb-5 dark:text-white">Set visibility</h1>
                <select class="w-72 mt-2 p-3 rounded-md border-collapse bg-transparent border dark:border-slate-700 dark:bg-slate-900 text-black dark:text-white" name="visibility" id="visibility">
                    ${
            user && user.is_model && user.Model?.verification_status
                ? `
                        <option value="public" ${
                    options.post_audience == "public" && "selected"
                }>Public</option>
                        <option value="subscribers" ${
                    options.post_audience == "subscribers" && "selected"
                }>Subscribers</option>
                        <option value="private" ${
                    options.post_audience == "private" && "selected"
                }>Private</option>
                        `
                : `
                        <option value="public" ${
                    options.post_audience == "public" && "selected"
                }>Public</option>
                        `
        }
                </select>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
        const visibility = document.getElementById(
            "visibility"
        ) as HTMLSelectElement;
        modal.addEventListener("click", (e) => {
            const modalBg = document.getElementById("modal-bg");
            if (e.target === modalBg) {
                modal.remove();
            }
        });
        visibility.addEventListener("change", async (e) => {
            try {
                const setVisibility = await axiosInstance.put(
                    `/post/${options.post_id}`,
                    {
                        visibility: visibility.value,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (setVisibility.status === 200) {
                    toast.success(POST_CONFIG.QUICK_ACTION_CONFIG.VISIBILITY_SUCCESSFUL);

                    if (visibility.value === "private") {
                        modal.remove();
                        router.push("/profile");
                        router.refresh();
                    }
                    modal.remove();
                    router.refresh();
                }
            } catch (error) {
                console.log(error);
                modal.remove();
                swal("Something went wrong!", {
                    icon: "error",
                });
            }
        });
    };

    const repostThisPost = async () => {
        try {
            const repost = await axiosInstance.post(
                `/post/repost/${options.post_id}`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (repost.status === 200) {
                toast.success(repost.data.message);
                router.push("/profile");
                router.refresh();
            }
        } catch (error: any) {
            swal(error.response.data.message, {
                icon: "info",
            });
        }
    };

    const ownerOptions: (OwnerOption | null)[] = [
        user?.is_model
            ? {
                name: "Edit Post",
                icon: <LucidePen className="mr-2" size={14}/>,
                link: new URL(`/posts/edit/${options.post_id}`, window.location.href),
            }
            : null,
        {
            name: "Set visibility",
            icon: <LucideEye className="mr-2" size={16}/>,
            func: handleSetvisibility,
        },
        {
            name: "Delete",
            icon: <LucideTrash className="mr-2" size={16}/>,
            func: handleDelete,
        },
    ].filter((option) => option !== null);

    const publicOptions = [
        {
            name: "Repost",
            icon: <Repeat2 className="mr-2" size={16}/>,
            func: repostThisPost,
        },
        {
            name: "Report",
            icon: <LucideTrash className="mr-2" size={16}/>,
            link: "/edit-post",
        },
        {
            name: "Hide",
            icon: <LucideEyeOff className="mr-2" size={16}/>,
            link: "/edit-post",
        },
    ];

    return {ownerOptions, publicOptions};
};

export default QuickPostActionHooks;
