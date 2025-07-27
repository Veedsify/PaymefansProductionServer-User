"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface PageData {
  title: string;
  content: string;
}

interface ErrorData {
  error: boolean;
  message: string;
}

export default function Page() {
  const { page } = useParams<{ page: string }>();
  const [pageData, setPageData] = useState<ErrorData | PageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPage = async (
    page: string,
  ): Promise<PageData | ErrorData | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/pages/${page}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const response = await res.json();
      if (!response.error) {
        return response as PageData;
      }
      return {
        error: true,
        message: "No data found",
      } as ErrorData;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  useEffect(() => {
    if (page) {
      fetchPage(page).then((data) => {
        setPageData(data);
        setLoading(false);
        if (data && "title" in data) {
          document.title = data?.title;
        }
      });
    }
  }, [page]);

  if (loading) {
    return (
      <div className="loader">
        <p>Loading...</p>
      </div>
    );
  }

  if (!pageData || ("error" in pageData && pageData.error)) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{pageData?.message || "An error occurred"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container outer-pages">
        <nav className="nav">
          <div className="nav-container">
            <div className="nav-content">
              <Link href="/" className="logo-container">
                <Image
                  src="/site/logo.svg"
                  className="logo"
                  width={150}
                  height={40}
                  alt="logo"
                />
              </Link>
            </div>
          </div>
        </nav>
        <main className="main">
          {pageData && "title" in pageData && (
            <div className="content-container">
              <h1 className="title">{pageData.title}</h1>
              <div
                className="content text-justify"
                dangerouslySetInnerHTML={{
                  __html: pageData.content,
                }}
              />
            </div>
          )}
        </main>
        <footer>
          <div className="footer-content">
            <h1>MediaSetroom Ltd</h1>
            <Link href="/s/contact-us">Contact Us</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
