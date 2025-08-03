"use client";
import {
  LucideEye,
  LucideEyeOff,
  LucidePen,
  LucideShare,
  LucideTrash,
  Repeat2,
} from "lucide-react";
import axiosInstance from "./Axios";
import { MouseEvent, useCallback } from "react";
import { OwnerOption, QuickPostActionsProps } from "@/types/Components";
import { getToken } from "./Cookie";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import swal from "sweetalert";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { POST_CONFIG } from "@/config/config";

const token = getToken();

const QuickPostActionHooks = ({ options }: QuickPostActionsProps) => {
  const { user } = useUserAuthContext();
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
          toast.loading(POST_CONFIG.POST_DELETING_STATUS);
          const deletePost = await axiosInstance.delete(
            `/post/${options.post_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (deletePost.status === 200) {
            toast.dismiss();
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
      <div class="fixed z-[200] inset-0 bg-black/50 flex items-center justify-center"
          id="modal-bg"
      >
          <div class="p-5 bg-white dark:bg-slate-800 aspect-video rounded-md">
              <h1 class="mb-5 text-lg font-semibold dark:text-white">Set visibility</h1>
              <select class="p-3 mt-2 text-black bg-transparent border border-collapse w-72 rounded-md dark:border-slate-700 dark:bg-slate-900 dark:text-white" name="visibility" id="visibility">
                  ${
                    user && user.is_model && user.Model?.verification_status
                      ? `
                      <option value="public" ${
                        options.post_audience == "public" ? "selected" : ""
                      }>Public</option>
                      <option value="subscribers" ${
                        options.post_audience == "subscribers" ? "selected" : ""
                      }>Subscribers</option>
                      <option value="price" ${
                        options.post_audience == "price" ? "selected" : ""
                      }>Price</option>
                      `
                      : `
                      <option value="public" ${
                        options.post_audience == "public" ? "selected" : ""
                      }>Public</option>
                      `
                  }
              </select>
              <div id="price-input-container" style="display: ${
                options.post_audience === "price" ? "block" : "none"
              };">
                <label for="price-input" class="block mt-4 mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Set Price</label>
                <input type="number" min="1" step="any" id="price-input" class="p-3 text-black bg-transparent border border-gray-300 w-72 rounded-md dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="Enter price" value="${
                  options.price ?? ""
                }" />
              </div>
          </div>
      </div>
    `;

    // Add dynamic show/hide for price input
    const visibility = modal.querySelector("#visibility") as HTMLSelectElement;
    const priceInputContainer = modal.querySelector(
      "#price-input-container",
    ) as HTMLDivElement;

    visibility.addEventListener("change", () => {
      if (visibility.value === "price") {
        priceInputContainer.style.display = "block";
      } else {
        priceInputContainer.style.display = "none";
      }
    });
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      const modalBg = document.getElementById("modal-bg");
      if (e.target === modalBg) {
        modal.remove();
      }
    });
    visibility.addEventListener("change", async (e) => {
      try {
        const setVisibility = await axiosInstance.put(
          `/post/update/audience/${options.post_id}`,
          {
            visibility: visibility.value,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
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

  const ShareThisPost = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    swal({
      title: "Share this post",
      content: {
        element: "div",
        attributes: {
          className: "space-y-6",
          innerHTML: `
            <div class="flex flex-wrap gap-4">
              <button onclick="window.open('https://twitter.com/intent/tweet?url=${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${options.post_id}')"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-[#1DA1F2] hover:bg-[#1a8cd8] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span>Twitter</span>
              </button>

              <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${options.post_id}')"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-[#1877F2] hover:bg-[#166fe5] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <span>Facebook</span>
              </button>

              <button onclick="window.open('https://api.whatsapp.com/send?text=${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${options.post_id}')"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-[#25D366] hover:bg-[#22c35e] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path>
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>

            <div class="space-y-3">
              <p class="text-sm font-medium text-gray-600">Copy link</p>
              <div class="flex items-center space-x-2">
                <div class="flex-1 p-3 truncate bg-gray-100 rounded-lg">
                  <p class="text-sm text-gray-600">${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${options.post_id}</p>
                </div>
                <button onclick="navigator.clipboard.writeText('${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${options.post_id}').then(() => swal('Link copied!', '', 'success'))"
                  class="p-3 text-white rounded-lg transition-colors bg-primary-dark-pink hover:bg-primary-text-dark-pink">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </button>
              </div>
            </div>
          `,
        },
      },
      closeOnEsc: true,
      closeOnClickOutside: true,
    });
  };

  const repostThisPost = useCallback(async () => {
    try {
      const repost = await axiosInstance.post(
        `/post/repost/${options.post_id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (repost.status === 200 && repost.data.error === false) {
        toast.success(repost.data.message, {
          id: "repost",
        });
        router.refresh();
      }
      if (repost.status === 200 && repost.data.error) {
        toast.error(repost.data.message, {
          id: "repost-error",
        });
      }
    } catch (error: any) {
      swal(error.response.data.message, {
        icon: "info",
      });
    }
  }, [router, options.post_id]);

  const ownerOptions: (OwnerOption | null)[] = [
    user?.is_model
      ? {
          name: "Edit Post",
          icon: <LucidePen className="mr-2" size={14} />,
          link: new URL(`/posts/edit/${options.post_id}`, window.location.href),
        }
      : null,
    {
      name: "Set visibility",
      icon: <LucideEye className="mr-2" size={16} />,
      func: handleSetvisibility,
    },
    {
      name: "Repost",
      icon: <Repeat2 className="mr-2" size={16} />,
      func: repostThisPost,
    },
    {
      name: "Share",
      icon: <LucideShare className="mr-2" size={16} />,
      func: ShareThisPost,
    },
    {
      name: "Delete",
      icon: <LucideTrash className="mr-2" size={16} />,
      func: handleDelete,
    },
  ].filter((option) => option !== null);

  const publicOptions = [
    {
      name: "Repost",
      icon: <Repeat2 className="mr-2" size={16} />,
      func: repostThisPost,
    },
    {
      name: "Share",
      icon: <LucideShare className="mr-2" size={16} />,
      func: ShareThisPost,
    },
    // {
    //     name: "Hide",
    //     icon: <LucideEyeOff className="mr-2" size={16}/>,
    //     link: "/edit-post",
    // },
  ] as {
    name: string;
    icon: React.ReactNode;
    link?: string;
    func?: (e: MouseEvent<HTMLButtonElement>) => void;
  }[];

  return { ownerOptions, publicOptions };
};

export default QuickPostActionHooks;
