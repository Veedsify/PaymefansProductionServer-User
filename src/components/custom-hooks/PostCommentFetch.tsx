"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "@/utils/cookie.get";
import { PostData, UserPostProps } from "@/types/components";

export default function PostCommentFetch(pageNumber: number) {
    const [posts, setPosts] = useState<UserPostProps[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancel;
        setLoading(true)
        setError(false)
        const token = getToken()
        const api = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/my-posts`
        const postPerPage = process.env.NEXT_PUBLIC_POST_PER_PAGE

        axios(api, {
            method: 'GET',
            params: {
                page: pageNumber,
                limit: postPerPage
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            cancelToken: new axios.CancelToken(c => cancel = c)
        }).then(res => {
            setPosts((prev) => {
                return [...new Set([...prev, ...res.data.data])]
            })
            setTotalResults(res.data.total)
            setHasMore(res.data.data.length > 0)
            setLoading(false)
        }).catch(e => {
            if (axios.isCancel(e)) return
            setError(true)
        })
    }, [pageNumber])

    return { posts, loading, error, hasMore, totalResults }
}
