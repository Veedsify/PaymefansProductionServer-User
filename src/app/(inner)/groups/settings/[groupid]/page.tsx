"use client";

import React, { useState, useEffect } from "react";
import {
  LucideChevronLeft,
  LucideSettings,
  LucideUsers,
  LucideShield,
  LucideTrash2,
  LucideUpload,
  LucideImage,
  LucideSave,
  LucideUserPlus,
  LucideGlobe,
  LucideLock,
  LucideEyeOff,
  LucideAlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Group,
  GroupType,
  UpdateGroupRequest,
  UpdateGroupSettingsRequest,
  ApiResponse,
} from "@/types/GroupTypes";
import axios from "axios";
import { getToken } from "@/utils/Cookie";

const token = getToken();

const GroupSettingsPage = () => {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupid as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupType: GroupType.PUBLIC,
    maxMembers: 100,
    groupIcon: null as File | null,
  });

  const [settingsData, setSettingsData] = useState({
    allowMemberInvites: true,
    allowMediaSharing: true,
    allowFileSharing: true,
    moderateMessages: false,
    autoApproveJoinReqs: true,
  });

  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const groupTypes = [
    {
      value: GroupType.PUBLIC,
      label: "Public",
      description: "Anyone can join and see the group",
      icon: LucideGlobe,
      color: "text-green-500",
    },
    {
      value: GroupType.PRIVATE,
      label: "Private",
      description: "Only members can see the group, requests required to join",
      icon: LucideLock,
      color: "text-yellow-500",
    },
    {
      value: GroupType.SECRET,
      label: "Secret",
      description: "Invitation only, completely hidden from search",
      icon: LucideEyeOff,
      color: "text-red-500",
    },
  ];

  const tabs = [
    { id: "general", label: "General", icon: LucideSettings },
    { id: "privacy", label: "Privacy", icon: LucideShield },
    { id: "members", label: "Members", icon: LucideUsers },
    { id: "danger", label: "Danger Zone", icon: LucideAlertTriangle },
  ];

  // Fetch group data
  const fetchGroup = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/groups/${groupId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result: ApiResponse<Group> = response.data;

      if (result.success && result.data) {
        const groupData = result.data;
        setGroup(groupData);

        // Update form data
        setFormData({
          name: groupData.name,
          description: groupData.description || "",
          groupType: groupData.groupType,
          maxMembers: groupData.maxMembers,
          groupIcon: null,
        });

        // Update settings data
        if (groupData.settings) {
          setSettingsData({
            allowMemberInvites: groupData.settings.allowMemberInvites,
            allowMediaSharing: groupData.settings.allowMediaSharing,
            allowFileSharing: groupData.settings.allowFileSharing,
            moderateMessages: groupData.settings.moderateMessages,
            autoApproveJoinReqs: groupData.settings.autoApproveJoinReqs,
          });
        }

        if (groupData.groupIcon) {
          setIconPreview(groupData.groupIcon);
        }
      } else {
        throw new Error(result.message || "Failed to fetch group");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching group:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setSettingsData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleGroupTypeChange = (groupType: GroupType) => {
    setFormData((prev) => ({
      ...prev,
      groupType,
    }));

    // Auto-adjust settings based on group type
    if (groupType === GroupType.PUBLIC) {
      setSettingsData((prev) => ({
        ...prev,
        autoApproveJoinReqs: true,
      }));
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        groupIcon: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save general settings
  const saveGeneralSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData: UpdateGroupRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        groupType: formData.groupType,
        maxMembers: formData.maxMembers,
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/groups/${groupId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result: ApiResponse<Group> = response.data;

      if (result.success && result.data) {
        setGroup(result.data);
        // Show success message (you can implement a toast notification)
        console.log("Group updated successfully");
      } else {
        throw new Error(result.message || "Failed to update group");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Save privacy settings
  const savePrivacySettings = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/groups/${groupId}/settings`,
        settingsData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result: ApiResponse = response.data;

      if (result.success) {
        // Show success message
        console.log("Settings updated successfully");
      } else {
        throw new Error(result.message || "Failed to update settings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Delete group
  const deleteGroup = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/groups/${groupId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result: ApiResponse = response.data;

      if (result.success) {
        router.push("/groups");
      } else {
        throw new Error(result.message || "Failed to delete group");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark-pink"></div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Group
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchGroup}
            className="bg-primary-dark-pink text-white px-4 py-2 rounded-md hover:bg-primary-text-dark-pink transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center border-b dark:border-gray-800 py-3 px-5 mb-6">
        <div className="mr-4 sm:mr-6 dark:text-white">
          <Link href={`/groups/${groupId}`}>
            <LucideChevronLeft
              size={30}
              className="cursor-pointer hover:text-primary-dark-pink transition-colors"
            />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <Image
              className="rounded-full aspect-square object-cover"
              width={50}
              height={50}
              priority
              src={
                group?.groupIcon ||
                "https://images.pexels.com/photos/30612850/pexels-photo-30612850/free-photo-of-outdoor-portrait-of-a-man-relaxing-on-swing-in-abuja.jpeg?auto=compress&cs=tinysrgb&w=600"
              }
              alt={group?.name || "Group"}
            />
          </div>
          <div className="dark:text-white">
            <div className="font-bold text-sm md:text-base">
              <span>{group?.name} Settings</span>
            </div>
            <div className="flex gap-1 items-center text-xs md:text-xs text-gray-500">
              <LucideUsers className="h-3 w-3" />
              <span>{group?._count.members} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary-dark-pink text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                General Settings
              </h2>

              <div className="space-y-6">
                {/* Group Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Icon
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {iconPreview ? (
                          <img
                            src={iconPreview}
                            alt="Group icon"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <LucideImage className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md text-sm transition-colors"
                        onClick={() =>
                          document.querySelector('input[type="file"]')?.click()
                        }
                      >
                        <LucideUpload className="h-4 w-4" />
                        Change Icon
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        Max 5MB, PNG/JPG
                      </p>
                    </div>
                  </div>
                </div>

                {/* Group Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Group Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-pink focus:border-primary-dark-pink dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-pink focus:border-primary-dark-pink dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Max Members */}
                <div>
                  <label
                    htmlFor="maxMembers"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Maximum Members
                  </label>
                  <input
                    type="number"
                    id="maxMembers"
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                    min="5"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark-pink focus:border-primary-dark-pink dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={saveGeneralSettings}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LucideSave className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Privacy & Permissions
              </h2>

              <div className="space-y-6">
                {/* Group Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Group Type
                  </label>
                  <div className="space-y-3">
                    {groupTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <div
                          key={type.value}
                          className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                            formData.groupType === type.value
                              ? "border-primary-dark-pink bg-primary-dark-pink/5"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                          onClick={() => handleGroupTypeChange(type.value)}
                        >
                          <div className="flex items-start gap-3">
                            <IconComponent
                              className={`h-5 w-5 mt-0.5 ${type.color}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {type.label}
                                </h4>
                                <input
                                  type="radio"
                                  name="groupType"
                                  value={type.value}
                                  checked={formData.groupType === type.value}
                                  onChange={() =>
                                    handleGroupTypeChange(type.value)
                                  }
                                  className="text-primary-dark-pink focus:ring-primary-dark-pink"
                                />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Permission Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Member Permissions
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="allowMemberInvites"
                        checked={settingsData.allowMemberInvites}
                        onChange={handleInputChange}
                        className="mt-1 rounded border-gray-300 text-primary-dark-pink focus:ring-primary-dark-pink"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Allow member invites
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Members can invite others to join the group
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="allowMediaSharing"
                        checked={settingsData.allowMediaSharing}
                        onChange={handleInputChange}
                        className="mt-1 rounded border-gray-300 text-primary-dark-pink focus:ring-primary-dark-pink"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Allow media sharing
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Members can share images and videos in messages
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="allowFileSharing"
                        checked={settingsData.allowFileSharing}
                        onChange={handleInputChange}
                        className="mt-1 rounded border-gray-300 text-primary-dark-pink focus:ring-primary-dark-pink"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Allow file sharing
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Members can share documents and other files
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="moderateMessages"
                        checked={settingsData.moderateMessages}
                        onChange={handleInputChange}
                        className="mt-1 rounded border-gray-300 text-primary-dark-pink focus:ring-primary-dark-pink"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Moderate messages
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          All messages require approval before being posted
                        </p>
                      </div>
                    </label>

                    {formData.groupType !== GroupType.PUBLIC && (
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="autoApproveJoinReqs"
                          checked={settingsData.autoApproveJoinReqs}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-primary-dark-pink focus:ring-primary-dark-pink"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Auto-approve join requests
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Automatically approve requests to join the group
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={savePrivacySettings}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LucideSave className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Member Management
                </h2>
                <Link
                  href={`/groups/${groupId}/invite`}
                  className="flex items-center gap-2 bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  <LucideUserPlus className="h-4 w-4" />
                  Invite Members
                </Link>
              </div>

              <div className="text-center py-8">
                <LucideUsers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Member Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  View and manage group members, roles, and permissions.
                </p>
                <Link
                  href={`/groups/${groupId}/members`}
                  className="inline-flex items-center gap-2 bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white px-4 py-2 rounded-md transition-colors"
                >
                  <LucideUsers className="h-4 w-4" />
                  Manage Members
                </Link>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-6">
                Danger Zone
              </h2>

              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                    Delete Group
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Once you delete this group, there is no going back. Please
                    be certain. All messages, files, and member data will be
                    permanently removed.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    <LucideTrash2 className="h-4 w-4" />
                    Delete Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <LucideAlertTriangle className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Group
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{group?.name}"? This action
                cannot be undone. All messages, files, and member data will be
                permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteGroup}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Deleting..." : "Delete Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSettingsPage;
