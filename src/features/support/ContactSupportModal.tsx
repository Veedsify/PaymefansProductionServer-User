"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/contexts/UserUseContext";
import axiosInstance from "@/utils/Axios";

// Helper types
type Message = {
  id: number;
  text: string;
  sender: "user" | "support";
  time: string;
  status?: "sent" | "seen" | "sending";
  agentName?: string;
  agentRole?: string;
};

type Agent = {
  name: string;
  role: string;
  avatar: string;
  status: "online" | "away" | "busy";
  rating: number;
};

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const AVATAR_USER = "https://randomuser.me/api/portraits/men/75.jpg";

interface ContactSupportModalProps {
  onTicketCreated?: () => void;
}

const ContactSupportModal = ({
  onTicketCreated,
}: ContactSupportModalProps = {}) => {
  const { user } = useAuthContext();
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  // Reset all state on close
  const handleClose = () => {
    setShow(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      subject: "",
      message: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to contact support");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/support/tickets", formData);

      if (response.data.error) {
        toast.error(response.data.message || "Failed to submit support ticket");
        return;
      }

      toast.success(
        "Support ticket submitted successfully! We'll get back to you soon.",
      );
      handleClose();

      // Trigger callback to refresh tickets if provided
      if (onTicketCreated) {
        onTicketCreated();
      }
    } catch (error: any) {
      console.error("Error submitting support ticket:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit support ticket. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "away":
        return "bg-yellow-400";
      case "busy":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  // Enhanced tab button style
  const tabBtn = (active: boolean) =>
    `flex-1 text-center pb-3 pt-4 font-semibold text-lg transition-all duration-300 border-b-3 relative overflow-hidden ${
      active
        ? "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20"
        : "border-transparent text-gray-500 hover:text-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800"
    }`;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="relative overflow-hidden px-4 py-2 text-sm font-semibold bg-white cursor-pointer group text-nowrap text-primary-dark-pink hover:bg-primary-dark-pink hover:text-white rounded-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
      >
        <span className="relative z-10 flex items-center gap-3">
          <MessageCircle
            size={20}
            className="group-hover:rotate-12 transition-transform duration-300"
          />
          Contact Support
        </span>
        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></span>
      </button>
      {show && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 transition-all"
          aria-modal="true"
          role="dialog"
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, type: "spring", damping: 20 }}
            className="relative h-dvh w-full lg:max-w-3xl bg-white dark:bg-gray-900 lg:rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col lg:max-h-[90vh] overflow-hidden"
            tabIndex={0}
            aria-label="Contact support modal"
          >
            {/* Gradient Header */}
            <div className="relative p-6 bg-primary-dark-pink">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Headphones size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      Get In Touch with Support
                    </h1>
                    <p className="text-white/80">
                      We&apos;re here to help you with any questions or issues
                      you may have.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {/* Contact Tab */}
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.2 }}
                className="flex-1 p-8 overflow-auto bg-white dark:bg-black pb-24"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8">
                    <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                      Get in Touch
                    </h2>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200"
                        >
                        Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 text-gray-900 bg-white border-1 border-gray-200 outline-none dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 text-gray-900 bg-white border-1 border-gray-200 outline-none dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 text-gray-900 bg-white border-1 border-gray-200 outline-none dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
                        placeholder="How can we help you today?"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 text-gray-900 bg-white border-1 border-gray-200 outline-none resize-none dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
                        placeholder="Tell us more about your request..."
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full group relative px-8 py-3 bg-primary-dark-pink text-white rounded-xl hover:scale-[1.02] transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <Send
                          size={20}
                          className={`${
                            isSubmitting
                              ? "animate-spin"
                              : "group-hover:rotate-12"
                          } transition-transform duration-300`}
                        />
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </span>
                      <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-purple-700 to-pink-700 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </form>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ContactSupportModal;
