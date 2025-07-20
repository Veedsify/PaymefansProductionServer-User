"use client";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { useRouter } from "next/navigation";
import { ChangeEvent, ReactNode, useEffect } from "react";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  ArrowUpRight,
  Filter,
  Download,
  Loader2,
} from "lucide-react";
import numeral from "numeral";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAccountGrowthData,
  fetchEngagementData,
  fetchAudienceData,
  fetchRecentPosts,
  fetchMetrics,
} from "@/utils/data/AnalyticsAPI";

type TimeRangeKey =
  | "24hrs"
  | "48hrs"
  | "3days"
  | "7days"
  | "1month"
  | "3months"
  | "6months"
  | "alltime";

const COLORS = ["#78158E", "#CC0DF8", "#F4900C", "#04D900", "#e057ff"];
const BAR_COLORS = ["#78158E", "#CC0DF8", "#F4900C"];

const timeRangeOptions = [
  { value: "24hrs", label: "24 Hours" },
  { value: "48hrs", label: "48 Hours" },
  { value: "3days", label: "3 Days" },
  { value: "7days", label: "7 Days" },
  { value: "1month", label: "1 Month" },
  { value: "3months", label: "3 Months" },
  { value: "6months", label: "6 Months" },
  { value: "alltime", label: "All Time" },
];

