import { AuthUserProps } from "@/types/user";
import Image from "next/image";
import Link from "next/link";

const HookupSubscription = ({ hookup }: { hookup: AuthUserProps }) => {
    return (
        <Link href={`/${hookup?.username}`} className="flex flex-col items-center gap-2 my-5 select-none">
            <Image
                width={100}
                height={100}
                priority
                src={hookup?.profile_image} alt="" className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square" />
            <p className="text-sm font-bold text-center">{hookup?.fullname}</p>
            <div className="flex flex-wrap justify-center items-center gap-1 text-sm text-center ">
                <span className="flex items-center ">
                    <Image
                        width={20}
                        height={20}
                        priority
                        src="/site/coin.svg" alt="" className="w-4 h-4" />
                    <span className="font-bold text-primary-dark-pink">
                        {Number(hookup?.Settings?.price_per_message).toLocaleString()}
                    </span>
                </span>
                <span className="block text-xs text-center text-slate-700 ">Per msg</span>
            </div>
        </Link>
    );
}

export default HookupSubscription;
