"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getFriendlyErrorMessage, useAuth } from "../../lib/auth-context";
import { useSoil } from "../../lib/soil-context";
import { auth } from "../../lib/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { latestResult, history, settings, updateSettings } = useSoil();

  // Profile Mode
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("Andhra Pradesh");
  const [district, setDistrict] = useState("Guntur");
  const [village, setVillage] = useState("Amaravati");
  const [farmSize, setFarmSize] = useState("5");
  const [irrigationType, setIrrigationType] = useState("Rainfed");
  const [primaryCrop, setPrimaryCrop] = useState("Rice");
  const [season, setSeason] = useState("Kharif");
  const [language, setLanguage] = useState<"en" | "hi" | "kn">("en");

  // Password Change State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load initial data
  useEffect(() => {
    if (user?.displayName) {
      setFullName(user.displayName);
    } else if (user?.email) {
      const prefix = user.email.split("@")[0];
      setFullName(prefix || "Farmer");
    }

    try {
      const profileKey = `soil_health_pwa_farm_profile_v1_${user?.uid || "guest"}`;
      const stored = localStorage.getItem(profileKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.region) setRegion(parsed.region);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.village) setVillage(parsed.village);
        if (parsed.farmSize) setFarmSize(parsed.farmSize);
        if (parsed.irrigationType) setIrrigationType(parsed.irrigationType);
        if (parsed.primaryCrop) setPrimaryCrop(parsed.primaryCrop);
        if (parsed.season) setSeason(parsed.season);
      }
    } catch (e) {
      console.error("Failed to load farm profile:", e);
    }
  }, [user]);

  useEffect(() => {
    if (settings.language) {
      setLanguage(settings.language);
    }
  }, [settings.language]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      // 1. Update Firebase User displayName
      if (auth.currentUser && fullName.trim()) {
        await updateProfile(auth.currentUser, {
          displayName: fullName.trim(),
        });
      }

      // 2. Save farm details to localStorage
      const farmData = {
        region,
        district,
        village,
        farmSize,
        irrigationType,
        primaryCrop,
        season,
      };
      const profileKey = `soil_health_pwa_farm_profile_v1_${user?.uid || "guest"}`;
      localStorage.setItem(profileKey, JSON.stringify(farmData));

      // 3. Save Language preference to SoilContext settings
      updateSettings({ language });

      setProfileMsg({
        type: "success",
        text: "✅ Profile & farm details updated successfully!",
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error("Profile save error:", err);
      setProfileMsg({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "Password should be at least 6 characters long.",
      });
      return;
    }

    setChangingPassword(true);

    try {
      if (!auth.currentUser || !user?.email) {
        throw new Error("No authenticated user found.");
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      setPasswordMsg({
        type: "success",
        text: "✅ Password updated successfully!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowPasswordForm(false), 2500);
    } catch (err: any) {
      console.error("Password update error:", err);
      const friendlyMsg = err.code
        ? getFriendlyErrorMessage(err.code)
        : "Failed to change password. Please verify your current password.";
      setPasswordMsg({ type: "error", text: friendlyMsg });
    } finally {
      setChangingPassword(false);
    }
  };

  // Calculate Farm Summary statistics from actual soil context
  const totalAnalyses = history.length;
  const latestScore = latestResult?.soil_health_score
    ? `${latestResult.soil_health_score}/100`
    : history.length > 0 && history[0].result?.soil_health_score
    ? `${history[0].result.soil_health_score}/100`
    : null;

  const lastAnalysisDate = history.length > 0 ? history[0].date : null;
  const summaryPrimaryCrop =
    primaryCrop || (history.length > 0 ? history[0].cropType : null);

  const getInitials = () => {
    const name = fullName || user?.displayName || user?.email || "F";
    return name.charAt(0).toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full pb-8">
        {/* PAGE HEADER */}
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👤</span>
            <div>
              <h1 className="text-2xl font-bold text-green-900">
                Farmer Profile
              </h1>
              <p className="text-sm text-gray-600">
                Manage your account credentials and farm information
              </p>
            </div>
          </div>
        </div>

        {/* HERO FARMER CARD */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-800 font-extrabold border-2 border-green-300 shrink-0">
                {getInitials()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {fullName || user?.displayName || "Farmer"}
                </h2>
                <p className="text-xs font-medium text-gray-600 mt-0.5">
                  {user?.email || "No email registered"}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setProfileMsg(null);
                  setIsEditing(true);
                }}
                className="rounded-xl bg-green-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-green-800 transition active:scale-95"
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setProfileMsg(null);
                  }}
                  className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {profileMsg && (
            <div
              className={`rounded-xl p-3.5 text-xs font-bold ${
                profileMsg.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {profileMsg.text}
            </div>
          )}
        </div>

        {/* EDITABLE / READ-ONLY PROFILE FORM */}
        <form onSubmit={handleSaveProfile} className="space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* PERSONAL INFORMATION & FARM LOCATION */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <span>📍</span>
                <span>Personal & Location Info</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-green-800">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                      required
                    />
                  ) : (
                    <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 border border-gray-100">
                      {fullName || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-green-800">
                    Email Address
                  </label>
                  <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-600 border border-gray-100 select-all">
                    {user?.email || "No email"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-green-800">
                    Farming Region / State
                  </label>
                  {isEditing ? (
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                    >
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Other">Other Region</option>
                    </select>
                  ) : (
                    <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 border border-gray-100">
                      {region}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-green-800">
                      District
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                      />
                    ) : (
                      <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 border border-gray-100">
                        {district}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-green-800">
                      Village / Area
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                      />
                    ) : (
                      <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 border border-gray-100">
                        {village}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FARM DETAILS & PREFERENCES */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <span>🌾</span>
                <span>Farm Details & Preferences</span>
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-green-800">
                      Farm Size (acres)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={farmSize}
                        onChange={(e) => setFarmSize(e.target.value)}
                        placeholder="e.g. 5"
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                      />
                    ) : (
                      <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 border border-gray-100">
                        {farmSize} acres
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-green-800">
                      Irrigation Type
                    </label>
                    {isEditing ? (
                      <select
                        value={irrigationType}
                        onChange={(e) => setIrrigationType(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                      >
                        <option value="Rainfed">Rainfed</option>
                        <option value="Drip">Drip</option>
                        <option value="Sprinkler">Sprinkler</option>
                        <option value="Canal">Canal</option>
                      </select>
                    ) : (
                      <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 border border-gray-100">
                        {irrigationType}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-green-800">
                      Primary Crop
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={primaryCrop}
                        onChange={(e) => setPrimaryCrop(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                      />
                    ) : (
                      <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 border border-gray-100">
                        {primaryCrop}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-green-800">
                      Current Season
                    </label>
                    {isEditing ? (
                      <select
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                      >
                        <option value="Kharif">Kharif</option>
                        <option value="Rabi">Rabi</option>
                        <option value="Zaid">Zaid</option>
                      </select>
                    ) : (
                      <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 border border-gray-100">
                        {season}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-green-800">
                    Preferred Language
                  </label>
                  {isEditing ? (
                    <select
                      value={language}
                      onChange={(e) =>
                        setLanguage(e.target.value as "en" | "hi" | "kn")
                      }
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    </select>
                  ) : (
                    <p className="mt-1 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 border border-gray-100">
                      {language === "hi"
                        ? "हिन्दी (Hindi)"
                        : language === "kn"
                        ? "ಕನ್ನಡ (Kannada)"
                        : "English"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-green-700 px-6 py-3 text-xs font-bold text-white shadow hover:bg-green-800 transition disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setProfileMsg(null);
                }}
                className="rounded-xl border border-gray-300 bg-gray-50 px-5 py-3 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        {/* FARM SUMMARY SECTION */}
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-extrabold text-green-900 flex items-center gap-2">
              <span>📊</span>
              <span>Farm Summary</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-100 bg-green-50/40 p-4">
              <div className="flex items-center gap-2 text-green-800 text-xs font-bold">
                <span>📊</span>
                <span>Total Analyses</span>
              </div>
              <p className="mt-2 text-xl font-extrabold text-green-900">
                {totalAnalyses > 0 ? totalAnalyses : "No analyses yet"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-green-50/40 p-4">
              <div className="flex items-center gap-2 text-green-800 text-xs font-bold">
                <span>🌱</span>
                <span>Latest Soil Score</span>
              </div>
              <p className="mt-2 text-xl font-extrabold text-green-900">
                {latestScore || "No score available"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-green-50/40 p-4">
              <div className="flex items-center gap-2 text-green-800 text-xs font-bold">
                <span>📅</span>
                <span>Last Analysis</span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-green-900">
                {lastAnalysisDate || "No analysis recorded"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-green-50/40 p-4">
              <div className="flex items-center gap-2 text-green-800 text-xs font-bold">
                <span>🌾</span>
                <span>Primary Crop</span>
              </div>
              <p className="mt-2 text-xl font-extrabold text-green-900">
                {summaryPrimaryCrop || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* ACCOUNT SECURITY & SESSION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* CARD 1: PASSWORD MANAGEMENT */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span>🔑</span>
                  <span>Password Security</span>
                </h2>
                <span className="text-[11px] font-bold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                  Protected
                </span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                Update your account password securely using Firebase Authentication. Ensure your password is kept confidential.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setPasswordMsg(null);
                  setShowPasswordForm(!showPasswordForm);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 px-5 py-3 text-xs sm:text-sm font-bold text-green-800 hover:bg-green-100 transition active:scale-95 shadow-sm"
              >
                <span>🔑</span>
                <span>
                  {showPasswordForm ? "Hide Change Password" : "Change Password"}
                </span>
              </button>
            </div>
          </div>

          {/* CARD 2: ACCOUNT SESSION & SIGN OUT */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span>🚪</span>
                  <span>Account Session</span>
                </h2>
                <span className="text-[11px] font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                  Active Session
                </span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                Signed in as <strong className="text-gray-900">{user?.email || "Farmer"}</strong>. Sign out to end your session safely on this device.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={logout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-xs sm:text-sm font-bold text-red-700 hover:bg-red-100 transition active:scale-95 shadow-sm"
              >
                <span>🚪</span>
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* EXPANDABLE PASSWORD FORM */}
        {showPasswordForm && (
          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-2xl">
              <div className="border-b border-green-100 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-green-900 flex items-center gap-2">
                  <span>🔐</span>
                  <span>Update Account Password</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-green-800">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-green-800">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-green-800">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                    required
                  />
                </div>
              </div>

              {passwordMsg && (
                <div
                  className={`rounded-xl p-3 text-xs font-bold ${
                    passwordMsg.type === "success"
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-xl bg-green-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-green-800 transition disabled:opacity-50"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
