"use client"
import { socket } from "@/components/sub_components/sub/socket"
import { useUserPointsContext } from "@/contexts/user-points-context"
import { useUserAuthContext } from "@/lib/userUseContext"
import { getToken } from "@/utils/cookie.get"
import { SubscribeToUser } from "@/utils/data/subscribe-to-user"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import swal from "sweetalert"

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
    Settings: {
        subscription_price: number
        subscription_duration: number
    }
}

const Subscribe = ({ params }: SubscribeProps) => {
    const { user } = useUserAuthContext()
    const user_id = params.user_id
    const token = getToken()
    const [profileUser, setProfileUser] = useState<ProfileUser>()
    const router = useRouter()
    const { points } = useUserPointsContext()
    if (user?.user_id === user_id) {
        router.push("/profile")
    }

    useEffect(() => {
        document.title = "Subscribe"
        const fetchUserSubscription = async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/user/subscription-data/${user_id}`, {
                }, {
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

    }, [user_id, router, token])

    useEffect(() => {
        socket.on("subscription_added", () => {
            console.log("subscription_added")
        })

        return () => {
            socket.off("subscription_added")
        }
    }, [])

    const subscribeToUser = () => {
        if (user && profileUser) {
            const subscribeUser = async () => {
                return await SubscribeToUser(profileUser.user_id)
            }
            subscribeUser().then((res) => {
                if (res.status === true) {
                    swal("Success", `You have successfully subscribed to this ${profileUser.name}`, "success")
                    socket.emit("subscription_added", { user_id: profileUser.user_id })
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
            <div className="text-center border p-5 rounded-lg py-8">
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
                <h1 className="text-xl font-bold mb-8">Subscribe To  <br /><span className="text-2xl font-bold text-primary-dark-pink"> {profileUser?.name}</span></h1>
                <p className="text-gray-500 mb-8 leading-loose">
                    Subscribe to {profileUser?.name} to get access to {profileUser?.Model?.gender == "female" ? "her" : "his"} exclusive content,
                    <br />
                    and get notified when he goes live.
                </p>
                {profileUser && profileUser?.Settings?.subscription_price > 0 ? (
                    <div>
                        <span className=" font-bold mb-5 inline-block">Subscription Price:</span>
                        <div className="flex justify-center gap-2 items-center">
                            <Image width={20} height={20} src="/site/coin.svg"
                                className="w-auto h-5 aspect-square" alt="" />
                            <span className=" font-bold text-primary-dark-pink text-2xl ">
                                {Number(profileUser?.Settings?.subscription_price).toLocaleString()}
                            </span>
                        </div>
                        <button
                            onClick={subscribeToUser}
                            className="block bg-primary-dark-pink p-3 mx-auto  font-bold text-white rounded-lg cursor-pointer w-52 mt-5">
                            Subscribe
                        </button>
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