"use client";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/Axios";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import { Bird, LucideSearch } from "lucide-react";
import { useState } from "react";

const ReportModal = ({
  isOpen,
  onClose,
  userId,
  defaultReason,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  defaultReason?: string;
  username: string;
}) => {
  const [reportType, setReportType] = useState("");
  const [reportReason, setReportReason] = useState(defaultReason || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await axiosInstance.post(`/report/user`, {
        reported_id: userId,
        report_type: reportType,
        report: reportReason,
      });

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
    <div
      onClick={() => onClose?.()}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md lg:p-6 p-5 mx-4 bg-white dark:bg-gray-800 rounded-lg
        sm:mx-4 sm:p-4
        xs:mx-2 xs:p-3
        xs:rounded-lg
        xs:max-w-full
        xs:h-full
        xs:overflow-y-auto
        xs:flex xs:flex-col xs:justify-center
      "
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Report {username}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Bird size={20} className="text-red-500" />
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
              className="w-full p-3 text-xs md:text-sm text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
              className="w-full p-2 placeholder:text-sm md:p-3 text-gray-900 bg-white border border-gray-300 text-xs md:text-sm rounded-lg resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              rows={4}
              required
            />
          </div>

          <div className="flex pt-4 gap-3 flex-col xs:flex-col sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 text-xs md:text-sm p-2 md:px-4 md:py-3 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 flex items-center text-xs md:text-sm justify-center p-2 md:px-4 md:py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
