import { getPageData } from "@/features/pages/api/server";
import DynamicPageClient from "@/features/pages/components/DynamicPageClient";

interface PageProps {
  params: { page: string };
}

export default async function Page({ params }: PageProps) {
  const pageData = await getPageData(params.page);

  return <DynamicPageClient pageData={pageData} />;
}
