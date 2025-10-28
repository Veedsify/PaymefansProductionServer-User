"use client";
import { fmt } from "@/constants/path";
import DynamicPageClient from "@/features/pages/components/DynamicPageClient";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
export interface PageData {
  title: string;
  content: string;
}

export interface ErrorData {
  error: boolean;
  message: string;
}

export default function Page() {
  const { page } = useParams();
  const [data, setData] = useState<PageData | ErrorData | null>(null);

  async function fetchData() {
    try {
      const res = await axios.get(
        fmt(`%s/pages/%s`, process.env.NEXT_PUBLIC_TS_EXPRESS_URL, page)
      );
      const response = res.data;
      if (!response.error) {
        setData({
          title: response.title,
          content: response.content,
        });
      } else {
        setData({
          error: response.error,
          message: response.message,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  useEffect(() => {
    fetchData();
  }, [page]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <DynamicPageClient pageData={data} />;
}
