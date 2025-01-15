import CreateLiveStream from "@/components/sub_components/sub/create-live-stream";
import getUserData from "@/utils/data/user-data";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Live",
    description: "Profile page",
}
const Live = async () => {
    const user = await getUserData()

    if ((user?.Model?.verification_status === false || !user?.Model?.verification_status) && !user?.is_model) {
        return (
            <div className="p-4 lg:mb-4 mb-20 flex justify-center flex-col items-center">
                <div className="border-[3px] mb-3 inline-block p-2 rounded-full border-dotted">
                    <Image
                        src={`${user?.profile_image}`}
                        alt=""
                        width={100}
                        priority
                        height={100}
                        className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square "
                    />
                </div>
                <div className="text-center">
                    <div className="mb-10">
                        <span className="text-2xl font-bold">Hi,</span>
                        <span className="text-2xl font-bold text-primary-dark-pink"> {user?.name}</span>
                    </div>
                    <h1 className="text-2xl font-bold">Become a Model</h1>
                    <p className="text-gray-500">You need to be a model to go live</p>
                    <Link href="/models/become-a-model" className="block p-2 mx-auto text-sm font-bold text-white bg-primary-dark-pink rounded-lg cursor-pointer w-52 mt-5">Become a Model</Link>
                </div>
            </div>
        );
    }

    if (user?.Model?.verification_status === false && user.is_model) {
        return (
            <div className="p-4 lg:mb-4 mb-20 flex justify-center flex-col items-center">
                <div className="border-[3px] mb-5 inline-block p-2 rounded-full border-dotted">
                    <Image
                        src={`${user?.profile_image}`}
                        alt=""
                        width={100}
                        priority
                        height={100}
                        className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square "
                    />
                </div>
                <div className="text-center">
                    <div className="mb-10">
                        <span className="text-2xl font-bold">Hi,</span>
                        <span className="text-2xl font-bold text-primary-dark-pink"> {user?.name}</span>
                    </div>
                    <h1 className="text-xl font-bold mb-5 dark:text-white">Verification</h1>
                    <p className="text-gray-500">You need to verify your account to go live</p>
                    {
                        user?.Model?.verification_state.trim() === 'not_started' ? (
                            <Link href="/verification" className="block bg-primary-dark-pink p-2 mx-auto text-sm font-bold text-white rounded-lg cursor-pointer w-52 mt-5">
                                Verify Account
                            </Link>
                        ) : (
                            <Link href="/verification" className="block bg-primary-dark-pink p-2 mx-auto text-sm font-bold text-white rounded-lg cursor-pointer w-52 mt-5">
                                Continue Verification
                            </Link>
                        )
                    }
                </div>
            </div>
        );
    }

    if (user?.Model?.verification_status === true && user.is_model) {
        return (
            <div className="relative w-full min-h-screen flex items-center justify-center">
                <div className="absolute inset-0 p-0 m-0 bg-black left-0 bg-opacity-60 -z-10">
                </div>
                <Image src={user.profile_banner ? user.profile_banner : "/images/_cbea538c-470c-47a4-940b-bd00104953ca.jpeg"} alt="live background"
                    width={1200} height={1200} priority className="absolute object-cover w-full h-full p-0 m-0 -z-20" />
                <div className="text-2xl text-white">
                    <CreateLiveStream />
                    <p className="text-center text-gray-500 select-none text-xs font-bold">We will send a notification to your followers so they can join</p>
                </div>
            </div>
        );
    }
}

export default Live;
