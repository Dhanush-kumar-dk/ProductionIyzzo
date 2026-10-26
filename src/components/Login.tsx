import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { auth } from "../firebase";
import SignIn from "./GoogleSignUp";
import { API_BASE_URL, DEFAULT_PARTNER_TAG } from "../config/api";
import { isEmailAdmin } from "../utils/admin";

export default function LogIn({ onClose }: { onClose: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePostAuth = async (user: User) => {
    const userEmail = user.email || "";
    localStorage.setItem("email", userEmail);

    if (isEmailAdmin(userEmail)) {
      localStorage.setItem("isAdmin", "true");
    }

    if (!localStorage.getItem("trackingId")) {
      localStorage.setItem("trackingId", DEFAULT_PARTNER_TAG);
    }

    // Try synchronizing with backend (with timeout protection)
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
        if (data.trackingId) localStorage.setItem("trackingId", data.trackingId);
        if (data.email) localStorage.setItem("email", data.email);
        if (data.isAdmin || isEmailAdmin(data.email)) {
          localStorage.setItem("isAdmin", "true");
        }
      }
    } catch (err) {
      console.warn("Backend server sync offline or delayed:", err);
    }

    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please fill in both email and password.");
      setIsLoggingIn(false);
      return;
    }

    try {
      let user: User | null = null;

      if (isSignUp) {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
        user = userCredential.user;
        setSuccessMsg("Account created successfully!");
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
        user = userCredential.user;
      }

      if (user) {
        await handlePostAuth(user);
      }
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      console.error("Auth error:", authErr);

      switch (authErr?.code) {
        case "auth/user-not-found":
          setError("No account found with this email. Switch to 'Create Account' below.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Incorrect password or email. If you are a new user, click 'Create Account'.");
          break;
        case "auth/email-already-in-use":
          setError("This email already has an account. Please switch to 'Sign In'.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please use at least 6 characters.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please wait a moment and try again.");
          break;
        default:
          setError("Authentication could not be completed. Please try again.");
          break;
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div
      className={`
        relative w-full max-w-sm mx-auto rounded-3xl bg-white shadow-2xl border border-gray-100 
        p-6 sm:p-7 font-poppins
        transform transition-all duration-300
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
        aria-label="Close modal"
      >
        ✕
      </button>

      {/* Header */}
      <div className="mb-4 text-center">
        <div className="w-11 h-11 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl shadow-sm">
          🛍️
        </div>
        <h2 className="font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
          {isSignUp ? "Create Your Account" : "Welcome Back"}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {isSignUp
            ? "Sign up to track price drops, save deals, and access member benefits."
            : "Sign in to save deals and access your affiliate dashboard."}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setError(null);
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            !isSignUp
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setError(null);
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            isSignUp
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Status Alerts */}
      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
          {successMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 flex flex-col">
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-gray-700"
          >
            Email address
          </label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="
              px-3 h-10
              border border-gray-300
              block w-full rounded-xl
              text-xs sm:text-sm text-gray-900
              shadow-sm
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none
              transition-all
            "
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-700"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="
                px-3 h-10
                border border-gray-300
                block w-full rounded-xl
                text-xs sm:text-sm text-gray-900
                shadow-sm
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none
                transition-all
              "
              placeholder="At least 6 characters"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className={`
            w-full py-2.5 px-4
            text-xs sm:text-sm font-bold
            text-white 
            rounded-xl 
            shadow-md hover:shadow-lg
            transition-all
            transform active:scale-[0.99]
            ${
              isLoggingIn
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
        >
          {isLoggingIn
            ? isSignUp
              ? "Creating Account..."
              : "Signing In..."
            : isSignUp
            ? "Create Account"
            : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center space-x-2 my-3">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="text-[11px] text-gray-400 font-medium">Or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Google Sign In */}
      <div className="mb-2">
        <SignIn onClose={onClose} />
      </div>
    </div>
  );
}
