"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUserAuthContext } from "@/lib/userUseContext";
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideUsers,
  DollarSign,
} from "lucide-react";
import { HiOutlineEye } from "react-icons/hi";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SavePost } from "@/utils/save-post";
import { POST_CONFIG } from "@/config/config";
import PostMediaPreview from "./post-media-preview";
import {
  PostEditorProps,
  UploadedImageProp,
  UserMediaProps,
  PostAudienceDataProps,
  RemovedMediaIdProps,
} from "@/types/components";
import { useNewPostStore } from "@/contexts/new-post-context";
import { PostCancelComp } from "@/components/sub_components/sub/post-cancel-comp.";
import { usePostMediaUploadContext } from "@/contexts/post-media-upload-context";

const PostEditor = React.memo(({ posts }: PostEditorProps) => {
  const router = useRouter();
  const [dropdown, setDropdown] = useState(false);
  const [wordLimit, setWordLimit] = useState(1000);
  const [content, setContent] = useState<string>("");
  const { user } = useUserAuthContext();
  const [price, setPrice] = useState<number>(0);
  const { setVisibility, visibility, setPostText, postText } =
    useNewPostStore();
  const [editedMedia, setEditedMedia] = useState<UserMediaProps[]>([]);
  const [removedIds, setRemovedIds] = useState<RemovedMediaIdProps[]>([]);
  const [media, setMedia] = useState<UploadedImageProp[] | null>(null);
  const { mediaUploadComplete, setMediaUploadComplete } = usePostMediaUploadContext()
  const setPriceHandler = (value: string) => {
    const priceValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    setPrice(priceValue);
  };

  const [postAudience, setPostAudience] = useState<PostAudienceDataProps>({
    id: 1,
    name: "Public",
    icon: <HiOutlineEye size={20} className="inline" />,
  });

  const postAudienceData: PostAudienceDataProps[] = useMemo(
    () =>
      [
        {
          id: 1,
          name: "Public",
          icon: <HiOutlineEye size={20} className="inline" />,
        },
        ...(user?.is_model && user.Model?.verification_status
          ? [
            {
              id: 2,
              name: "Subscribers",
              icon: <LucideUsers size={20} className="inline" />,
            },
            {
              id: 3,
              name: "Price",
              icon: <DollarSign size={20} className="inline" />,
            },
          ]
          : []),
      ] as PostAudienceDataProps[],
    [user]
  );

  useEffect(() => {
    if (posts) {
      setPostText(posts.content);
      if (posts.post_audience) {
        const audience = postAudienceData.find(
          (aud) => aud.name.toLowerCase() === posts.post_audience.toLowerCase()
        );
        if (audience) {
          setVisibility(audience.name);
          setPostAudience(audience);
        }
      }
      if (posts.UserMedia) {
        setEditedMedia(posts.UserMedia);
      }
    }
  }, [posts, setPostText, setVisibility, postAudienceData]);

  const handleMediaAttachment = useCallback((image: UploadedImageProp) => {
    setMedia((prevMedia) => [...(prevMedia || []), image]);
  }, []);

  const removeThisMedia = (id: string, type: string) => {
    setMedia((prevMedia) =>
      prevMedia ? prevMedia.filter((file) => file.fileId !== id) : null
    );
    const removeId = media?.find((media) => media.fileId === id);
    if (removeId) {
      setRemovedIds((prevIds) => {
        return [...prevIds, { id: removeId.id, type: type }];
      });
    }
  };

  const checkLimit = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const count = e.target.value.length;
      if (count > 1000) {
        e.target.value = e.target.value.slice(0, 1000);
        setWordLimit(0);
      } else {
        setWordLimit(1000 - count);
      }
      setPostText(e.target.value);
      setContent(e.target.value);
    },
    [setPostText]
  );

  const updatePostAudience = useCallback(
    (audience: PostAudienceDataProps) => {
      setPostAudience(audience);
      setVisibility(audience.name);
      setDropdown(false);
    },
    [setVisibility]
  );

  const handlePostSubmit = async () => {
    if ((!content || content.trim() === "") && !media) {
      toast.error("Post is empty, please write something.", {
        id: "post-upload",
      });
      return;
    }

    if (!mediaUploadComplete) {
      toast.error("Please wait for all media uploads to complete.", {
        id: "post-upload",
      });
      return;
    }

    // Check if all uploads are completed
    if (media?.some((file) => !file.fileId)) {
      toast.error("Please wait for all uploads to complete.", {
        id: "post-upload",
      });
      return;
    }

    toast.loading("Creating your post...", {
      id: "post-upload",
    });
    const savePostOptions = {
      data: {
        media: media || [],
        content: postText,
        visibility: visibility.toLowerCase(),
        removedMedia: removedIds,
      },
      action: posts?.post_id ? "update" : "create",
      post_id: posts?.post_id || "",
    };

    const res = await SavePost(savePostOptions);

    if (res.error) {
      toast.error(res.message, {
        id: "post-upload",
      });
    } else {
      toast.success(POST_CONFIG.POST_CREATED_SUCCESS_MSG, {
        id: "post-upload",
      });
      setPostText("");
      setVisibility("Public");
      router.prefetch("/profile");
      router.push("/profile");
      setMedia(null);
      setEditedMedia([]);
      setRemovedIds([]);
      setMediaUploadComplete(false);
      setPrice(0);
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
            alt="Profile"
            width={56}
            height={56}
            className="w-14 border border-gray-800 inline-block rounded-full"
          />
          <AudienceDropdown
            postAudience={postAudience}
            postAudienceData={postAudienceData}
            setPrice={setPriceHandler}
            dropdown={dropdown}
            setDropdown={setDropdown}
            updatePostAudience={updatePostAudience}
          />
        </div>
        <textarea
          className="block dark:bg-gray-950 dark:text-white rounded-md mb-3 leading-relaxed text-gray-700 font-medium w-full resize-none outline-none mt-3 overflow-auto"
          placeholder="What’s on your mind?"
          defaultValue={postText}
          onChange={checkLimit}
        />
        <div className="mt-10">
          <p className="text-xs text-gray-400 font-medium">
            {wordLimit} characters remaining
          </p>
        </div>
      </div>
      <PostMediaPreview
        submitPost={handleMediaAttachment}
        removeThisMedia={removeThisMedia}
      />
    </>
  );
});

