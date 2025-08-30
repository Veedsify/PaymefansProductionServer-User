"use client";
import ContactSupportModal from "@/features/support/ContactSupportModal";
import MyTicketsModal from "@/features/support/MyTicketsModal";
import { getHelpCategories } from "@/utils/data/GetHelpCategories";
import { HelpCategoryProp } from "@/types/Components";
import { useState, useEffect } from "react";
import { Ticket } from "lucide-react";
import { useAuthContext } from "@/contexts/UserUseContext";
const HelpPage = () => {
  const [helpCategories, setHelpCategories] = useState<HelpCategoryProp[]>([]);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isGuest } = useAuthContext();
  const [refreshTickets, setRefreshTickets] = useState(0);
  useEffect(() => {
    const fetchHelpCategories = async () => {
      try {
        const categories = await getHelpCategories();
        setHelpCategories(categories);
      } catch (error) {
        console.error("Error fetching help categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHelpCategories();
  }, []);
  const handleTicketCreated = () => {
    setRefreshTickets((prev) => prev + 1);
  };
  return (
    <div className={`block p-4 md:p-6 relative h-full z-[200]`}>
      <div className="flex items-center mb-7 lg:hidden">
        <span className="flex-shrink-0 text-xl font-bold ">Help & Support</span>
      </div>
      <header className="py-6 text-white bg-primary-text-dark-pink rounded-xl">
        <div className="container flex items-center justify-between px-4 mx-auto">
          <h1 className="text-xl font-bold lg:text-3xl">Help Center</h1>
          {!isGuest && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMyTickets(true)}
                className="relative overflow-hidden px-4 py-2 text-sm font-semibold bg-white/20 cursor-pointer group text-nowrap text-white hover:bg-white hover:text-primary-dark-pink rounded-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Ticket size={18} />
                  My Tickets
                </span>
              </button>
              <ContactSupportModal onTicketCreated={handleTicketCreated} />
            </div>
          )}
        </div>
      </header>
      <main className="container py-12 mx-auto">
        <div className="mb-8">
          <input
            type="text"
            id="searchInput"
            placeholder="Search for help..."
            className="w-full p-3 text-lg border rounded-lg shadow md:p-4 focus:ring-2 focus:text-primary-text-dark-pink focus:outline-none"
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark-pink"></div>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
            {helpCategories.map((category: HelpCategoryProp) => (
              <div
                key={category.id}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <h2 className="mb-2 text-xl font-semibold text-primary-text-dark-pink">
                  {category.name}
                </h2>
                <p className="text-gray-700">
                  {category.description as string}
                </p>
                <a
                  href="#"
                  className="inline-block mt-4 text-primary-text-dark-pink"
                >
                  Learn More →
                </a>
              </div>
            ))}
          </section>
        )}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">
                How do I reset my password?
              </h3>
              <p className="mt-2 text-gray-600">
                To reset your password, click on &quot;Forgot Password&quot; on
                the login page and follow the instructions.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">
                Can I upgrade my plan later?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes, you can upgrade or downgrade your plan anytime from the
                account settings page.
              </p>
            </div>
          </div>
        </section>
      </main>
      {/* My Tickets Modal */}
      <MyTicketsModal
        isOpen={showMyTickets}
        onClose={() => setShowMyTickets(false)}
        refreshTrigger={refreshTickets}
      />
    </div>
  );
};
export default HelpPage;
