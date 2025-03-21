"use client"
import Image from "next/image";
import toast from "react-hot-toast";

const PointsBuy = ({
    point
}: {
    point: {
        points: number;
        amount: number;
        points_buy_id: string;
    }
    postId?: string;
}) => {
    const handlePointsClick = async (id: string) => {
        toast.loading("Please wait...")
        const createPaymentLink = await fetch(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/points/buy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${document.cookie.split("token=")[1].split(";")[0]}`,
            },
            body: JSON.stringify({
                points_buy_id: id
            })
        })
        if (createPaymentLink.ok) {
            const data = await createPaymentLink.json()
            if (data.status === true) {
                window.location.href = data.authorization_url
            } else {
                toast.error(data.message)
            }
        }
    }
    return (
        <div className="rounded-2xl bg-coins-card-bottom  dark:bg-slate-800  dark:border-slate-800 dark:border cursor-pointer"
            onClick={() => handlePointsClick(point.points_buy_id)}
        >
            <div className="flex py-5 rounded-tr-2xl rounded-tl-2xl items-center gap-2 justify-center dark:bg-gray-950 bg-white m-[2px]">
                <Image width={20} height={20} src="/site/coin.svg" className="h-auto" alt="" />
                <h2 className="font-bold text-xl text-primary-dark-pink">{point.points}</h2>
            </div>
            <div>
                <h3 className="text-center font-medium text-sm py-3">₦{Number(point.amount).toLocaleString()}</h3>
            </div>
        </div>
    );
}

export default PointsBuy;
