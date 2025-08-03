"use client";
import ROUTE from "@/config/routes";
import { X } from "lucide-react";
import { useState } from "react";

const AccountSuspendedSupportTicket = ({
  user,
  open = false,
  close,
}: {
  user: { email: string; name: string; username: string };
  open: boolean;
  close: () => void;
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
        className="absolute flex items-center justify-center w-12 h-12 bg-white border rounded-full cursor-pointer top-4 right-4 lg:top-16 lg:right-16 aspect-square  focus:outline-none focus:ring-2 focus:ring-pink-500"
        onClick={close}
      >
        <X />
      </button>
      <div className="w-full max-w-md px-4 py-8 bg-white border-pink-200 dark:bg-gray-900 h-dvh lg:h-auto lg:rounded-2xl lg:mt-0 mt-42 lg:p-8 animate-fade-in lg:border dark:border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 mb-2 bg-pink-100 rounded-full dark:bg-pink-900">
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
          <h2 className="mb-1 text-2xl font-extrabold text-center text-gray-800 dark:text-white">
            Support Ticket
          </h2>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Your account is{" "}
            <span className="font-semibold text-pink-600 dark:text-pink-400">
              suspended
            </span>
            . Please contact support for assistance.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="px-3 py-2 mb-2 text-sm text-center text-red-500 rounded bg-red-50 dark:bg-red-900">
              {error}
            </div>
          )}

          {loading && (
            <div className="px-3 py-2 mb-2 text-sm text-center text-blue-500 rounded bg-blue-50 dark:bg-blue-900">
              Submitting your ticket...
            </div>
          )}

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
              Ticket Subject
            </label>
            <input
              type="text"
              placeholder="Ticket Subject"
              className="w-full p-3 text-gray-800 border border-gray-300 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 shadow-sm"
              required
              defaultValue={`Account Suspended - ${userData.username}`}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Your Name"
              readOnly
              className="w-full p-3 text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 read-only:text-gray-400"
              required
              defaultValue={user.name}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
              Your Email
            </label>
            <input
              type="email"
              placeholder="Your Email"
              readOnly
              className="w-full p-3 text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 read-only:text-gray-400"
              required
              defaultValue={user.email}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
              Message
            </label>
            <textarea
              placeholder="Describe your issue..."
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 p-3 text-gray-800 border border-gray-300 rounded-lg resize-none dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 shadow-sm"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-white rounded-lg shadow-md cursor-pointer bg-primary-dark-pink hover:bg-primary-text-dark-pink disabled:bg-pink-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSuspendedSupportTicket;
