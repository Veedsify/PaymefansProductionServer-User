"use client";
import { useUserAuthContext } from "@/lib/userUseContext";
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

// Mock API functions - replace with actual API calls later
type TimeRangeKey =
  | "24hrs"
  | "48hrs"
  | "3days"
  | "7days"
  | "1month"
  | "3months"
  | "6months"
  | "alltime";

const fetchAccountGrowthData = async (timeRange: TimeRangeKey) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const data: Record<TimeRangeKey, { name: string; followers: number }[]> = {
    "24hrs": [
      { name: "00:00", followers: 11000 },
      { name: "04:00", followers: 11050 },
      { name: "08:00", followers: 11100 },
      { name: "12:00", followers: 11180 },
      { name: "16:00", followers: 11200 },
      { name: "20:00", followers: 11220 },
    ],
    "48hrs": [
      { name: "Day 1", followers: 10900 },
      { name: "Day 2", followers: 11220 },
    ],
    "3days": [
      { name: "Day 1", followers: 10700 },
      { name: "Day 2", followers: 10950 },
      { name: "Day 3", followers: 11220 },
    ],
    "7days": [
      { name: "Mon", followers: 10500 },
      { name: "Tue", followers: 10620 },
      { name: "Wed", followers: 10780 },
      { name: "Thu", followers: 10900 },
      { name: "Fri", followers: 11050 },
      { name: "Sat", followers: 11180 },
      { name: "Sun", followers: 11220 },
    ],
    "1month": [
      { name: "Week 1", followers: 9500 },
      { name: "Week 2", followers: 10200 },
      { name: "Week 3", followers: 10700 },
      { name: "Week 4", followers: 11220 },
    ],
    "3months": [
      { name: "Month 1", followers: 7800 },
      { name: "Month 2", followers: 9500 },
      { name: "Month 3", followers: 11220 },
    ],
    "6months": [
      { name: "Month 1", followers: 4900 },
      { name: "Month 2", followers: 5800 },
      { name: "Month 3", followers: 6800 },
      { name: "Month 4", followers: 8200 },
      { name: "Month 5", followers: 9500 },
      { name: "Month 6", followers: 11220 },
    ],
    alltime: [
      { name: "Jan", followers: 2400 },
      { name: "Feb", followers: 3600 },
      { name: "Mar", followers: 4900 },
      { name: "Apr", followers: 6800 },
      { name: "May", followers: 8100 },
      { name: "Jun", followers: 9400 },
      { name: "Jul", followers: 4200 },
      { name: "Aug", followers: 9400 },
      { name: "Sep", followers: 9300 },
      { name: "Oct", followers: 2233 },
      { name: "Nov", followers: 3300 },
      { name: "Dec", followers: 3004 },
    ],
  };
  return data[timeRange as TimeRangeKey] || data["7days"];
};

