"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";
import { useAuthContext } from "@/contexts/UserUseContext";
import ContactSupportModal from "../ContactSupportModal";
import MyTicketsModal from "../MyTicketsModal";
import type { HelpCategoryProp } from "@/types/Components";

interface HelpPageClientProps {
    helpCategories: HelpCategoryProp[];
}

const HelpPageClient: React.FC<HelpPageClientProps> = ({ helpCategories }) => {
    const [showMyTickets, setShowMyTickets] = useState(false);
    const [refreshTickets, setRefreshTickets] = useState(0);
    const { isGuest } = useAuthContext();

    const handleTicketCreated = () => {
        setRefreshTickets((prev) => prev + 1);
    };

    return (
        <div className="block p-4 md:p-6 relative h-full">
            <div className="flex items-center mb-7 lg:hidden">
                <span className="flex-shrink-0 text-xl font-bold">
                    Help & Support
                </span>
            </div>

            <header className="py-6 text-white bg-primary-text-dark-pink rounded-xl">
                <div className="container flex flex-wrap items-center justify-between px-4 md:space-y-0 space-y-4">
                    <h1 className="text-xl font-bold lg:text-3xl">
                        Help Center
                    </h1>
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
                            <ContactSupportModal
                                onTicketCreated={handleTicketCreated}
                            />
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
                        className="w-full p-3 text-lg border border-gray-300 rounded-lg md:p-4 focus:ring-2 focus:text-black dark:focus:text-white focus:outline-none"
                    />
                </div>

                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {helpCategories?.map((category: HelpCategoryProp) => (
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

                <section className="mt-12">
                    <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">
                                How do I reset my password?
                            </h3>
                            <p className="mt-2 text-gray-600">
                                To reset your password, click on "Forgot
                                Password" on the login page and follow the
                                instructions.
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">
                                Can I upgrade my plan later?
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Yes, you can upgrade or downgrade your plan
                                anytime from the account settings page.
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

export default HelpPageClient;
