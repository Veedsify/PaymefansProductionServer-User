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
import { use, useEffect, useRef, useState } from "react";
import {
  PostCommentAttachments,
  PostCompomentProps,
  PostData,
} from "@/types/components";
import { useInView } from "react-intersection-observer";
import _ from "lodash";
import { getUserComments } from "@/utils/data/get-post-comments";
interface Comment {
  text: string;
  files: File[];
  author_username: string;
  time: Date;
  name: string;
  profile_image: string;
}
const CommentsHolder = ({
  post,
  postComments,
}: {
  post: PostData;
  postComments: Comment[];
}) => {
  const [loading, setLoading] = useState(true);
  const [postComment, setPostComments] = useState<PostCompomentProps[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { fullScreenPreview } = usePostComponent();
  const commentsRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({
    threshold: 0,
  });
  useEffect(() => {
    if (inView && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore]);
  // Aadd infinte scroll to load more comments
  useEffect(() => {
    const fetchComments = async () => {
      const comments = await getUserComments(post, page);
      if (comments) {
        if (comments.hasMore) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
        setPostComments((prev) => {
          return _.uniqBy([...comments.data, ...prev], "_id");
        });
        setLoading(false);
        return;
      }
    };
    fetchComments();
  }, [post, page, postComments]);

  const formatDate = (dateString: string) => {
    const now = moment();
    const diffForHumans = moment(dateString).from(now);
    return diffForHumans;
  };

  const previewImage = (
    media: PostCommentAttachments,
    comment: PostCompomentProps
  ) => {
    const allMedia = comment?.attachment?.map((item) => ({
      url: item.path,
      type: "image",
    }));
    const currentIndex = comment?.attachment?.findIndex(
      (item) => item.name === media.name
    );

    fullScreenPreview({
      url: media.path,
      type: "image",
      open: true,
      otherUrl: allMedia as any,
      ref: currentIndex as number,
    });
  };
  const calculateHeight = () => {
    if (commentsRef.current) {
      const { height } = commentsRef.current.getBoundingClientRect();
      console.log(height - 700);
      return height - 700;
    }
    return 0;
  };
  return (
    <>
      <div
        className={`${
          postComment.length > 1 && "border-black/30 dark:border-slate-700"
        }  dark:text-gray-100 dark:border-slate-800 p-0 md:px-3 relative overflow-hidden`}
        ref={commentsRef}
      >
        <div
          className="absolute top-4 left-9 w-[1px] h-full bg-black/20 dark:bg-slate-700"
          style={{
            width: "1px",
            height: calculateHeight() + "px",
          }}
        ></div>
        {postComment?.map((comment, index) => (
          <div
            className={`flex gap-1 md:gap-3 items-start relative w-full ${
              index === postComment.length - 1 ? "bg-white" : ""
            }`}
            key={index}
          >
            <Link href={`/${comment.username}`}>
              <Image
                src={comment.profile_image}
                width="50"
                height="50"
                className="h-auto aspect-square rounded-full w-8 md:w-14"
                alt=""
              />
            </Link>
            <div className="w-full">
              <h3 className="mb-2">
                <Link
                  href={`/${comment.username}`}
                  className="md:text-base text-sm font-bold"
                >
                  {comment.name}
                </Link>{" "}
                &nbsp;
                <Link
                  href={`/${comment.username}`}
                  className="md:text-base text-sm"
                >
                  {comment.username}
                </Link>{" "}
                &nbsp; . &nbsp;{" "}
                <span className="md:text-base text-xs">
                  {formatDate(comment.date)}
                </span>
              </h3>
              <div className="md:text-base text-sm mb-2">
                <div
                  className="mb-3"
                  dangerouslySetInnerHTML={{ __html: comment.comment }}
                ></div>
                <div className="flex items-baseline flex-wrap max-w-md gap-2">
                  {comment.attachment?.map((media, index) => (
                    <div
                      key={index}
                      onClick={() => previewImage(media, comment)}
                    >
                      <Image
                        priority
                        src={media.path}
                        width="500"
                        height="500"
                        className="h-auto max-w-40 aspect-square rounded-lg object-cover cursor-pointer"
                        alt=""
                      />
                    </div>
                  ))}
                </div>
              </div>
              <ReplyInteractions />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-center items-center h-36">
            <LucideLoader
              size={20}
              className="animate-spin text-primary-dark-pink"
            />
          </div>
        )}
        <div ref={ref}></div>
      </div>
      {!hasMore && !loading && (
        <div className="text-center">
          {postComment.length > 0 ? (
            <p className="text-sm text-gray-400 font-semibold">
              No more comments
            </p>
          ) : (
            <p className="text-sm text-gray-400 font-semibold">
              No comments yet
            </p>
          )}
        </div>
      )}
    </>
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
        <LucideBarChart size={18} />0
      </span>
    </div>
  );
};
export default CommentsHolder;
