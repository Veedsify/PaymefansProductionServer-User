"use client";
import axios from "axios";
import { getToken } from "../Cookie";

export const getUserPosts = async ({
  pageParam,
  userid,
}: {
  pageParam: number;
  userid?: number;
}) => {
  try {
    const token = getToken();
    const api = userid
      ? `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/${userid}/posts`
      : `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/personal/posts`;

    const postPerPage = process.env.NEXT_PUBLIC_POST_PER_PAGE;

    const res = await axios.get(
      `${api}?page=${pageParam}&limit=${postPerPage}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
