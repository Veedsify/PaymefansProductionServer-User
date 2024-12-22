import ContactSupportModal from "@/components/sub_components/contact-support-modal";

const HelpPage = () => {
    return (
        <div className={`block p-4 md:p-8`}>
            <div className="flex items-center mb-7 lg:hidden">
                <span className="font-bold text-xl flex-shrink-0 ">Help & Support</span>
            </div>

            <header className="bg-primary-text-dark-pink text-white rounded-xl py-6">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className=" text-2xl lg:text-3xl font-bold">Help Center</h1>
                    <ContactSupportModal/>
                </div>
            </header>

            <main className="container mx-auto py-12">
                <div className="mb-8">
                    <input
                        type="text"
                        id="searchInput"
                        placeholder="Search for help..."
                        className="w-full p-3 md:p-4 text-lg border rounded-lg shadow focus:ring-2 focus:text-primary-text-dark-pink focus:outline-none"
                    />
                </div>

                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <h2 className="text-xl font-semibold text-primary-text-dark-pink mb-2">Getting Started</h2>
                        <p className="text-gray-700">Learn the basics of our platform to get started quickly.</p>
                        <a href="#" className="text-primary-text-dark-pink mt-4 inline-block">Learn More →</a>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <h2 className="text-xl font-semibold text-primary-text-dark-pink mb-2">Account Management</h2>
                        <p className="text-gray-700">Manage your account, settings, and privacy preferences.</p>
                        <a href="#" className="text-primary-text-dark-pink mt-4 inline-block">Learn More →</a>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <h2 className="text-xl font-semibold text-primary-text-dark-pink mb-2">Troubleshooting</h2>
                        <p className="text-gray-700">Resolve common issues with step-by-step solutions.</p>
                        <a href="#" className="text-primary-text-dark-pink mt-4 inline-block">Learn More →</a>
                    </div>
                </section>

                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-800">How do I reset my password?</h3>
                            <p className="text-gray-600 mt-2">To reset your password, click on "Forgot Password" on the
                                login page and follow the instructions.</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-800">Can I upgrade my plan later?</h3>
                            <p className="text-gray-600 mt-2">Yes, you can upgrade or downgrade your plan anytime from
                                the account settings page.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default HelpPage