const fetchEngagementData = async (timeRange: any) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const data = {
    "24hrs": [
      { name: "00:00", likes: 20, comments: 5, views: 300 },
      { name: "04:00", likes: 45, comments: 12, views: 650 },
      { name: "08:00", likes: 80, comments: 25, views: 1200 },
      { name: "12:00", likes: 120, comments: 40, views: 1800 },
      { name: "16:00", likes: 180, comments: 55, views: 2500 },
      { name: "20:00", likes: 240, comments: 70, views: 3200 },
    ],
    "48hrs": [
      { name: "Day 1", likes: 720, comments: 190, views: 8900 },
      { name: "Day 2", likes: 850, comments: 210, views: 10200 },
    ],
    "3days": [
      { name: "Day 1", likes: 680, comments: 180, views: 8500 },
      { name: "Day 2", likes: 720, comments: 190, views: 8900 },
      { name: "Day 3", likes: 850, comments: 210, views: 10200 },
    ],
    "7days": [
      { name: "Mon", likes: 240, comments: 140, views: 2400 },
      { name: "Tue", likes: 300, comments: 180, views: 3800 },
      { name: "Wed", likes: 450, comments: 210, views: 5200 },
      { name: "Thu", likes: 280, comments: 120, views: 3100 },
      { name: "Fri", likes: 590, comments: 240, views: 6700 },
      { name: "Sat", likes: 720, comments: 320, views: 8900 },
      { name: "Sun", likes: 450, comments: 190, views: 5600 },
    ],
    "1month": [
      { name: "Week 1", likes: 1800, comments: 650, views: 22000 },
      { name: "Week 2", likes: 2100, comments: 720, views: 25000 },
      { name: "Week 3", likes: 2400, comments: 850, views: 29000 },
      { name: "Week 4", likes: 2700, comments: 920, views: 32000 },
    ],
    "3months": [
      { name: "Month 1", likes: 6500, comments: 2200, views: 78000 },
      { name: "Month 2", likes: 7200, comments: 2500, views: 85000 },
      { name: "Month 3", likes: 8500, comments: 2900, views: 102000 },
    ],
    "6months": [
      { name: "Month 1", likes: 3200, comments: 1100, views: 38000 },
      { name: "Month 2", likes: 4500, comments: 1500, views: 52000 },
      { name: "Month 3", likes: 5200, comments: 1800, views: 62000 },
      { name: "Month 4", likes: 6500, comments: 2200, views: 78000 },
      { name: "Month 5", likes: 7200, comments: 2500, views: 85000 },
      { name: "Month 6", likes: 8500, comments: 2900, views: 102000 },
    ],
    alltime: [
      { name: "2022", likes: 25000, comments: 8500, views: 300000 },
      { name: "2023", likes: 42000, comments: 15000, views: 500000 },
      { name: "2024", likes: 38000, comments: 12000, views: 450000 },
    ],
  };

  return data[timeRange as TimeRangeKey] || data["7days"];
};

const fetchAudienceData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  // Remember To Fetch Based On Date
  return [
    { name: "18-24", value: 25 },
    { name: "25-34", value: 40 },
    { name: "35-44", value: 20 },
    { name: "45-54", value: 10 },
    { name: "55+", value: 5 },
  ];
};

const fetchRecentPosts = async (timeRange: any) => {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const basePosts = [
    {
      id: 1,
      thumbnail: "/api/placeholder/400/400",
      likes: 1243,
      comments: 89,
      views: 15620,
      shares: 45,
      engagement: 8.2,
      date: "2 days ago",
      timestamp: Date.now() - 172800000,
    },
    {
      id: 2,
      thumbnail: "/api/placeholder/400/400",
      likes: 2431,
      comments: 156,
      views: 28430,
      shares: 102,
      engagement: 9.5,
      date: "4 days ago",
      timestamp: Date.now() - 345600000,
    },
    {
      id: 3,
      thumbnail: "/api/placeholder/400/400",
      likes: 984,
      comments: 67,
      views: 12540,
      shares: 23,
      engagement: 7.8,
      date: "1 week ago",
      timestamp: Date.now() - 604800000,
    },
    {
      id: 4,
      thumbnail: "/api/placeholder/400/400",
      likes: 1876,
      comments: 124,
      views: 19730,
      shares: 67,
      engagement: 8.9,
      date: "2 weeks ago",
      timestamp: Date.now() - 1209600000,
    },
    {
      id: 5,
      thumbnail: "/api/placeholder/400/400",
      likes: 3200,
      comments: 210,
      views: 35600,
      shares: 145,
      engagement: 9.8,
      date: "3 weeks ago",
      timestamp: Date.now() - 1814400000,
    },
    {
      id: 6,
      thumbnail: "/api/placeholder/400/400",
      likes: 4200,
      comments: 280,
      views: 45200,
      shares: 180,
      engagement: 10.2,
      date: "1 month ago",
      timestamp: Date.now() - 2592000000,
    },
  ];

  const now = Date.now();
  let filteredPosts = [];

  switch (timeRange) {
    case "24hrs":
      filteredPosts = basePosts.filter(
        (post) => now - post.timestamp <= 86400000
      );
      break;
    case "48hrs":
      filteredPosts = basePosts.filter(
        (post) => now - post.timestamp <= 172800000
      );
      break;
    case "3days":
      filteredPosts = basePosts.filter(
        (post) => now - post.timestamp <= 259200000
      );
      break;
    case "7days":
      filteredPosts = basePosts.filter(
        (post) => now - post.timestamp <= 604800000
      );
      break;
    case "1month":
      filteredPosts = basePosts.filter(
        (post) => now - post.timestamp <= 2592000000
      );
      break;
    case "3months":
      filteredPosts = basePosts.filter(
        (post) => now - post.timestamp <= 7776000000
      );
      break;
    case "6months":
      filteredPosts = basePosts.filter(
        (post) => now - post.timestamp <= 15552000000
      );
      break;
    case "alltime":
      filteredPosts = basePosts;
      break;
    default:
      filteredPosts = basePosts.filter(
        (post) => now - post.timestamp <= 604800000
      );
  }

  return filteredPosts;
};

