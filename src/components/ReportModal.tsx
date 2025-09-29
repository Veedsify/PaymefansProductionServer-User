"use client";

import { useState as useReactState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/Axios";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import { LucideSearch } from "lucide-react";

const ReportModal = ({
  isOpen,
  onClose,
  userId,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  username: string;
}) => {
  const [reportType, setReportType] = useReactState("");
  const [reportReason, setReportReason] = useReactState("");
  const [isSubmitting, setIsSubmitting] = useReactState(false);

  const reportTypes = [
    "spam",
    "harassment",
    "inappropriate_content",
    "fake_account",
    "copyright_violation",
    "other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportType || !reportReason.trim()) {
      toast.error("Please select a report type and provide a reason");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(
        `/report/user`,
        {
          reported_id: userId,
          report_type: reportType,
          report: reportReason,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Report submitted successfully");
        onClose();
        setReportType("");
        setReportReason("");
      } else {
        toast.error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="w-full max-w-md p-6 mx-4 bg-white dark:bg-gray-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Report {username}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LucideSearch size={20} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="">Select a reason</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Details
            </label>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please provide more details about this report..."
              className="w-full p-3 text-gray-900 bg-white border border-gray-300 rounded-lg resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              rows={4}
              required
            />
          </div>

          <div className="flex pt-4 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center flex-1 px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <LoadingSpinner /> : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
