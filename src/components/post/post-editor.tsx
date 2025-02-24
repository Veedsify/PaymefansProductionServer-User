"use client";
import { useNewPostStore } from "@/contexts/new-post-context";
import { useUserAuthContext } from "@/lib/userUseContext";
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideLock,
  LucideUsers,
} from "lucide-react";
import Image from "next/image";
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HiOutlineEye } from "react-icons/hi";
import { PostCancelComp } from "../sub_components/sub/post-cancel-comp.";
import toast from "react-hot-toast";
import PostMediaPreview from "./post-media-preview";
import { SavePost } from "@/utils/save-post";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import {
  postAudienceDataProps,
  PostEditorProps,
  UserMediaProps,
} from "@/types/components";
import PostUserMedia from "./post-user-media";
import { POST_CONFIG } from "@/config/config";

const PostEditor = React.memo(({ posts }: PostEditorProps) => {
  const router = useRouter();
  const [dropdown, setDropdown] = useState(false);
  const [wordLimit, setWordLimit] = useState(1000);
  const [content, setContent] = useState<string>("");
  const { user } = useUserAuthContext();
  const { setVisibility, visibility, setPostText, postText } =
    useNewPostStore();
  const [editedMedia, setEditedMedia] = useState<UserMediaProps[]>([]);
  const [removedId, setRemovedId] = useState<number[]>([]);

  const [postAudience, setPostAudience] =
    useState<postAudienceDataProps | null>({
      id: 1,
      name: "Public",
      icon: <HiOutlineEye size={20} className="inline" />,
    });
  const [limit] = useState(1000);
  const [media, setMedia] = useState<File[] | null>(null);

  // Check Data
  const capitalizeFirstLetter = useCallback((str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  const convertToBlob = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.blob();
    } catch (error) {
      console.error("Error fetching media:", error);
      return null;
    }
  }, []);
  const postAudienceData: postAudienceDataProps[] = [
    {
      id: 1,
      name: "Public",
      icon: <HiOutlineEye size={20} className="inline" />,
    },
    user && user.is_model && user.Model?.verification_status
      ? {
          id: 2,
          name: "Subscribers",
          icon: <LucideUsers size={20} className="inline" />,
        }
      : null,
    user && user.is_model && user.Model?.verification_status
      ? {
          id: 3,
          name: "Private",
          icon: <LucideLock size={20} className="inline" />,
        }
      : null,
  ].filter(Boolean) as postAudienceDataProps[];

  useEffect(() => {
    if (posts) {
      setPostText(posts?.content);
      if (posts?.post_audience) {
        const audience = capitalizeFirstLetter(posts?.post_audience) as
          | "Public"
          | "Subscribers"
          | "Private";
        if (visibility !== audience) {
          // Only set visibility if it has changed
          setVisibility(audience);
          setPostAudience({
            id: postAudienceData.findIndex((audience) => audience === audience),
            name: audience,
            icon: postAudienceData.find((x) => x.name === audience)?.icon || (
              <HiOutlineEye size={20} className="inline" />
            ),
          });
        }
      }
      if (posts?.UserMedia) {
        setEditedMedia(posts?.UserMedia);
      }
    }
  }, [
    posts,
    setPostText,
    setVisibility,
    visibility,
    capitalizeFirstLetter,
    postAudienceData,
  ]);

  const progress = (progress: number) => {
    console.log(progress);
  };

  const audience = useMemo(() => {
    return (
      postAudienceData.find((audience) => audience.name === visibility) ||
      postAudienceData[0]
    );
  }, [visibility, postAudienceData]);

  const updatePostAudience = (e: MouseEvent<HTMLLIElement>) => {
    const id = e.currentTarget.getAttribute("data-id");
    const audience = postAudienceData.find(
      (audience) => audience.id === Number(id)
    );
    if (audience) {
      setPostAudience(audience);
      setVisibility(audience.name);
    }
    setDropdown(false);
  };

  const checkLimit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const count = e.target.value.length;
    if (count > limit) {
      e.target.value = e.target.value.slice(0, limit);
      setWordLimit(0);
    } else {
      setWordLimit(limit - count);
    }
    setPostText(e.target.value);
    setContent(e.target.value);
  };

  const handleMediaAttachment = useCallback(
    (files: File[] | null) => {
      setMedia(files);
    },
    [setMedia]
  );

  const handlePostSubmit = async () => {
    setPostText(content);
    if (!content || content.trim() === "") {
      toast.error("Post is empty, Please write something.");
      return;
    }
    const formData = new FormData();
    formData.append("content", postText);
    if (media) {
      media.forEach((file) => {
        formData.append("media[]", file);
      });
    }

    formData.append("visibility", visibility.toLowerCase());
    formData.append("removedMedia", JSON.stringify(removedId));
    toast.loading("Creating your post...");
    console.log(posts?.post_id);
    const savePostOptions = {
      data: formData,
      action: posts?.post_id === undefined ? "create" : "",
      post_id: posts?.post_id || "",
      onProgress: progress,
    };
    const res = await SavePost(savePostOptions);
    toast.dismiss();
    if (res.error) {
      toast.error(res.message);
    } else {
      toast.success(POST_CONFIG.POST_CREATED_SUCCESS_MSG);
      setPostText("");
      setPostText("");
      setVisibility("Public");
      router.push(`/posts/${res.data.post_id}`);
    }
  };

  return (
    <>
      <div className="md:p-8 p-4 dark:text-white">
        <div className="flex items-center mb-6">
          <PostCancelComp />
          <button
            onClick={handlePostSubmit}
            className="bg-primary-dark-pink text-white p-1 px-6 rounded ml-auto text-sm font-medium"
          >
            Post
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src={user?.profile_image || "/site/avatar.png"}
            alt=""
            width={56}
            height={56}
            className="w-14 border border-gray-800 inline-block rounded-full"
          />
          <button className="border inline-block border-gray-800 ml-2 rounded-3xl px-3 text-gray-800  dark:text-gray-200 text-sm relative">
            <span
              className="flex gap-2 items-center font-medium text-sm p-2 transition-all duration-300 cursor-pointer"
              onClick={() => setDropdown(!dropdown)}
            >
              {postAudience?.icon} {postAudience?.name}
              {dropdown ? (
                <LucideChevronUp size={20} className="inline" />
              ) : (
                <LucideChevronDown size={20} className="inline" />
              )}
            </span>
            <div
              className={`absolute w-full left-0 mt-0 transition-all duration-300 ${
                dropdown
                  ? "opacity-100 -translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-4 pointer-events-none"
              }`}
            >
              <ul className="bg-white  dark:bg-gray-950   rounded-2xl overflow-hidden mt-2 border border-gray-800 text-left w-full">
                {postAudienceData.map((audience) => (
                  <li
                    key={audience.id}
                    data-id={audience.id}
                    onClick={updatePostAudience}
                    className="p-3 pr-5 text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium  dark:hover:bg-slate-800 hover:bg-violet-50"
                  >
                    {audience.icon}
                    {audience.name}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        </div>
        <textarea
          className="block dark:bg-gray-950 dark:text-white   rounded-md mb-3 leading-relaxed text-gray-700 font-medium w-full resize-none outline-none mt-3 overflow-auto"
          placeholder="What’s on your mind?"
          defaultValue={postText}
          onChange={checkLimit}
        ></textarea>
        <div className="mt-10">
          <p className="text-xs text-gray-400 font-medium">
            {wordLimit} characters remaining
          </p>
        </div>
      </div>
      <PostUserMedia medias={editedMedia} removedId={setRemovedId} />
      <PostMediaPreview medias={media} submitPost={handleMediaAttachment} />
    </>
  );
});

PostEditor.displayName = "PostEditor";

export default PostEditor;
