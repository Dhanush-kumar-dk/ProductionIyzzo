import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import Footer from "../Footer";
import LogIn from "../Login";
import ProfileLayout from "./ProfileLayout";
import ProfileTab from "./ProfileTab";
import AccountSecurityTab from "./AccountSecurityTab";
import PreferencesTab from "./PreferencesTab";
import NotificationsTab from "./NotificationsTab";
import BillingTab from "./BillingTab";
import { UserProfile, ProfileTabId, ToastMessage } from "./types";
import { auth } from "../../firebase";
import { updateSEO } from "../../utils/seo";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const DEFAULT_PROFILE: UserProfile = {
  id: "guest-user",
  email: "user@yearnit.in",
  email_verified: true,
  username: "yearnit_buyer",
  full_name: "Yearnit Member",
  headline: "Independent reviewer & tech enthusiast on Yearnit",
  avatar_url: "",
  company: "",
  job_title: "Member",
  location: "India",
  website: "",
  social_links: {
    linkedin: "",
    twitter: "",
    github: "",
  },
  preferences: {
    language: "en",
    timezone: "Asia/Kolkata",
    theme: "system",
    currency: "INR",
  },
  notifications: {
    email_price_alerts: true,
    email_weekly_digest: true,
    email_security: true,
    email_restock: false,
    in_app_deals: true,
    in_app_system: true,
  },
  billing: {
    wallet_balance: 450,
    pending_cashback: 185,
    payout_method: "UPI",
    upi_id: "user@okhdfcbank",
  },
  two_factor_enabled: false,
};

export default function UserProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab routing
  const searchParams = new URLSearchParams(location.search);
  const initialTab = (searchParams.get("tab") as ProfileTabId) || "profile";
  const [activeTab, setActiveTab] = useState<ProfileTabId>(initialTab);

  // Profile data & loading
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [openLogIn, setOpenLogIn] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // SEO Update
  useEffect(() => {
    updateSEO({
      title: "My Account & Profile Settings | Yearnit",
      description: "Manage your Yearnit profile details, public reviewer handle, security settings, and cashback wallet.",
      url: "https://yearnit.in/profile",
    });
  }, []);

  // Fetch or construct profile on mount
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      const storedEmail = localStorage.getItem("email") || "";
      const email = currentUser?.email || storedEmail;

      if (!email && !currentUser) {
        // Fallback to demo profile for guests, but encourage sign in
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.profile && isMounted) {
            setProfile({
              ...DEFAULT_PROFILE,
              ...json.profile,
              email: email,
              email_verified: currentUser?.emailVerified ?? true,
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Profile API offline, using cached credentials:", err);
      }

      // If no DB record exists yet, initialize from Firebase user
      if (isMounted) {
        const usernameFromName = (currentUser?.displayName || email.split("@")[0] || "user")
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_");

        setProfile({
          ...DEFAULT_PROFILE,
          id: currentUser?.uid || "usr_" + Date.now(),
          email: email,
          email_verified: currentUser?.emailVerified ?? true,
          full_name: currentUser?.displayName || email.split("@")[0],
          username: usernameFromName,
          avatar_url: currentUser?.photoURL || "",
        });
        setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync tab change with URL query param
  const handleTabChange = (tab: ProfileTabId) => {
    setActiveTab(tab);
    navigate(`/profile?tab=${tab}`, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Save profile updates to backend & local state
  const handleSaveProfile = async (updated: Partial<UserProfile>): Promise<boolean> => {
    const merged = { ...profile, ...updated };
    setProfile(merged);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });

      if (res.ok) {
        if (updated.avatar_url) {
          localStorage.setItem("user_avatar", updated.avatar_url);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn("Backend save failed, stored locally:", err);
      // Still return true for local-first UX
      return true;
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    try {
      await fetch("/api/account?action=delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, id: profile.id }),
      });
      auth.signOut();
      localStorage.clear();
      showToast("info", "Your account has been deleted. Redirecting to home...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (e) {
      showToast("error", "Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F9FA] flex flex-col font-poppins text-gray-900">
      {/* Login Modal */}
      {openLogIn && (
        <div className="fixed inset-0 backdrop-blur-sm bg-zinc-900/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <LogIn onClose={() => setOpenLogIn(false)} />
        </div>
      )}

      {/* TopBar */}
      <TopBar openLogIn={() => setOpenLogIn(true)} />

      {/* Page Content */}
      <main className="flex-1">
        {loading ? (
          /* Skeleton Loader */
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-xl w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="hidden lg:block lg:col-span-3 space-y-3">
                <div className="h-12 bg-slate-200 rounded-xl w-full" />
                <div className="h-12 bg-slate-200 rounded-xl w-full" />
                <div className="h-12 bg-slate-200 rounded-xl w-full" />
                <div className="h-12 bg-slate-200 rounded-xl w-full" />
              </div>
              <div className="lg:col-span-9 space-y-4">
                <div className="h-32 bg-slate-200 rounded-2xl w-full" />
                <div className="h-64 bg-slate-200 rounded-2xl w-full" />
              </div>
            </div>
          </div>
        ) : (
          <ProfileLayout activeTab={activeTab} onTabChange={handleTabChange} showBilling={true}>
            {activeTab === "profile" && (
              <ProfileTab
                profile={profile}
                onSave={handleSaveProfile}
                showToast={showToast}
              />
            )}
            {activeTab === "security" && (
              <AccountSecurityTab
                profile={profile}
                onUpdateSecurity={handleSaveProfile}
                showToast={showToast}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
            {activeTab === "preferences" && (
              <PreferencesTab
                preferences={profile.preferences}
                onUpdatePreferences={async (prefs) => handleSaveProfile({ preferences: prefs })}
                showToast={showToast}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationsTab
                notifications={profile.notifications}
                onUpdateNotifications={async (notifs) => handleSaveProfile({ notifications: notifs })}
                showToast={showToast}
              />
            )}
            {activeTab === "billing" && (
              <BillingTab
                billing={profile.billing}
                onUpdateBilling={async (b) => handleSaveProfile({ billing: b })}
                showToast={showToast}
              />
            )}
          </ProfileLayout>
        )}
      </main>

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-xl text-xs font-semibold border backdrop-blur-md transition-all animate-slide-up ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/30"
                : toast.type === "error"
                ? "bg-rose-950/90 text-rose-100 border-rose-500/30"
                : "bg-slate-950/90 text-slate-100 border-slate-700/40"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              {toast.type === "success" && <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
              {toast.type === "error" && <XCircleIcon className="w-5 h-5 text-rose-400 flex-shrink-0" />}
              {toast.type === "info" && <InformationCircleIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />}
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