export default function Analytics() {
  const { user } = useUserAuthContext();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("7days");

  // useEffect(() => {
  //     if (!user?.is_model && !user?.Model?.verification_status) {
  //         router.push("/profile");
  //     }
  // }, [user, router]);

  // TanStack Query hooks for fetching data
  const { data: accountGrowthData = [], isLoading: isLoadingGrowth } = useQuery(
    {
      queryKey: ["analytics", "account-growth", timeRange],
      queryFn: () => fetchAccountGrowthData(timeRange),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: engagementData = [], isLoading: isLoadingEngagement } =
    useQuery({
      queryKey: ["analytics", "engagement", timeRange],
      queryFn: () => fetchEngagementData(timeRange),
      staleTime: 5 * 60 * 1000,
    });

  const { data: audienceData = [], isLoading: isLoadingAudience } = useQuery({
    queryKey: ["analytics", "audience"],
    queryFn: fetchAudienceData,
    staleTime: 30 * 60 * 1000, // 30 minutes - audience data changes less frequently
  });

  const { data: recentPostsData = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["analytics", "recent-posts", timeRange],
    queryFn: () => fetchRecentPosts(timeRange),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: metrics = {
      followers: { value: "0", trend: 0 },
      views: { value: "0", trend: 0 },
      engagement: { value: "0%", trend: 0 },
      comments: { value: "0", trend: 0 },
    },
    isLoading: isLoadingMetrics,
  } = useQuery({
    queryKey: ["analytics", "metrics", timeRange],
    queryFn: () => fetchMetrics(timeRange),
    staleTime: 5 * 60 * 1000,
  });

  // Combined loading state
  const loading =
    isLoadingGrowth ||
    isLoadingEngagement ||
    isLoadingAudience ||
    isLoadingPosts ||
    isLoadingMetrics;

  // Card component for metrics
  const MetricCard = ({
    title,
    value,
    trend,
    icon: Icon,
  }: {
    title: string;
    value: string;
    trend: number;
    icon: any;
  }) => (
    <div className="bg-white rounded-lg border border-black/10 p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-500 text-sm">{title}</span>
        <Icon size={16} className="text-gray-400" />
      </div>
      <div className="flex items-baseline">
        <h3 className="text-2xl font-bold">{value}</h3>
        <span
          className={`ml-2 text-xs flex items-center ${
            trend > 0
              ? "text-green-500"
              : trend < 0
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
          {trend > 0 ? (
            <ArrowUpRight size={12} className="ml-1" />
          ) : trend < 0 ? (
            <ArrowUpRight size={12} className="ml-1 transform rotate-90" />
          ) : null}
        </span>
      </div>
    </div>
  );

  const renderChartSkeleton = (height = 300) => (
    <div className="flex items-center justify-center" style={{ height }}>
      <Loader2 className="animate-spin text-purple-500" size={24} />
    </div>
  );

  return (
    <div className="min-h-dvh p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>
        <div className="flex items-center">
          <div className="bg-white rounded-lg border border-black/10 flex items-center p-2 mr-4">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <select
              className="bg-transparent border-none focus:outline-none focus:ring-0 px-2 py-1"
              value={timeRange}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setTimeRange(e.currentTarget.value as TimeRangeKey)
              }
              disabled={loading}
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="text-gray-400 ml-1" />
          </div>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            Export
          </button>
        </div>
      </div>

      {/* Overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Followers"
          value={metrics.followers.value}
          trend={metrics.followers.trend}
          icon={Users}
        />
        <MetricCard
          title="Profile Views"
          value={metrics.views.value}
          trend={metrics.views.trend}
          icon={Eye}
        />
        <MetricCard
          title="Post Engagement"
          value={metrics.engagement.value}
          trend={metrics.engagement.trend}
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg. Comments"
          value={metrics.comments.value}
          trend={metrics.comments.trend}
          icon={MessageSquare}
        />
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account growth chart */}
        <div className="bg-white rounded-lg border border-black/10 p-4 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">
              Account Growth &nbsp;
              {timeRange === "alltime" && (
                <>
                  {new Date(user?.created_at as Date).toLocaleDateString(
                    "en-US",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}{" "}
                  - Now
                </>
              )}
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <span>Followers</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {loading ? (
              renderChartSkeleton()
            ) : (
              <LineChart data={accountGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="#78158E"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Audience demographics */}
        <div className="bg-white rounded-lg border border-black/10 p-4">
          <h2 className="font-bold text-gray-800 mb-4">
            Audience Demographics
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            {loading ? (
              renderChartSkeleton()
            ) : (
              <PieChart>
                <Pie
                  data={audienceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {audienceData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Engagement metrics chart */}
        <div className="bg-white rounded-lg border border-black/10 p-4 lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Engagement Metrics</h2>
            <div className="flex items-center text-sm text-gray-500">
              <span>
                Last{" "}
                {timeRange === "24hrs"
                  ? "24 Hours"
                  : timeRange === "48hrs"
                  ? "48 Hours"
                  : timeRange === "3days"
                  ? "3 Days"
                  : timeRange === "7days"
                  ? "7 Days"
                  : timeRange === "1month"
                  ? "Month"
                  : timeRange === "3months"
                  ? "3 Months"
                  : timeRange === "6months"
                  ? "6 Months"
                  : "All Time"}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {loading ? (
              renderChartSkeleton()
            ) : (
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Bar dataKey="views" fill={BAR_COLORS[0]} name="Views" />
                <Bar dataKey="likes" fill={BAR_COLORS[1]} name="Likes" />
                <Bar dataKey="comments" fill={BAR_COLORS[2]} name="Comments" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Recent posts */}
        <div className="bg-white rounded-lg border border-black/10 p-4 lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">
              Recent Posts Performance
            </h2>
            <div className="text-sm text-gray-500">
              Showing {recentPostsData.length} posts
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin text-purple-500" size={24} />
              </div>
            ) : recentPostsData.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Post
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      <div className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        <span>Views</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      <div className="flex items-center">
                        <Heart size={14} className="mr-1" />
                        <span>Likes</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      <div className="flex items-center">
                        <MessageSquare size={14} className="mr-1" />
                        <span>Comments</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      <div className="flex items-center">
                        <Share2 size={14} className="mr-1" />
                        <span>Shares</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Engagement Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPostsData.map((post: any) => (
                    <tr
                      key={post.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                            <Image
                              src={post.thumbnail}
                              alt="Post thumbnail"
                              width={48}
                              height={48}
                              className="w-full h-full rounded object-cover"
                              onError={(e: any) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "/site/banner.png";
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {post.date}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {post.likes.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm">{post.comments}</td>
                      <td className="py-4 px-4 text-sm">{post.shares}</td>
                      <td className="py-4 px-4">
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {post.engagement}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No posts found for the selected time range
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
