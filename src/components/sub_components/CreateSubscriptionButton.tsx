"use client"

import { useUserAuthContext } from "@/lib/UserUseContext"
import { AuthUserProps } from "@/types/User"
import { checkUserIsSubscriber } from "@/utils/data/CheckUserIsSubscriber"
import Link from "next/link"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import swal from "sweetalert"

type CreateSubscriptionButtonProps = {
    userdata: any
}
const CreateSubscriptionButton = ({ userdata }: CreateSubscriptionButtonProps) => {
    const [isSubscriber, setIsSubscriber] = useState<boolean>(false)
    const { user: authUser } = useUserAuthContext()
    useEffect(() => {
        const checkSubscription = async (user: any, authUser: any) => {
            const res = await checkUserIsSubscriber(user, authUser as AuthUserProps);
            setIsSubscriber(res)
            return res;
        }
        checkSubscription(userdata, authUser)
    }, [authUser, userdata])

    const handleIfSubscriber = (e: any) => {
        if (isSubscriber) {
            e.preventDefault()
            swal({
                title: `Hi ${authUser?.name}!`,
                text: "Subsctiptions will be automatically cancelled after the end of the subscription period.",
                icon: "error",
            })
        }
    }

    return (
        <Link href={`/subscribe/${userdata.user_id}`}
            onClick={handleIfSubscriber}
            className={`sm:px-4 py-1 px-2 text-sm font-semibold  ${isSubscriber ? " bg-transparent text-black" : "bg-black text-white"} border border-black rounded `} >
            {isSubscriber ? "Subscribed" : "Subscribe"}
        </Link >
    )
}

export default CreateSubscriptionButton