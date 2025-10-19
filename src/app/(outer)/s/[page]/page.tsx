import { getPageData } from "@/features/pages/api/server";
import DynamicPageClient from "@/features/pages/components/DynamicPageClient";

interface PageProps {
  params: Promise<{ page: string }>;
}

export default async function Page({ params }: PageProps) {
  const { page } = await params;
  const pageData = await getPageData(page);

  return <DynamicPageClient pageData={pageData} />;
}
