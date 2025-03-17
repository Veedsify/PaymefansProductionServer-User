"use client"
import {socket} from "@/components/sub_components/sub/socket"
import {useUserPointsContext} from "@/contexts/user-points-context"
import {useUserAuthContext} from "@/lib/userUseContext"
import {getToken} from "@/utils/cookie.get"
import {SubscribeToUser} from "@/utils/data/subscribe-to-user"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import {useParams, useRouter} from "next/navigation"
import {useEffect, useState} from "react"
import toast from "react-hot-toast"
import swal from "sweetalert"
import numeral from "numeral";
import getFormattedStringFromDays from "@/utils/data/calculate-days";

type SubscribeProps = {
    params: {
        user_id: string
    }
}

type ProfileUser = {
    user_id: string
    profile_image: string
    username: string
    name: string
    Model: {
        gender: string
    },
    ModelSubscriptionPack: {
        ModelSubscriptionTier: {
            id: number;
            tier_name: string
            tier_price: number
            tier_duration: number
            tier_description: string
        }[]
    }
    Settings: {
        subscription_price: number
        subscription_duration: number
    }
}

const Subscribe = () => {
    const {user} = useUserAuthContext()
    const params = useParams();
    const token = getToken()
    const [profileUser, setProfileUser] = useState<ProfileUser>()
    const router = useRouter()
    const {points} = useUserPointsContext()
    if (user?.user_id === params.user_id) {
        router.push("/profile")
    }

    useEffect(() => {
        document.title = "Subscribe"
        const fetchUserSubscription = async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/user/subscription-data/${params.user_id}`, {}, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                })
                if (response.data.status === false) {
                    router.push("/404")
                }

                if (!response.data.data?.Model) {
                    router.push(`/${response.data.data.username}`)
                }
                setProfileUser(response.data.data)
            } catch (err) {
                console.log(err)
            }
        }
        fetchUserSubscription()

    }, [params.user_id, router, token])

    useEffect(() => {
        socket.on("subscription_added", () => {
        })

        return () => {
            socket.off("subscription_added")
        }
    }, [])

    const subscribeToUser = (id: number) => {
        if (user && profileUser) {
            const subscribeUser = async () => {
                return await SubscribeToUser(profileUser.user_id, id)
            }
            subscribeUser().then((res) => {
                if (res.status === true) {
                    swal("Success", `You have successfully subscribed to this ${profileUser.name}`, "success")
                    socket.emit("subscription_added", {user_id: profileUser.user_id})
                    router.push(`/${profileUser.username}`)
                } else {
                    swal("Error", res.message, "error")
                    // router.push(`/${profileUser.username}`)
                }
            })
        }
    }

    return (
        <div className="p-4 lg:mb-4 mb-20 flex justify-center flex-col items-center">
            <div className="text-center rounded-lg py-8 w-full flex-1">
                <div className="border-[3px] mb-5 inline-block p-2 rounded-full border-dotted">
                    <Image
                        src={`${profileUser?.profile_image || "/site/avatar.png"}`}
                        alt=""
                        width={100}
                        priority
                        height={100}
                        className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square "
                    />
                </div>
                <h1 className="text-xl font-bold mb-8">Subscribe To <br/><span
                    className="text-2xl font-bold text-primary-dark-pink"> {profileUser?.name}</span></h1>
                <p className="text-gray-500 mb-8 leading-loose">
                    Subscribe to {profileUser?.name} to get access
                    to {profileUser?.Model?.gender == "female" ? "her" : "his"} exclusive content,
                    <br/>
                    and get notified when he goes live.
                </p>
                {(profileUser && profileUser?.ModelSubscriptionPack) ? (
                    <div className="grid items-center xl:grid-cols-2 2xl:grid-cols-3 gap-4 mt-10">
                        {profileUser?.ModelSubscriptionPack?.ModelSubscriptionTier?.map((tier, index) => (
                            <div
                                key={index}
                                className="p-4 pt-8 border rounded-lg shadow-sm flex-1 xl:aspect-[3/4] flex flex-col justify-center">
                                <div className="flex justify-center gap-2 items-center mb-4">
                                    <Image width={20} height={20} src="/site/coin.svg"
                                           className="w-auto h-5 aspect-square"
                                           alt=""/>
                                    <span className="font-bold text-primary-dark-pink text-2xl">
                                        {numeral(tier.tier_price).format("0,0.")}
                                    </span>
                                </div>

                                <h3 className="font-bold text-xl lg:text-2xl mb-4">
                                    {tier.tier_name}
                                </h3>
                                <p className="text-sm text-gray-500 font-bold mb-4">
                                    {getFormattedStringFromDays(tier.tier_duration as number)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {tier.tier_description}
                                </p>
                                <button
                                    onClick={() => subscribeToUser(tier.id)}
                                    className="block bg-primary-dark-pink p-3 mx-auto font-bold text-white rounded-lg cursor-pointer w-full mt-4">
                                    Subscribe
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className="border border-gray-300 p-5 rounded-lg select-none">
                        <p className="text-gray-500 font-bold">This user is not selling any subscription</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Subscribe
