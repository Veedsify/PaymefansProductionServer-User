import axiosInstance from "../Axios";
import { getToken } from "../Cookie";

type TimeRangeKey =
  | "24hrs"
  | "48hrs"
  | "3days"
  | "7days"
  | "1month"
  | "3months"
  | "6months"
  | "alltime";

export const fetchAccountGrowthData = async (timeRange: TimeRangeKey) => {
  const response = await axiosInstance.get(
    `/analytics/account-growth/${timeRange}`,
  );
  return response.data.data;
};

export const fetchEngagementData = async (timeRange: TimeRangeKey) => {
  const response = await axiosInstance.get(
    `/analytics/engagement/${timeRange}`,
  );
  return response.data.data;
};

export const fetchAudienceData = async () => {
  const response = await axiosInstance.get(`/analytics/audience`);
  return response.data.data;
};

export const fetchRecentPosts = async (timeRange: TimeRangeKey) => {
  const response = await axiosInstance.get(
    `/analytics/recent-posts/${timeRange}`,
  );
  return response.data.data;
};

export const fetchMetrics = async (timeRange: TimeRangeKey) => {
  const response = await axiosInstance.get(`/analytics/metrics/${timeRange}`);
  return response.data.data;
};
