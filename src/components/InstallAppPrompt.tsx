import { FC, useState, useEffect } from "react";
import { ArrowDownTrayIcon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/solid";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const STORAGE_KEY = "yearnit_pwa_dismissed_until";

export const InstallAppPrompt: FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone window
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed recently
    const dismissedUntil = localStorage.getItem(STORAGE_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios|edgios/.test(ua);
    setIsIOS(isIOSDevice && isSafari);

    // 4. Capture Chromium beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS users, show a gentle prompt after 4 seconds if not dismissed
    let timer: NodeJS.Timeout | null = null;
    if (isIOSDevice && isSafari) {
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSHint(true);
    }
  };

  const handleDismiss = () => {
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, nextWeek.toString());
    setShowPrompt(false);
    setShowIOSHint(false);
  };

  if (!showPrompt) return null;

  return (
    <aside
      aria-label="Install Yearnit Mobile App"
      className="fixed bottom-3 inset-x-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.16)] border border-slate-200/90 p-4 font-poppins animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B20] to-[#F15000] p-0.5 shadow-md shadow-orange-500/25 flex items-center justify-center flex-shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="Yearnit App Icon"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider mb-0.5">
              <SparklesIcon className="w-3 h-3 text-amber-500" />
              <span>Official Mobile App</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Install Yearnit on your device
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant launch • Offline ready • 0 MB storage
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer flex-shrink-0"
          aria-label="Dismiss app install banner"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {showIOSHint ? (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
            <span>Install on iOS Safari:</span>
          </p>
          <p>
            1. Tap the <strong>Share</strong> button <span className="font-bold">⎋</span> at the bottom of Safari.
          </p>
          <p>
            2. Scroll down and tap <strong>Add to Home Screen ⊞</strong>.
          </p>
          <button
            onClick={handleDismiss}
            className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700 underline block"
          >
            Got it, thanks!
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#FF6B20] to-[#F15000] hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-xs py-2 px-3 rounded-xl shadow-xs active:scale-98 transition cursor-pointer"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
          <button
            onClick={handleDismiss}
            type="button"
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            Not now
          </button>
        </div>
      )}
    </aside>
  );
};

export default InstallAppPrompt;
