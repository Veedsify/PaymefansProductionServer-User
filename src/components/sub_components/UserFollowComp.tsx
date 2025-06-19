import { UserFollowCompProps } from "@/types/Components";
import followUser from "@/utils/data/update/Follow";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";

const UserFollowComp: React.FC<UserFollowCompProps> = ({ follower }) => {
  const [isFollowing, setIsFollowing] = useState(follower.iAmFollowing);

  useEffect(() => {
    setIsFollowing(follower.iAmFollowing);
  }, [follower.iAmFollowing]);

  const handleFollow = async () => {
    setIsFollowing(!isFollowing);
    try {
      const action = isFollowing ? "unfollow" : "follow";
      await followUser(follower.user.id, action);
    } catch (error: any) {
      console.error("Error following/unfollowing user:", error);
      setIsFollowing(!isFollowing);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center p-1 md:px-3 py-3 hover:bg-gray-50 duration-300 ease-in-out rounded-md">
      <Link href={`/${follower.user.username}`}>
        <Image
          src={follower.user.profile_image}
          alt=""
          className="object-cover w-12 h-12 rounded-full border border-gray-500"
          width={50}
          height={50}
          priority
        />
      </Link>
      <div>
        <h2 className="mb-0 font-bold leading-none">
          <Link href={`/${follower.user.username}`} className="truncate w-full">
            {follower.user.fullname}
          </Link>
        </h2>
        <span className="text-sm text-gray-600 flex gap-3 items-center">
          <Link href={`/${follower.user.username}`} className="text-sm">
            {follower.user.username}
          </Link>
          {/* <span className="bg-gray-100 p-1 text-[12px] rounded-md font-bold text-gray-500">
                        Follows You
                    </span> */}
        </span>
      </div>
      <div className="flex gap-1 md:gap-4 items-center ml-auto">
        <button
          onClick={handleFollow}
          className={`px-5 py-1 rounded-full text-sm 
                    ${
                      isFollowing
                        ? "bg-gray-100 outline-1 outline-black"
                        : "bg-black text-white"
                    }  font-semibold`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
};

export default UserFollowComp;
