"use client"

import { useUserPointsContext } from "@/contexts/user-points-context"
import { GetUserPointBalance } from "@/utils/data/get-user-point-balance"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useEffect } from "react"

interface PointsCountProps {
    user: any
}

const PointsCount = ({ user }: PointsCountProps) => {
    const { updatePoints } = useUserPointsContext();
    const { isLoading, data } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            return await GetUserPointBalance(user.id)
        },
        staleTime: 100
    })

    useEffect(() => {
        if (data) {
            updatePoints(data.data.points)
        }
    }, [data, updatePoints])

    if (isLoading) return (
        <h2 className="flex items-center mb-1 text-xl font-bold leading-none">
            <span className="animate-pulse w-16 h-6 bg-gray-200 rounded-md"></span>
        </h2>
    )

    return (
        <h2 className="flex items-center mb-1 text-xl font-bold leading-none">
            {data?.data.points.toLocaleString("en-Us")}
            <span className="ml-2">
                <Image width={20} height={20} src="/site/coin.svg"
                    className="w-auto h-5 aspect-square" alt="" />
            </span>
        </h2>
    )
}

export default PointsCount
