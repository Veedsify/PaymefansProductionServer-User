"use client";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowUpRight,
    Calendar,
    ChevronDown,
    Eye,
    Heart,
    Loader2,
    MessageSquare,
    Share2,
    TrendingUp,
    Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { type ChangeEvent, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useAuthContext } from "@/contexts/UserUseContext";
import {
    fetchAccountGrowthData,
    fetchAudienceData,
    fetchEngagementData,
    fetchMetrics,
    fetchRecentPosts,
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
    const { user } = useAuthContext();
    const [timeRange, setTimeRange] = useState<TimeRangeKey>("7days");

    // useEffect(() => {
    //     if (!user?.is_model && !user?.Model?.verification_status) {
    //         router.push("/profile");
    //     }
    // }, [user, router]);

    // TanStack Query hooks for fetching data
    const { data: accountGrowthData = [], isLoading: isLoadingGrowth } =
        useQuery({
            queryKey: ["analytics", "account-growth", timeRange],
            queryFn: () => fetchAccountGrowthData(timeRange),
            staleTime: 5 * 60 * 1000, // 5 minutes
        });

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
        icon,
    }: {
        title: string;
        value: string;
        trend: number;
        icon: React.ReactNode;
    }) => (
        <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg border-black/10 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {title}
                </span>
                {icon}
            </div>
            <div className="flex items-baseline">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {value}
                </h3>
                <span
                    className={`ml-2 text-xs flex items-center ${
                        trend > 0
                            ? "text-green-500 dark:text-green-400"
                            : trend < 0
                              ? "text-red-500 dark:text-red-400"
                              : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                    {trend > 0 ? "+" : ""}
                    {trend}%
                    {trend > 0 ? (
                        <ArrowUpRight size={12} className="ml-1" />
                    ) : trend < 0 ? (
                        <ArrowUpRight
                            size={12}
                            className="ml-1 transform rotate-90"
                        />
                    ) : null}
                </span>
            </div>
        </div>
    );

    const renderChartSkeleton = (height = 300) => (
        <div className="flex items-center justify-center" style={{ height }}>
            <Loader2
                className="text-purple-500 dark:text-purple-400 animate-spin"
                size={24}
            />
        </div>
    );

    return (
        <div className="md:p-6 p-4 pb-24 min-h-dvh bg-white dark:bg-black">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Analytics Dashboard
                </h1>
                <div className="flex items-center">
                    <div className="flex items-center p-2 mr-4 bg-white dark:bg-gray-800 border rounded-lg border-black/10 dark:border-gray-700">
                        <Calendar
                            size={16}
                            className="mr-2 text-gray-400 dark:text-gray-500"
                        />
                        <select
                            className="px-2 py-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100"
                            value={timeRange}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                setTimeRange(
                                    e.currentTarget.value as TimeRangeKey,
                                )
                            }
                            disabled={loading}
                        >
                            {timeRangeOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={16}
                            className="ml-1 text-gray-400 dark:text-gray-500"
                        />
                    </div>
                    {/* <button
            className="flex items-center px-4 py-2 text-white bg-purple-600 dark:bg-purple-700 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 animate-spin" size={16} />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            Export
          </button> */}
                </div>
            </div>

            {/* Overview metrics */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Followers"
                    value={metrics.followers.value}
                    trend={metrics.followers.trend}
                    icon={
                        <Users
                            size={16}
                            className="text-gray-400 dark:text-gray-500"
                        />
                    }
                />
                <MetricCard
                    title="Profile Views"
                    value={metrics.views.value}
                    trend={metrics.views.trend}
                    icon={
                        <Eye
                            size={16}
                            className="text-gray-400 dark:text-gray-500"
                        />
                    }
                />
                <MetricCard
                    title="Post Engagement"
                    value={metrics.engagement.value}
                    trend={metrics.engagement.trend}
                    icon={
                        <TrendingUp
                            size={16}
                            className="text-gray-400 dark:text-gray-500"
                        />
                    }
                />
                <MetricCard
                    title="Avg. Comments"
                    value={metrics.comments.value}
                    trend={metrics.comments.trend}
                    icon={
                        <MessageSquare
                            size={16}
                            className="text-gray-400 dark:text-gray-500"
                        />
                    }
                />
            </div>

            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Account growth chart */}
                <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg border-black/10 dark:border-gray-700 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-800 dark:text-gray-100">
                            Account Growth &nbsp;
                            {timeRange === "alltime" && (
                                <>
                                    {new Date(
                                        user?.created_at as Date,
                                    ).toLocaleDateString("en-US", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}{" "}
                                    - Now
                                </>
                            )}
                        </h2>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>Followers</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        {loading ? (
                            renderChartSkeleton()
                        ) : (
                            <LineChart data={accountGrowthData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888"
                                    fontSize={12}
                                />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "0.5rem",
                                        boxShadow:
                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
                <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg border-black/10 dark:border-gray-700">
                    <h2 className="mb-4 font-bold text-gray-800 dark:text-gray-100">
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
                                    {audienceData.map(
                                        (_: any, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ),
                                    )}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "0.5rem",
                                        boxShadow:
                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                            </PieChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Engagement metrics chart */}
                <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg border-black/10 dark:border-gray-700 lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-800 dark:text-gray-100">
                            Engagement Metrics
                        </h2>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
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
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888"
                                    fontSize={12}
                                />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "0.5rem",
                                        boxShadow:
                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="views"
                                    fill={BAR_COLORS[0]}
                                    name="Views"
                                />
                                <Bar
                                    dataKey="likes"
                                    fill={BAR_COLORS[1]}
                                    name="Likes"
                                />
                                <Bar
                                    dataKey="comments"
                                    fill={BAR_COLORS[2]}
                                    name="Comments"
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Recent posts */}
                <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg border-black/10 dark:border-gray-700 lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-800 dark:text-gray-100">
                            Recent Posts Performance
                        </h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {recentPostsData.length} posts
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2
                                    className="text-purple-500 dark:text-purple-400 animate-spin"
                                    size={24}
                                />
                            </div>
                        ) : recentPostsData.length > 0 ? (
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
                                            Post
                                        </th>
                                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
                                            Content
                                        </th>
                                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <Eye
                                                    size={14}
                                                    className="mr-1"
                                                />
                                                <span>Views</span>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <Heart
                                                    size={14}
                                                    className="mr-1"
                                                />
                                                <span>Likes</span>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <MessageSquare
                                                    size={14}
                                                    className="mr-1"
                                                />
                                                <span>Comments</span>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <Share2
                                                    size={14}
                                                    className="mr-1"
                                                />
                                                <span>Shares</span>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-500 dark:text-gray-400">
                                            Engagement Rate
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPostsData.map((post: any) => (
                                        <tr
                                            key={post.id}
                                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex items-center relative justify-center w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded">
                                                        <Image
                                                            src={post.thumbnail}
                                                            alt="Post thumbnail"
                                                            width={48}
                                                            height={48}
                                                            className=" w-full h-full aspect-square object-cover rounded"
                                                            onError={(
                                                                e: any,
                                                            ) => {
                                                                e.target.onerror =
                                                                    null;
                                                                e.target.src =
                                                                    "/site/banner.png";
                                                            }}
                                                        />
                                                        {post.hasMoreMedia && (
                                                            <div className="absolute bottom-1 z-10 right-1 bg-black/50 text-white text-xs px-1 rounded">
                                                                +
                                                                {post.hasMoreMedia
                                                                    ? "..."
                                                                    : ""}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {post.content ? (
                                                    post.content.length > 50 ? (
                                                        post.content.slice(
                                                            0,
                                                            50,
                                                        ) + "..."
                                                    ) : (
                                                        post.content
                                                    )
                                                ) : (
                                                    <span className="text-xs text-nowrap italic">
                                                        No content
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {post.date}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {post.views.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {post.likes.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {post.comments}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {post.shares}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    {post.engagement}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No posts found for the selected time range
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
