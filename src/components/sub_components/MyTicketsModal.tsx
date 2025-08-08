"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  X,
  Eye,
  MessageSquare,
} from "lucide-react";
import { useUserAuthContext } from "@/lib/UserUseContext";
import axiosInstance from "@/utils/Axios";
import toast from "react-hot-toast";

type SupportTicket = {
  id: number;
  ticket_id: string;
  subject: string;
  message: string;
  status: "open" | "pending" | "closed";
  created_at: string;
  updated_at: string;
  SupportTicketReplies?: SupportTicketReply[];
};

type SupportTicketReply = {
  id: number;
  ticket_id: string;
  user_id: number;
  message: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    username: string;
    profile_image: string;
    admin: boolean;
  };
};

type PaginationInfo = {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
};

interface MyTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshTrigger?: number;
}

const MyTicketsModal = ({
  isOpen,
  onClose,
  refreshTrigger,
}: MyTicketsModalProps) => {
  const { user } = useUserAuthContext();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen && user) {
      const fetchTickets = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(
            `/support/tickets?page=${currentPage}&limit=10`,
          );

          if (response.data.error) {
            toast.error(
              response.data.message || "Failed to fetch support tickets",
            );
            return;
          }

          setTickets(response.data.data.tickets);
          setPagination(response.data.data.pagination);
        } catch (error: any) {
          console.error("Error fetching support tickets:", error);
          toast.error("Failed to fetch support tickets");
        } finally {
          setLoading(false);
        }
      };
      fetchTickets();
    }
  }, [isOpen, user, currentPage]);

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await axiosInstance.get(`/support/tickets/${ticketId}`);

      if (response.data.error) {
        toast.error(response.data.message || "Failed to fetch ticket details");
        return;
      }

      setSelectedTicket(response.data.data);
    } catch (error: any) {
      console.error("Error fetching ticket details:", error);
      toast.error("Failed to fetch ticket details");
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSubmittingReply(true);
    try {
      const response = await axiosInstance.post(
        `/support/tickets/${selectedTicket.ticket_id}/reply`,
        { message: replyMessage },
      );

      if (response.data.error) {
        toast.error(response.data.message || "Failed to send reply");
        return;
      }

      toast.success("Reply sent successfully");
      setReplyMessage("");
      // Refresh ticket details to show the new reply
      fetchTicketDetails(selectedTicket.ticket_id);
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "closed":
        return <CheckCircle className="w-4 h-4 text-red-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 transition-all"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, type: "spring", damping: 20 }}
        className="relative h-screen w-full lg:h-[90vh] lg:w-[95vw] max-w-6xl bg-white dark:bg-gray-900 lg:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
        tabIndex={0}
        aria-label="My support tickets modal"
      >
        {/* Header */}
        <div className="relative p-6 bg-primary-dark-pink">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <MessageSquare size={24} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  My Support Tickets
                </h1>
                <p className="text-white/80 text-sm">
                  View and manage your support conversations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="lg:flex flex-1 overflow-auto lg:overflow-hidden">
          {/* Tickets List */}
          <div className="lg:w-1/3 w-full border-b lg:border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                All Tickets ({pagination?.total_count || 0})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark-pink"></div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <MessageCircle size={48} className="mb-2 opacity-50" />
                  <p>No support tickets found</p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => fetchTicketDetails(ticket.ticket_id)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                        selectedTicket?.id === ticket.id
                          ? "bg-primary-dark-pink/10 border-primary-dark-pink"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              ticket.status,
                            )}`}
                          >
                            {ticket.status.toUpperCase()}
                          </span>
                        </div>
                        <Eye size={16} className="text-gray-400" />
                      </div>

                      <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                        {ticket.subject}
                      </h4>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {ticket.message}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>#{ticket.ticket_id}</span>
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.has_prev}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.has_next}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Details */}
          <div className="lg:flex-1 flex flex-col ">
            {selectedTicket ? (
              <>
                {/* Ticket Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedTicket.subject}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Ticket #{selectedTicket.ticket_id}</span>
                        <span>
                          Created {formatDate(selectedTicket.created_at)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedTicket.status,
                      )}`}
                    >
                      {selectedTicket.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Original Message */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={user?.profile_image || "/default-avatar.png"}
                        alt="Your avatar"
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user?.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(selectedTicket.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedTicket.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedTicket.SupportTicketReplies?.map((reply) => (
                    <div key={reply.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={
                            reply.user.profile_image || "/default-avatar.png"
                          }
                          alt={`${reply.user.name}'s avatar`}
                          className="w-10 h-10 rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`rounded-lg p-4 ${
                            reply.user.admin
                              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {reply.user.name}
                            </span>
                            {reply.user.admin && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                                Support Team
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== "closed" && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleReplySubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="reply"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Add a reply
                        </label>
                        <textarea
                          id="reply"
                          rows={3}
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-dark-pink focus:border-transparent dark:bg-gray-800 dark:text-white"
                          placeholder="Type your reply here..."
                          disabled={isSubmittingReply}
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingReply || !replyMessage.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-dark-pink text-white rounded-lg hover:bg-primary-dark-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send size={16} />
                          {isSubmittingReply ? "Sending..." : "Send Reply"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle
                    size={64}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p className="text-lg font-medium mb-2">No ticket selected</p>
                  <p>Choose a ticket from the list to view the conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MyTicketsModal;
