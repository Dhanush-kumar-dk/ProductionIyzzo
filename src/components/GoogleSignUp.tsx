import { useState, useEffect, useCallback } from "react";
import { auth } from "../firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import GoogleIcon from "../assets/google.png";
import { API_BASE_URL, DEFAULT_PARTNER_TAG } from "../config/api";
import { isEmailAdmin } from "../utils/admin";
import { metaEvents } from "../utils/tracking";

function SignIn({ onClose }: { onClose: () => void }) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = useCallback(async (user: User) => {
    // 1. Immediately cache user details
    const email = user.email || "";
    localStorage.setItem("email", email);

    metaEvents.completeRegistration(
      { content_name: "Google Sign-In", status: true },
      { email, name: user.displayName || "" }
    );

    if (isEmailAdmin(email)) {
      localStorage.setItem("isAdmin", "true");
    }

    // Set default tracking ID if not present
    if (!localStorage.getItem("trackingId")) {
      localStorage.setItem("trackingId", DEFAULT_PARTNER_TAG);
    }

    // 2. Synchronize with backend with timeout protection
    try {
      const token = await user.getIdToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.trackingId) {
          localStorage.setItem("trackingId", data.trackingId);
        }
        if (data.email) {
          localStorage.setItem("email", data.email);
        }
        if (data.isAdmin || isEmailAdmin(data.email)) {
          localStorage.setItem("isAdmin", "true");
        }
      }
    } catch (err) {
      console.warn("Backend server sync offline/delayed. Proceeding with client auth:", err);
    }

    // 3. Close modal smoothly
    onClose();
  }, [onClose]);

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result: any) => {
        if (result && result.user) {
          setIsSigningIn(true);
          await handleAuthSuccess(result.user);
        }
      })
      .catch((err: any) => {
        console.error("Error with redirect sign-in:", err);
      })
      .finally(() => {
        setIsSigningIn(false);
      });
  }, [handleAuthSuccess]);

  const handleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({
      prompt: "select_account",
    });

    setIsSigningIn(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result.user);
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      
      // User closed the popup intentionally
      if (
        authError?.code === "auth/popup-closed-by-user" ||
        authError?.code === "auth/cancelled-popup-request"
      ) {
        setIsSigningIn(false);
        return;
      }

      // Popup blocked by browser
      if (authError?.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.error("Error during redirect sign-in:", redirectErr);
        }
      }

      console.error("Google sign-in error:", err);
      setError(
        authError?.code === "auth/network-request-failed"
          ? "Network error. Please check your internet connection."
          : "Google Sign-In was interrupted. Please try again."
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {error && (
        <p className="text-red-500 text-xs sm:text-sm mb-2 text-center bg-red-50 border border-red-100 p-2 rounded-lg w-full">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={isSigningIn}
        onClick={handleClick}
        className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-gray-300 rounded-xl
        hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-150 text-xs sm:text-sm font-semibold text-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 active:scale-[0.99] ${
          isSigningIn ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <img src={GoogleIcon} alt="Google" className="w-5 h-5 object-contain" />
        <span>{isSigningIn ? "Connecting with Google..." : "Continue with Google"}</span>
      </button>
    </div>
  );
}

export default SignIn;
