import React from "react";

const ContactPage = () => {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black px-1 py-4 sm:px-2 sm:py-8">
          <div className="w-full max-w-xs sm:max-w-lg bg-white dark:bg-black rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Logo Section */}
            <div className="flex justify-center items-center pt-6 pb-1 sm:pt-8 sm:pb-2">
              <img
                src="/site/logos/logo1.png"
                alt="Logo"
                className="h-10 w-20 sm:h-14 sm:w-28 md:h-16 md:w-42 block mb-2 sm:mb-4 drop-shadow-xl"
              />
            </div>
            {/* Gradient Header */}
            <div className="relative p-4 sm:p-6 bg-primary-dark-pink">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 sm:mb-2 tracking-tight drop-shadow-lg">
                  Contact Us
                </h1>
                <p className="text-white/80 text-center text-sm sm:text-base md:text-lg font-medium">
                  We'd love to hear from you! Fill out the form below and we'll
                  get back to you soon.
                </p>
              </div>
            </div>
            {/* Form Section */}
            <form className="space-y-4 sm:space-y-6 p-4 sm:p-8">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-1 sm:mb-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-200"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-gray-900 bg-white border border-gray-200 outline-none dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white focus:border-primary-dark-pink focus:ring-4 focus:ring-primary-dark-pink/30 transition-all duration-300"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 sm:mb-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-200"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-gray-900 bg-white border border-gray-200 outline-none dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white focus:border-primary-dark-pink focus:ring-4 focus:ring-primary-dark-pink/30 transition-all duration-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block mb-1 sm:mb-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-200"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-gray-900 bg-white border border-gray-200 outline-none resize-none dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white focus:border-primary-dark-pink focus:ring-4 focus:ring-primary-dark-pink/30 transition-all duration-300"
                  placeholder="Type your message..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full group relative px-6 py-2 sm:px-8 sm:py-3 bg-primary-dark-pink text-white rounded-xl hover:scale-[1.02] transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:bg-primary-text-dark-pink focus:outline-none focus:ring-4 focus:ring-primary-dark-pink/40"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Send Message
                </span>
                <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-purple-700 to-pink-700 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </button>
            </form>
          </div>
        </div>
      );
};

export default ContactPage;
