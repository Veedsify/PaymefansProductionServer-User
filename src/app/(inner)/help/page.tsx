import { getHelpCategories } from "@/features/support/api/server";
import HelpPageClient from "@/features/support/components/HelpPageClient";

const HelpPage = async () => {
  const helpCategories = await getHelpCategories();

  return <HelpPageClient helpCategories={helpCategories} />;
};
export default HelpPage;
