"use client";

import Image from "next/image";
import Link from "next/link";
import ShadowDom from "@/components/common/global/ShadowDom";
import { ErrorData, PageData } from "@/app/(outer)/s/[page]/page";

interface DynamicPageClientProps {
  pageData: PageData | ErrorData | null;
}

const DynamicPageClient: React.FC<DynamicPageClientProps> = ({ pageData }) => {
  const isError = !pageData || ("error" in pageData && pageData.error);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/site/logo.svg"
              width={32}
              height={32}
              alt="logo"
              className="h-8 w-8"
            />
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              Paymefans Ltd
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/s/contact-us"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 "
            >
              Contact Us
            </Link>
            {/* Remove dark mode toggle button */}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        {isError ? (
          <section className="w-full flex flex-col items-center justify-center py-24">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
              {pageData?.error && "Oops! Something went wrong"}
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-center">
              {pageData?.message ||
                "An unexpected error occurred. Please try again later."}
            </p>
          </section>
        ) : (
          pageData &&
          "title" in pageData && (
            <article className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center leading-tight">
                {pageData.title}
              </h1>
              <div className="prose prose-xl max-w-none prose-slate dark:prose-invert">
                <ShadowDom html={pageData.content} />
              </div>
            </article>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-gray-700 dark:text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} MediaSetroom Ltd. All rights
            reserved.
          </span>
          <Link
            href="/s/contact-us"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 underline"
          >
            Contact Us
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default DynamicPageClient;
