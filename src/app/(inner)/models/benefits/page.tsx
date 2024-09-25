import getUserData from "@/utils/data/user-data";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProfilePage from '../../[id]/page';

export const metadata: Metadata = {
    title: "Become a model",
    description: "Profile page",
}

async function Models() {

    const user = await getUserData();
    if (user?.is_model) {
        return (
            <>
                <div>
                    <div className="m-3 p-8 px-12 rounded-2xl">
                        <Image src="/icons/feeling_sorry.svg" width={300} height={300} alt="Sorry you are already a model" className="w-full block" />
                        <div>
                            <h1 className="text-center mt-6 mb-8 font-bold md:text-3xl text-2xl ">
                                Sorry you are already a model
                            </h1>
                            <div className="text-center">
                                <Link href={
                                    user?.Model?.verification_status ?
                                        `/profile` :
                                        "/verification"
                                } className="bg-primary-dark-pink text-white text-sm py-3 px-4 font-bold m-3 rounded-md w-full text-center">
                                    {(user?.is_model && user.Model?.verification_status) ? "Go to your profile" : "Verify your account"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div>
            <div className="bg-coins-card-bottom text-white m-3 p-8 px-12 rounded-2xl">
                <ul className="list-disc">
                    <li className="leading-loose text-primary-text-dark-pink font-normal">
                        Chat with fans
                    </li>
                    <li className="leading-loose text-primary-text-dark-pink font-normal">
                        Earn per message
                    </li>
                    <li className="leading-loose text-primary-text-dark-pink font-normal">
                        10% Commision rate
                    </li>
                    <li className="leading-loose text-primary-text-dark-pink font-normal">
                        Live video
                    </li>
                    <li className="leading-loose text-primary-text-dark-pink font-normal">
                        Unlimited uploads
                    </li>
                    <li className="leading-loose text-primary-text-dark-pink font-normal">
                        One-time acces fee
                    </li>
                    <li className="leading-loose text-primary-text-dark-pink font-normal">
                        Access to subscription
                    </li>
                    <li className="leading-loose text-primary-text-dark-pink font-normal">
                        Earn with your content
                    </li>
                </ul>
            </div>
            <div className="flex align-middle justify-center">
                <Link href="/models/become-a-model" className="bg-primary-dark-pink text-white text-sm p-4 font-bold m-3 rounded-xl w-full text-center">
                    Sign Up
                </Link>
            </div>
        </div>
    );
}

export default Models;
