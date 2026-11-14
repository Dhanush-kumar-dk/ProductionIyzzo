import { useState } from "react";
import { UserNotifications } from "./types";
import {
  BellAlertIcon,
  TagIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  SparklesIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/solid";

interface NotificationsTabProps {
  notifications: UserNotifications;
  onUpdateNotifications: (updated: UserNotifications) => Promise<boolean>;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export default function NotificationsTab({
  notifications,
  onUpdateNotifications,
  showToast,
}: NotificationsTabProps) {
  const [notifs, setNotifs] = useState<UserNotifications>(notifications);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = JSON.stringify(notifs) !== JSON.stringify(notifications);

  const toggle = (key: keyof UserNotifications) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await onUpdateNotifications(notifs);
    setIsSaving(false);
    if (ok) {
      showToast("success", "Notification preferences saved!");
    } else {
      showToast("error", "Failed to update notifications.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-poppins">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Notification Channels</h2>
        <p className="text-xs text-slate-500 mt-1">
          Choose which notifications you receive via email and in-app banners. Never miss an all-time low price.
        </p>
      </div>

      {/* Email Notifications Group */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <BellAlertIcon className="w-4 h-4 text-amber-500" />
          Email Notifications
        </h3>

        <div className="divide-y divide-slate-100">
          {/* Price Drops */}
          <div className="py-4 flex items-center justify-between first:pt-0">
            <div className="flex items-start gap-3 pr-4">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 mt-0.5">
                <TagIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Wishlist Price Drop Alerts</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Instant alert when any item in your saved wishlist drops below your target price or hits an all-time low.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifs.email_price_alerts}
                onChange={() => toggle("email_price_alerts")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          {/* Weekly Deals Digest */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-start gap-3 pr-4">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 mt-0.5">
                <NewspaperIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Weekly Curated Deals Digest</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  A curated Saturday morning digest of top-rated tech reviews, buyer guide updates, and verified discounts.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifs.email_weekly_digest}
                onChange={() => toggle("email_weekly_digest")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          {/* Account & Security Alerts */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-start gap-3 pr-4">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 mt-0.5">
                <ShieldCheckIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Account &amp; Security Alerts</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Crucial notices regarding password modifications, unusual login locations, and data privacy requests.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifs.email_security}
                onChange={() => toggle("email_security")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>
        </div>
      </div>

      {/* In-App Notifications Group */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <DevicePhoneMobileIcon className="w-4 h-4 text-purple-500" />
          In-App &amp; Push Notifications
        </h3>

        <div className="divide-y divide-slate-100">
          {/* Flash Sale Toasts */}
          <div className="py-4 flex items-center justify-between first:pt-0">
            <div className="flex items-start gap-3 pr-4">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 mt-0.5">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Flash Deals &amp; Lightning Drops</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Real-time toasts on the site when flash vouchers or limited-quantity Amazon discounts go live.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifs.in_app_deals}
                onChange={() => toggle("in_app_deals")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
            </label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
        <span className="text-xs text-slate-400">
          {isDirty ? "Unsaved notification changes" : "Notification settings up to date"}
        </span>
        <button
          type="button"
          disabled={!isDirty || isSaving}
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-md ${
            !isDirty || isSaving
              ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 text-slate-950 shadow-amber-500/20 active:scale-95"
          }`}
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
