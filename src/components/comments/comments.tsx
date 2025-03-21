"use client";
import Image from "next/image";
import {
  LucideBarChart,
  LucideHeart,
  LucideLoader,
  LucideMessageSquare,
  LucideRepeat2,
  LucideShare,
} from "lucide-react";
import ReplyPostComponent from "./reply-post-textarea";
import numeral from "numeral";
import moment from "moment";
import usePostComponent from "@/contexts/post-component-preview";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { PostCompomentProps, PostData } from "@/types/components";
import { getUserComments } from "@/utils/data/get-post-comments";

interface Comment {
  text: string;
  files: File[];
  author_username: string;
  time: Date;
  name: string;
  profile_image: string;
}

const CommentsHolder = ({ post }: { post: PostData }) => {
  const [loading, setLoading] = useState(true);
  const [postComment, setPostComments] = useState<PostCompomentProps[]>([]);
  const { fullScreenPreview } = usePostComponent();

  // Aadd infinte scroll to load more comments
  useEffect(() => {
    const fetchComments = async () => {
      const comments = await getUserComments(post);
      if (comments) {
        setPostComments(comments);
        setLoading(false);
        return;
      }
      setPostComments([]);
    };
    fetchComments();
  }, [post]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate =
      numeral(date.getDate()).format("00") +
      "-" +
      numeral(date.getMonth() + 1).format("00") +
      "-" +
      date.getFullYear() +
      " " +
      numeral(date.getHours()).format("00") +
      ":" +
      numeral(date.getMinutes()).format("00");
    const now = moment();
    const diffForHumans = moment(dateString).from(now);
    return diffForHumans;
  };

  const previewImage = (media: string) => {
    fullScreenPreview({
      url: media,
      type: "image",
      open: true,
      otherUrl: [{ url: media as string, type: "image" }],
      ref: 1,
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-36">
        <LucideLoader
          size={20}
          className="animate-spin text-primary-dark-pink"
        />
      </div>
    );

  return (
    <div
      className={`${
        postComment.length > 1 && "border-y"
      }  dark:text-gray-100 dark:border-slate-800 p-0 md:p-3 py-5`}
    >
      {postComment?.map((comment, index) => (
        <div
          className="flex gap-1 md:gap-3 items-start relative w-full"
          key={index}
        >
          {index !== postComment?.length! - 1 && (
            <div className="absolute border-r h-full top-0 left-4 md:left-7 dark:border-slate-700  -z-10 -translate-1/2"></div>
          )}
          <Link href={`/${comment.user.username}`}>
            <Image
              src={comment.user.profile_image}
              width="50"
              height="50"
              className="h-auto aspect-square rounded-full w-8 md:w-14"
              alt=""
            />
          </Link>
          <div className="w-full">
            <h3 className="mb-2">
              <Link
                href={`/${comment.user.username}`}
                className="md:text-lg text-sm font-bold"
              >
                {comment.user.name}
              </Link>{" "}
              &nbsp;
              <Link
                href={`/${comment.user.username}`}
                className="md:text-lg text-sm"
              >
                {comment.user.username}
              </Link>{" "}
              &nbsp; . &nbsp;{" "}
              <span className="md:text-lg text-xs">
                {formatDate(comment.created_at)}
              </span>
            </h3>
            <div className="md:text-lg text-sm mb-2">
              <div
                className="mb-3"
                dangerouslySetInnerHTML={{ __html: comment.comment }}
              ></div>
              <div className="grid grid-cols-3 gap-2">
                {comment.PostCommentAttachments.map((media, index) => (
                  <div key={index} onClick={() => previewImage(media.path)}>
                    <Image
                      priority
                      src={media.path}
                      width="500"
                      height="500"
                      className="h-auto aspect-square rounded-lg object-cover cursor-pointer"
                      alt=""
                    />
                  </div>
                ))}
              </div>
            </div>
            <ReplyInteractions
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ReplyInteractions = () => {
  return (
    <div className="flex items-center justify-between p-2 md:p-6 mb-8">
      <span className="flex items-center gap-1 text-xs cursor-pointer font-medium ">
        <LucideHeart size={18} />0
      </span>
      <span className="flex items-center gap-1 text-xs cursor-pointer font-medium">
        <LucideMessageSquare size={18} />0
      </span>
      <span className="flex items-center gap-1 text-xs cursor-pointer font-medium">
        <LucideRepeat2 size={18} />0
      </span>
    </div>
  );
};

export default CommentsHolder;
