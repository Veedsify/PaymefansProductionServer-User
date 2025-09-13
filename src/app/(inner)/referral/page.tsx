"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Check, Users, TrendingUp, Gift, Share2 } from "lucide-react";
import { useAuthContext } from "@/contexts/UserUseContext";

const ReferralPage = () => {
  const [activeTab, setActiveTab] = useState<"users" | "earnings">("users");
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { user } = useAuthContext();

  // Mock data - replace with actual API calls
  const referralCode = "PF-" + user?.user_id; // Replace with dynamic code
  const referralLink = `https://paymefans.com/referral?ref=${referralCode}`;
  const referredUsers = [
    {
      id: 1,
      name: "John Doe",
      username: "johndoe",
      joinDate: "2023-10-01",
      earnings: 50,
      profileImage: "/site/avatar.png",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      username: "janesmith",
      joinDate: "2023-09-15",
      earnings: 75,
      profileImage: "/site/avatar.png",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      username: "mikej",
      joinDate: "2023-08-20",
      earnings: 100,
      profileImage: "/site/avatar.png",
      status: "active",
    },
  ];

  const totalEarnings = referredUsers.reduce(
    (sum, user) => sum + user.earnings,
    0
  );
  const totalUsers = referredUsers.length;

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="p-4 py-8 dark:text-white">
      <div className="flex items-center gap-3 pt-4 mb-10">
        <Gift className="w-8 h-8 text-primary-dark-pink" />
        <h1 className="text-2xl font-bold">Referral Program</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-gradient-to-r from-primary-dark-pink to-pink-400 text-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Earnings</p>
              <h3 className="text-3xl font-bold">{totalEarnings}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Image
                  width={20}
                  height={20}
                  className="w-5 h-5"
                  src="/site/coin.svg"
                  alt="Points"
                />
                <span className="text-sm">Points</span>
              </div>
            </div>
            <TrendingUp className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Referred Users
              </p>
              <h3 className="text-3xl font-bold text-primary-dark-pink">
                {totalUsers}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Active members
              </p>
            </div>
            <Users className="w-10 h-10 text-primary-dark-pink opacity-80" />
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="w-6 h-6 text-primary-dark-pink" />
          <h2 className="text-lg font-semibold">Your Referral Code</h2>
        </div>

        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Your Code
              </p>
              <p className="text-2xl font-bold text-primary-dark-pink font-mono">
                {referralCode}
              </p>
            </div>
            <button
              onClick={copyReferralCode}
              className={`px-4 py-2 font-semibold transition-all duration-200 flex items-center gap-2 justify-center min-w-[100px] rounded-md ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-primary-dark-pink text-white hover:bg-pink-700"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Or share the full link:
          </p>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm rounded-md"
            />
            <button
              onClick={copyReferralLink}
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-2 justify-center min-w-[120px] rounded-md ${
                copiedLink
                  ? "bg-green-500 text-white"
                  : "bg-primary-dark-pink text-white hover:bg-pink-700"
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-primary-text-dark-pink/5 dark:bg-primary-dark-pink/10 border border-primary-text-dark-pink/20 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>How it works:</strong> Share your referral code{" "}
            <strong>{referralCode}</strong> or link with friends! When they sign
            up as a model using your code you'll earn referral points.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "users"
                ? "border-b-2 border-primary-dark-pink text-primary-dark-pink"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Users className="w-4 h-4" />
            Referred Users ({totalUsers})
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "earnings"
                ? "border-b-2 border-primary-dark-pink text-primary-dark-pink"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Earnings History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Your Referred Users</h3>
            {totalUsers > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {totalUsers} member{totalUsers !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {referredUsers.length > 0 ? (
            <div className="space-y-3">
              {referredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-dark-pink/30 transition-colors duration-200 rounded-lg shadow-sm hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image
                          src="/site/avatar.png"
                          width={48}
                          height={48}
                          alt={user.name}
                          className="w-12 h-12 object-cover border border-gray-200 dark:border-gray-600 rounded-full"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-model-online-notify border border-white dark:border-gray-800 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Joined:{" "}
                          {new Date(user.joinDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-semibold text-primary-dark-pink">
                          +{user.earnings}
                        </span>
                        <Image
                          width={16}
                          height={16}
                          className="w-4 h-4"
                          src="/site/coin.svg"
                          alt="Points"
                        />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Points earned
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No referred users yet
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Start sharing your referral code to see your referred users
                here!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "earnings" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Earnings Breakdown</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total: {totalEarnings} points
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="p-6 bg-gradient-to-r from-primary-dark-pink to-pink-400 text-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold mb-2 opacity-90">
                  Total Referral Earnings
                </h4>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold">{totalEarnings}</p>
                  <Image
                    width={32}
                    height={32}
                    className="w-8 h-8"
                    src="/site/coin.svg"
                    alt="Points"
                  />
                </div>
                <p className="text-sm opacity-80 mt-2">
                  From {totalUsers} referrals
                </p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </div>

          {/* Earnings History */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Recent Earnings
            </h4>
            {referredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/site/avatar.png"
                      width={32}
                      height={32}
                      alt={user.name}
                      className="w-8 h-8 object-cover rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Earned on{" "}
                        {new Date(user.joinDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary-dark-pink">
                      +{user.earnings}
                    </span>
                    <Image
                      width={16}
                      height={16}
                      className="w-4 h-4"
                      src="/site/coin.svg"
                      alt="Points"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralPage;
