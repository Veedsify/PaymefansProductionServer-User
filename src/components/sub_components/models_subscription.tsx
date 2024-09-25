import { AllModelsProps } from "@/types/user";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

const ModelsSubscription = ({ model }: { model: any }) => {
    const memoizedModelSubscription = useMemo(() => {
        return (
            <div className="flex flex-col items-center gap-2 select-none ">
                <Link href={`/${model?.username}`}>
                    <Image
                        width={100}
                        height={100}
                        priority
                        src={model?.profile_image}
                        alt={model ? model.fullname : ""}
                        className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square"
                    />
                </Link>
                <p className="text-sm font-bold dark:text-white text-center">{model?.username}</p>
                <div className="text-sm text-center">
                    <span className="block text-xs text-center text-slate-500 dark:text-slate-200 ">Monthly</span>
                </div>
                <button className="block w-full px-3 py-1 text-xs font-semibold text-white rounded-md bg-primary-dark-pink">Subscribe</button>
            </div>
        );
    }, [model]);

    return memoizedModelSubscription;
}

export default ModelsSubscription;
