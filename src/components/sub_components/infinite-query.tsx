"use client"
import { getToken } from '@/utils/cookie.get';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const fetchItems = async ({ pageParam = 1 }: { pageParam: number }) => {
    try {
        const token = getToken()
        const api = `${process.env.NEXT_PUBLIC_EXPRESS_URL}/user/posts`
        const postPerPage = process.env.NEXT_PUBLIC_POST_PER_PAGE
        const res = await axios.get(`${api}?page=${pageParam}&limit=${postPerPage}`, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`,
            }
        })
        return res;
    } catch (error) {
        console.error(error);
    }
};

export const fetchItemsOther = async ({ pageParam, userid }: { pageParam: number, userid?: number }) => {
    try {
        const token = getToken()
        const api = `${process.env.NEXT_PUBLIC_EXPRESS_URL}/user/${userid}/posts`
        const postPerPage = process.env.NEXT_PUBLIC_POST_PER_PAGE
        const res = await axios.get(`${api}?page=${pageParam}&limit=${postPerPage}`, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`,
            }
        })
        return res;
    } catch (error) {
        console.error(error);
    }
};

