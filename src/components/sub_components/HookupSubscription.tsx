import { AuthUserProps } from "@/types/User";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Mars, Venus } from "lucide-react";
import { HookupProps } from "../models/SideModels";
import { cn } from "../ui/cn";
import ActiveProfileTag from "./sub/ActiveProfileTag";

const HookupSubscription = ({ hookup }: { hookup: HookupProps }) => {
  const area = hookup?.user_city || hookup?.state;
  const location = hookup?.user_state || hookup?.location;

  return (
    <Link
      href={`/${hookup?.username}`}
      className="flex flex-col items-center gap-2 my-5 select-none"
    >
      <div className="relative bg-white p-1 shadow-sm dark:bg-gray-800 dark:shadow-gray-300 rounded-full">
        <Image
          width={100}
          height={100}
          priority
          src={hookup?.profile_image}
          alt=""
          className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square"
        />
        {/* Online indicator */}
        <span className="absolute bottom-0 right-1">
          <ActiveProfileTag userid={hookup.username} />
        </span>
      </div>
      <p
        className={cn(
          `text-sm font-bold text-center inline-flex items-center`,
          hookup?.gender === "male" ? "text-blue-500" : "text-pink-500",
        )}
      >
        {hookup?.fullname}
        {hookup?.gender && (
          <span className="ml-1 text-xs text-gray-600">
            {hookup?.gender === "male" ? (
              <Mars size={15} className="text-blue-500" />
            ) : (
              <Venus size={15} className="text-pink-500" />
            )}
          </span>
        )}
      </p>

      {/* Distance indicator if available */}
      {hookup?.distance !== undefined && (
        <div className="flex items-center text-xs text-gray-600">
          <MapPin className="w-3 h-3 mr-1" />
          <span>
            {hookup.distance < 1
              ? `${Math.round(hookup.distance * 1000)}m away`
              : `${Math.round(hookup.distance)}km away`}
          </span>
        </div>
      )}

      {area && location && hookup.distance === undefined && (
        <div className="flex items-center text-xs text-gray-600">
          <MapPin className="w-3 h-3 mr-1" />
          <span>
            {area}, {location}
          </span>
        </div>
      )}

      {/* Price per message */}
      <div className="flex flex-wrap justify-center items-center gap-1 text-sm text-center">
        <span className="flex items-center">
          <Image
            width={20}
            height={20}
            priority
            src="/site/coin.svg"
            alt=""
            className="w-4 h-4"
          />
          <span className="font-bold text-primary-dark-pink">
            {Number(hookup?.price_per_message).toLocaleString()}
          </span>
        </span>
        <span className="block text-xs text-center text-slate-700">
          per msg
        </span>
      </div>
    </Link>
  );
};

export default HookupSubscription;
