import { useState } from "react";
import { UserPreferences } from "./types";
import {
  LanguageIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

interface PreferencesTabProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: UserPreferences) => Promise<boolean>;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export default function PreferencesTab({
  preferences,
  onUpdatePreferences,
  showToast,
}: PreferencesTabProps) {
  const [prefs, setPrefs] = useState<UserPreferences>(preferences);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = JSON.stringify(prefs) !== JSON.stringify(preferences);

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await onUpdatePreferences(prefs);
    setIsSaving(false);
    if (ok) {
      showToast("success", "Preferences saved successfully!");
    } else {
      showToast("error", "Failed to save preferences.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-poppins">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Preferences & Localization</h2>
        <p className="text-xs text-slate-500 mt-1">
          Customize your interface language, regional timezone, display currency, and appearance theme.
        </p>
      </div>

      {/* Theme Appearance */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Appearance Theme</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme */}
          <button
            type="button"
            onClick={() => setPrefs({ ...prefs, theme: "light" })}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition text-left text-xs font-bold ${
              prefs.theme === "light"
                ? "border-amber-400 bg-amber-50/20 text-slate-900 shadow-sm ring-2 ring-amber-400/20"
                : "border-slate-100 bg-slate-50 hover:bg-slate-100/70 text-slate-600"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <SunIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block font-bold">Light Mode</span>
              <span className="text-[11px] text-slate-400 font-normal">Clean bright interface</span>
            </div>
            {prefs.theme === "light" && <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-1" />}
          </button>

          {/* Dark Theme */}
          <button
            type="button"
            onClick={() => setPrefs({ ...prefs, theme: "dark" })}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition text-left text-xs font-bold ${
              prefs.theme === "dark"
                ? "border-amber-400 bg-slate-900 text-white shadow-sm ring-2 ring-amber-400/20"
                : "border-slate-100 bg-slate-50 hover:bg-slate-100/70 text-slate-600"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center">
              <MoonIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block font-bold">Dark Mode</span>
              <span className="text-[11px] text-slate-400 font-normal">Easy on the eyes at night</span>
            </div>
            {prefs.theme === "dark" && <CheckCircleIcon className="w-4 h-4 text-amber-400 mt-1" />}
          </button>

          {/* System Default */}
          <button
            type="button"
            onClick={() => setPrefs({ ...prefs, theme: "system" })}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition text-left text-xs font-bold ${
              prefs.theme === "system"
                ? "border-amber-400 bg-amber-50/20 text-slate-900 shadow-sm ring-2 ring-amber-400/20"
                : "border-slate-100 bg-slate-50 hover:bg-slate-100/70 text-slate-600"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ComputerDesktopIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block font-bold">System Default</span>
              <span className="text-[11px] text-slate-400 font-normal">Sync with OS appearance</span>
            </div>
            {prefs.theme === "system" && <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-1" />}
          </button>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Language &amp; Region</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <LanguageIcon className="w-4 h-4 text-amber-500" />
              Interface Language
            </label>
            <select
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-white"
            >
              <option value="en">English (India &amp; Global)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="es">Español (Spanish)</option>
              <option value="de">Deutsch (German)</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-amber-500" />
              Timezone
            </label>
            <select
              value={prefs.timezone}
              onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-white"
            >
              <option value="Asia/Kolkata">(GMT+05:30) India Standard Time (IST)</option>
              <option value="Asia/Dubai">(GMT+04:00) Gulf Standard Time</option>
              <option value="Europe/London">(GMT+00:00) London, UK</option>
              <option value="America/New_York">(GMT-05:00) Eastern Time (US &amp; Canada)</option>
              <option value="America/Los_Angeles">(GMT-08:00) Pacific Time (US &amp; Canada)</option>
              <option value="Asia/Singapore">(GMT+08:00) Singapore, Perth</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <CurrencyRupeeIcon className="w-4 h-4 text-amber-500" />
              Primary Display Currency
            </label>
            <select
              value={prefs.currency || "INR"}
              onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition bg-white"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
              <option value="AED">AED (UAE Dirham)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
        <span className="text-xs text-slate-400">
          {isDirty ? "Unsaved preference changes" : "Preferences are up to date"}
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