PostEditor.displayName = "PostEditor";

export default PostEditor;

// Extracted AudienceDropdown Component
const AudienceDropdown = React.memo(
  ({
    postAudience,
    postAudienceData,
    dropdown,
    setPrice,
    setDropdown,
    updatePostAudience,
  }: {
    postAudience: PostAudienceDataProps | null;
    postAudienceData: PostAudienceDataProps[];
    dropdown: boolean;
    setPrice: (value: string) => void;
    setDropdown: (value: boolean) => void;
    updatePostAudience: (audience: PostAudienceDataProps) => void;
  }) => {
    return (
      <div className="flex items-center gap-4 w-full">
        <button
          className="border inline-block border-gray-800 ml-2 rounded-3xl px-3 text-gray-800 dark:text-gray-200 text-sm relative"
          onClick={() => setDropdown(!dropdown)}
        >
          <span className="flex justify-start text-left gap-3 items-center font-medium text-sm p-2 transition-all duration-300 cursor-pointer w-40">
            {postAudience?.icon}
            <span className={"flex-1"}>{postAudience?.name}</span>
            {dropdown ? (
              <LucideChevronUp size={20} />
            ) : (
              <LucideChevronDown size={20} />
            )}
          </span>
          <div
            className={`absolute w-full left-0 mt-0 transition-all duration-300 ${dropdown
              ? "opacity-100 -translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
              }`}
          >
            <ul className="bg-white dark:bg-gray-950 rounded-2xl overflow-hidden mt-2 border border-gray-800 text-left w-full">
              {postAudienceData.map((audience) => (
                <li
                  key={audience.id}
                  onClick={() => updatePostAudience(audience)}
                  className="p-3 pr-5 text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium dark:hover:bg-slate-800 hover:bg-violet-50"
                >
                  {audience.icon}
                  {audience.name}
                </li>
              ))}
            </ul>
          </div>
        </button>
        {postAudience?.name === "Price" && (
          <div className="flex items-center border border-gray-800 rounded-3xl px-3 text-gray-800 dark:text-gray-200 text-sm">
            <Image
              width={20}
              height={20}
              src="/site/coin.svg"
              className="w-auto h-5 aspect-square"
              alt=""
            />
            <input
              type="text"
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="outline-0 border-0 rounded-3xl px-1 text-base py-[6px] text-gray-800 dark:text-gray-200 "
            />
          </div>
        )}
      </div>
    );
  }
);

AudienceDropdown.displayName = "AudienceDropdown";
