import WithDrawInput from "@/components/sub_components/withdraw-input";
import axiosInstance from "@/utils/axios";
import getTransactionsData from "@/utils/data/transactions";
import getUserData from "@/utils/data/user-data";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

const Page = async () => {
    const token = (await cookies()).get('token')
    const user = await getUserData();
    const { wallet } = await axiosInstance.post(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/wallet`, {
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token?.value}`
        }
    }).then(res => res.data as { wallet: number })
    const { points } = await axiosInstance.post(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/points`, {
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token?.value}`
        }
    }).then(res => res.data as { points: number })

    return (
        <div className="p-4 py-8">
            <div className="flex flex-wrap gap-5 items-center justify-between pb-6">
                <div className="flex align-middle gap-5">
                    <Image src={user?.profile_image!} width={50} height={50} alt="" priority
                        className="object-cover w-12 h-12 border-2 rounded-full sm:-top-12  -top-12" />
                    <div className="self-center">
                        <h2 className="font-bold">{user?.name}</h2>
                        <p>{user?.username}</p>
                    </div>
                </div>
            </div>
            <div className="mb-10 flex align-middle justify-between bg-primary-dark-pink text-white p-5 rounded-xl">
                <div className="grid gap-3">
                    <small className="text-md">Your Balance</small>
                    <h1 className="text-xl md:text-3xl font-bold">₦ {(points * 100).toLocaleString()}</h1>
                </div>
                <div className="flex self-center">
                    <div className="bg-coins-card-top md:px-5 md:py-3 p-2 px-4 rounded-md">
                        <div className="opacity-100 flex gap-1">
                            <span>{points ? points.toLocaleString() : 0}</span>
                            <Image width={20} height={20} className="w-auto h-5 aspect-square" src="/site/coin.svg"
                                alt="" />
                        </div>
                    </div>
                </div>
            </div>
            <WithDrawInput />
        </div>
    );
}

export default Page;
