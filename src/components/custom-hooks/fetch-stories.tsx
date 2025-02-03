"use client";
import { UserData } from "@/types/story";
import { getToken } from "@/utils/cookie.get";
import { useEffect, useState } from "react";

const useFetchStories = () => {
     const [stories, setStories] = useState<UserData[]>([]);
     const [loading, setLoading] = useState(true);
     const token = getToken()
     useEffect(() => {
          const fetchStories = async () => {
               const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/stories`, {
                    headers:{
                         "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,
                    }         
               });
               const data = await res.json();
               console.log(data.data);
               setStories(data.data);
               setLoading(false);
          };
          fetchStories();
     }, [token]);

     return { stories, loading };
}

export default useFetchStories;
