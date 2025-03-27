"use client"
import {StoryMediaFetchProps} from "@/types/components";
import {useEffect, useState} from "react";
import axios, {CancelToken} from "axios";
import {getToken} from "@/utils/cookie.get";

const StoryMediaFetch = ({page}: StoryMediaFetchProps) => {
    const [media, setMedia] = useState<any>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        setLoading(true)
        setError(false)
        const URL = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/stories/media`
        const token = getToken()
        let cancel;
        // @ts-ignore
        axios({
            url: URL,
            method: "GET",
            params: {
                page
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            // @ts-ignore
            cancelToken: new CancelToken((c:any) => cancel = c)
    }).
        then(res => {
            setHasMore(res.data.data.length > 0)
            setLoading(false)
            setMedia((prev: any) => {
                const arr = new Map()
                prev.map((data: any) => {
                    arr.set(data.id, data)
                })
                res.data.data.map((data: any) => {
                    arr.set(data.id, data)
                })
                return Array.from(arr.values())
            })
        }).catch(error => {
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else {
                console.error('Error fetching data:', error);
            }
            setLoading(false);
            setError(true)
        })
    }, [page])

    return {
        media, loading, error, hasMore
    }
}

export default StoryMediaFetch
