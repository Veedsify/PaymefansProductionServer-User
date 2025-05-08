"use client";
import ROUTE from "@/config/routes";
import { X } from "lucide-react";
import { useState } from "react";

const SuspendedSupportTicketForm = ({
  user,
  open = false,
  close,
}: {
  user: { email: string; name: string; username: string };
  open: boolean;
  close: () => voi0d;
}) => {
  const [userData, _] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(ROUTE.ACCOUNT_SUSPENDED_TICKET, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit ticket");
      }

      alert("Ticket submitted successfully!");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed bg-white inset-0 dark:bg-gray-900 flex items-center justify-center z-50 p-4 ${
        open ? "block animate-in" : "hidden"
      }`}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute top-4 right-4 lg:top-16 lg:right-16 aspect-square flex items-center justify-center  w-12 h-12 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 border cursor-pointer"
        onClick={close}
      >
        <X />
      </button>
      <div className="bg-white dark:bg-gray-900 h-screen lg:h-auto lg:rounded-2xl px-4 lg:mt-0 mt-42 py-8 lg:p-8 max-w-md w-full animate-fade-in lg:border border-pink-200 dark:border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-pink-100 dark:bg-pink-900 rounded-full p-3 mb-2">
            <svg
              className="w-8 h-8 text-pink-600 dark:text-pink-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white text-center mb-1">
            Support Ticket
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
            Your account is{" "}
            <span className="font-semibold text-pink-600 dark:text-pink-400">
              suspended
            </span>
            . Please contact support for assistance.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center mb-2 bg-red-50 dark:bg-red-900 rounded py-2 px-3">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-blue-500 text-sm text-center mb-2 bg-blue-50 dark:bg-blue-900 rounded py-2 px-3">
              Submitting your ticket...
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ticket Subject
            </label>
            <input
              type="text"
              placeholder="Ticket Subject"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 shadow-sm"
              required
              defaultValue={`Account Suspended - ${userData.username}`}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Your Name"
              readOnly
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 read-only:text-gray-400"
              required
              defaultValue={user.name}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Your Email
            </label>
            <input
              type="email"
              placeholder="Your Email"
              readOnly
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 read-only:text-gray-400"
              required
              defaultValue={user.email}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              placeholder="Describe your issue..."
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white h-32 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 shadow-sm resize-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-dark-pink hover:bg-primary-text-dark-pink disabled:bg-pink-400 text-white font-semibold py-3 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-md cursor-pointer"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuspendedSupportTicketForm;