const fetchMetrics = async (timeRange: any) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  // These would normally be calculated from the actual data
  const metrics = {
    "24hrs": {
      followers: { value: "11.22K", trend: 0.5 },
      views: { value: "3.2K", trend: 12.3 },
      engagement: { value: "8.9%", trend: 1.2 },
      comments: { value: "78", trend: 8.5 },
    },
    "48hrs": {
      followers: { value: "11.22K", trend: 1.2 },
      views: { value: "6.5K", trend: 10.8 },
      engagement: { value: "8.7%", trend: 0.8 },
      comments: { value: "142", trend: 7.2 },
    },
    "3days": {
      followers: { value: "11.22K", trend: 1.8 },
      views: { value: "9.8K", trend: 9.5 },
      engagement: { value: "8.5%", trend: 0.5 },
      comments: { value: "210", trend: 6.8 },
    },
    "7days": {
      followers: { value: "11.2K", trend: 5.7 },
      views: { value: "32.4K", trend: 12.3 },
      engagement: { value: "8.7%", trend: -2.1 },
      comments: { value: "142", trend: 8.5 },
    },
    "1month": {
      followers: { value: "11.5K", trend: 8.2 },
      views: { value: "128K", trend: 15.4 },
      engagement: { value: "9.1%", trend: 3.2 },
      comments: { value: "580", trend: 12.7 },
    },
    "3months": {
      followers: { value: "12.8K", trend: 18.5 },
      views: { value: "420K", trend: 22.1 },
      engagement: { value: "9.5%", trend: 5.4 },
      comments: { value: "1850", trend: 18.3 },
    },
    "6months": {
      followers: { value: "15.2K", trend: 32.7 },
      views: { value: "950K", trend: 28.9 },
      engagement: { value: "10.2%", trend: 8.7 },
      comments: { value: "4200", trend: 25.4 },
    },
    alltime: {
      followers: { value: "22.4K", trend: 45.2 },
      views: { value: "2.4M", trend: 38.7 },
      engagement: { value: "11.5%", trend: 12.3 },
      comments: { value: "12500", trend: 32.8 },
    },
  };

  return metrics[timeRange as TimeRangeKey] || metrics["7days"];
};

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
  const [loading, setLoading] = useState(false);
  const [accountGrowthData, setAccountGrowthData] = useState<any>([]);
  const [engagementData, setEngagementData] = useState<any>([]);
  const [audienceData, setAudienceData] = useState<any>([]);
  const [recentPostsData, setRecentPostsData] = useState<any>([]);
  const [metrics, setMetrics] = useState({
    followers: { value: "0", trend: 0 },
    views: { value: "0", trend: 0 },
    engagement: { value: "0%", trend: 0 },
    comments: { value: "0", trend: 0 },
  });

  // useEffect(() => {
  //     if (!user?.is_model && !user?.Model?.verification_status) {
  //         router.push("/profile");
  //     }
  // }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [growthData, engagement, audience, posts, metricsData] =
          await Promise.all([
            fetchAccountGrowthData(timeRange),
            fetchEngagementData(timeRange),
            fetchAudienceData(),
            fetchRecentPosts(timeRange),
            fetchMetrics(timeRange),
          ]);

        setAccountGrowthData(growthData);
        setEngagementData(engagement);
        setAudienceData(audience);
        setRecentPostsData(posts);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

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
                              className="w-full h-full rounded object-cover"
                              onError={(e: any) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18c6b8a6e8e%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18c6b8a6e8e%22%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22147.5%22%20y%3D%22218.1%22%3E400x400%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
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
