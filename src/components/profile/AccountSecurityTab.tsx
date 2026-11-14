import React, { useState } from "react";
import { UserProfile, ActiveSession } from "./types";
import {
  ShieldCheckIcon,
  KeyIcon,
  EnvelopeIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ArrowRightOnRectangleIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import { FaGoogle, FaLinkedin } from "react-icons/fa6";

interface AccountSecurityTabProps {
  profile: UserProfile;
  onUpdateSecurity: (updates: Partial<UserProfile>) => Promise<boolean>;
  showToast: (type: "success" | "error" | "info", message: string) => void;
  onDeleteAccount: () => Promise<void>;
}

export default function AccountSecurityTab({
  profile,
  onUpdateSecurity,
  showToast,
  onDeleteAccount,
}: AccountSecurityTabProps) {
  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Email Change Modal State
  const [changeEmailModalOpen, setChangeEmailModalOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");

  // Delete Account Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // 2FA state
  const [twoFactor, setTwoFactor] = useState(profile.two_factor_enabled);

  // Active Sessions Mock Data
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: "sess_1",
      device: "Windows PC",
      browser: "Chrome 142.0",
      ip: "103.246.40.11",
      location: "Bengaluru, India",
      isCurrent: true,
      lastActive: "Active right now",
    },
    {
      id: "sess_2",
      device: "Apple iPhone 15",
      browser: "Mobile Safari 18.1",
      ip: "49.37.112.94",
      location: "Chennai, India",
      isCurrent: false,
      lastActive: "2 hours ago",
    },
  ]);

  // Connected Accounts State
  const [connectedGoogle, setConnectedGoogle] = useState(true);
  const [connectedLinkedIn, setConnectedLinkedIn] = useState(false);

  // Password Strength Meter Calculation
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-rose-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Good", color: "bg-blue-500" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-emerald-500" };
      default:
        return { score: 0, label: "None", color: "bg-slate-200" };
    }
  };

  const strength = calculateStrength(newPassword);

  // Password Submit
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast("error", "Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      showToast("error", "New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "New password and confirmation do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));
    setIsUpdatingPassword(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("success", "Password updated successfully across all sessions.");
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    const nextVal = !twoFactor;
    setTwoFactor(nextVal);
    await onUpdateSecurity({ two_factor_enabled: nextVal });
    showToast(
      "success",
      nextVal ? "Two-factor authentication enabled." : "Two-factor authentication disabled."
    );
  };

  // Log out of other devices
  const handleLogoutOtherDevices = async () => {
    try {
      await fetch("/api/account?action=revoke_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email }),
      });
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      showToast("success", "Successfully logged out of all other devices and sessions.");
    } catch (err) {
      showToast("error", "Failed to revoke active sessions.");
    }
  };

  // Export Data
  const handleExportData = async () => {
    showToast("info", "Compiling your profile archive...");
    try {
      const res = await fetch("/api/account?action=export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, id: profile.id }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `yearnit-data-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("success", "Data export downloaded successfully.");
      }
    } catch (e) {
      showToast("error", "Failed to export data.");
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (confirmDeleteText !== "DELETE") {
      showToast("error", 'Please type "DELETE" to confirm account termination.');
      return;
    }
    setIsDeleting(true);
    await onDeleteAccount();
    setIsDeleting(false);
  };

  return (
    <div className="space-y-8 animate-fade-in font-poppins">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Account & Security</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your login credentials, two-factor authentication, active sessions, and data privacy rights.
        </p>
      </div>

      {/* 1. Email Address & Verification */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <EnvelopeIcon className="w-4 h-4 text-amber-500" />
          Email Address
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{profile.email}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                <CheckBadgeIcon className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Your primary address used for login authentication, security notifications, and order verification.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setChangeEmailModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-xs self-start sm:self-auto"
          >
            Change Email
          </button>
        </div>
      </div>

      {/* 2. Change Password */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <KeyIcon className="w-4 h-4 text-amber-500" />
          Change Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPass ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full text-xs font-medium px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full text-xs font-medium px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showNewPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Strength:</span>
                  <span className="font-bold text-slate-800">{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword || !currentPassword || !newPassword}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
          >
            {isUpdatingPassword ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* 3. Two-Factor Authentication (2FA) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
          Two-Factor Authentication (2FA)
        </h3>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="space-y-1 pr-4">
            <span className="text-xs font-bold text-slate-900 block">
              Authenticator App &amp; SMS Security
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Require an additional security verification code when signing in from an unrecognized device or browser.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={handleToggle2FA}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>
      </div>

      {/* 4. Connected Accounts */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Connected Accounts</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <FaGoogle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Google Account</p>
                <p className="text-[11px] text-slate-400">One-click single sign-on enabled</p>
              </div>
            </div>
            {connectedGoogle ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckBadgeIcon className="w-4 h-4" /> Connected
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConnectedGoogle(true);
                  showToast("success", "Google account connected.");
                }}
                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Connect
              </button>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <FaLinkedin className="w-4 h-4 text-[#0077B5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">LinkedIn Account</p>
                <p className="text-[11px] text-slate-400">Social badge and verification</p>
              </div>
            </div>
            {connectedLinkedIn ? (
              <button
                type="button"
                onClick={() => {
                  setConnectedLinkedIn(false);
                  showToast("info", "LinkedIn account disconnected.");
                }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConnectedLinkedIn(true);
                  showToast("success", "LinkedIn account connected.");
                }}
                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Active Sessions */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Active Sessions</h3>
          {sessions.length > 1 && (
            <button
              type="button"
              onClick={handleLogoutOtherDevices}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
            >
              Log out of all other devices
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {sessions.map((sess) => (
            <div key={sess.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                  {sess.device.includes("iPhone") ? (
                    <DevicePhoneMobileIcon className="w-5 h-5" />
                  ) : (
                    <ComputerDesktopIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{sess.device}</span>
                    <span className="text-[11px] text-slate-400 font-normal">• {sess.browser}</span>
                    {sess.isCurrent && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-800">
                        This Device
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sess.location} • IP: {sess.ip} • <span className="text-slate-600">{sess.lastActive}</span>
                  </p>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  type="button"
                  onClick={() => {
                    setSessions((prev) => prev.filter((s) => s.id !== sess.id));
                    showToast("info", `Session on ${sess.device} revoked.`);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Revoke session"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Danger Zone */}
      <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-rose-900 border-b border-rose-100 pb-3 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-rose-600" />
          Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-rose-100">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Export My Data Archive</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Download a machine-readable JSON archive of all your saved products, profile data, reviews, and activity.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition shadow-xs self-start sm:self-auto flex-shrink-0"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-rose-200">
          <div>
            <h4 className="text-xs font-bold text-rose-700">Delete Account &amp; Personal Data</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Permanently purge your account, saved deals, and metadata. This action is irreversible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmDeleteText("");
              setDeleteModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm self-start sm:self-auto flex-shrink-0 active:scale-95"
          >
            <TrashIcon className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-poppins">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-rose-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Are you absolutely sure?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              All saved wishlists, affiliate cashback tracking records, and profile details will be permanently wiped from the database.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Type <span className="text-rose-600 font-mono">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmDeleteText !== "DELETE" || isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition shadow-md shadow-rose-600/20"
              >
                {isDeleting ? "Erasing Data..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {changeEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-poppins">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Change Account Email</h3>
            <p className="text-xs text-slate-500">
              We will send a verification link to your new address to confirm ownership before updating.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Email Address</label>
              <input
                type="email"
                required
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="newname@domain.com"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setChangeEmailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newEmailInput.includes("@")) {
                    showToast("error", "Enter a valid email address.");
                    return;
                  }
                  await onUpdateSecurity({ email: newEmailInput });
                  setChangeEmailModalOpen(false);
                  showToast("success", "Verification email sent to " + newEmailInput);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl transition shadow-xs"
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
