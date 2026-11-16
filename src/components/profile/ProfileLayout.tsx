import React from "react";
import { ProfileTabId } from "./types";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  BellAlertIcon,
  BanknotesIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

interface ProfileLayoutProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  showBilling?: boolean;
  children: React.ReactNode;
}

export default function ProfileLayout({
  activeTab,
  onTabChange,
  showBilling = true,
  children,
}: ProfileLayoutProps) {
  const tabs = [
    {
      id: "profile" as ProfileTabId,
      label: "Public Profile",
      icon: UserCircleIcon,
      desc: "Avatar, username & social links",
    },
    {
      id: "security" as ProfileTabId,
      label: "Account & Security",
      icon: ShieldCheckIcon,
      desc: "Password, 2FA & sessions",
    },
    {
      id: "preferences" as ProfileTabId,
      label: "Preferences",
      icon: AdjustmentsHorizontalIcon,
      desc: "Theme, timezone & language",
    },
    {
      id: "notifications" as ProfileTabId,
      label: "Notifications",
      icon: BellAlertIcon,
      desc: "Price drops & email digests",
    },
    ...(showBilling
      ? [
          {
            id: "billing" as ProfileTabId,
            label: "Billing & Wallet",
            icon: BanknotesIcon,
            desc: "Cashback balance & UPI payouts",
          },
        ]
      : []),
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-poppins">
      {/* Mobile Top Tabs (Horizontal Scrollbar on Small Devices) */}
      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-xs ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Layout Grid (Left Sidebar + Right Content Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Sidebar */}
        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-3 space-y-1">
            <div className="px-3 py-2.5 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                User Settings
              </span>
            </div>

            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left group ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 transition ${
                        isActive
                          ? "bg-white/10 text-amber-400"
                          : "bg-slate-100 text-slate-500 group-hover:text-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 leading-tight">
                      <span className="text-xs font-bold block truncate">{tab.label}</span>
                      <span
                        className={`text-[10px] block truncate mt-0.5 ${
                          isActive ? "text-slate-300" : "text-slate-400"
                        }`}
                      >
                        {tab.desc}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      isActive ? "text-amber-400 translate-x-0.5" : "text-slate-300 group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/60 shadow-xs">
            <h5 className="text-xs font-bold text-amber-950">Need Account Help?</h5>
            <p className="text-[11px] text-amber-900/80 mt-1 leading-relaxed">
              Contact Yearnit support or explore verified cashback guidelines in our buyer disclosure policy.
            </p>
            <a
              href="/contact"
              className="inline-block mt-2 text-xs font-bold text-amber-800 hover:text-amber-950 underline"
            >
              Get in Touch &rarr;
            </a>
          </div>
        </aside>

        {/* Right Dynamic Tab Content */}
        <main className="lg:col-span-8 xl:col-span-9 min-w-0">{children}</main>
      </div>
    </div>
  );
}
