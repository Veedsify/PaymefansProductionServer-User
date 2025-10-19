"use client";

import Image from "next/image";
import Link from "next/link";
import type { PageData, ErrorData } from "../api/server";

interface DynamicPageClientProps {
  pageData: PageData | ErrorData | null;
}

const DynamicPageClient: React.FC<DynamicPageClientProps> = ({ pageData }) => {
  if (!pageData || ("error" in pageData && pageData.error)) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{pageData?.message || "An error occurred"}</p>
      </div>
    );
  }

  return (
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
              className="text-justify content"
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
  );
};

export default DynamicPageClient;

