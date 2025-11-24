import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import SignIn from "./GoogleSignUp";

export default function LogIn({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  // For entrance animation
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user) {
        setError("User not signed in.");
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(
        "https://affiliate-server-8irx.onrender.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to authenticate with the server.");
      }

      const data = await response.json();
      const trackingid = data.trackingId;
      const emaildata = data.email;
      localStorage.setItem("trackingId", trackingid);
      localStorage.setItem("email", emaildata);

      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      setError("Login failed. Please check your email and password.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div
      className={`
        w-full max-w-sm mx-auto rounded-2xl bg-white shadow-xl border border-gray-100 
        p-5 sm:p-6 font-poppins
        transform transition-all duration-300
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {/* Header */}
      <div className="mb-4">
        <p className="text-center font-semibold text-xl sm:text-2xl text-gray-900">
          Sign in to your account
        </p>
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-1">
          Access your personalized deals and tracking dashboard.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="mb-3 text-xs sm:text-sm text-red-500 text-center bg-red-50 border border-red-100 px-3 py-2 rounded-lg animate-pulse">
          {error}
        </p>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 sm:space-y-4 flex flex-col"
      >
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="block text-xs sm:text-sm font-medium text-gray-900"
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
              px-3 h-9 sm:h-10
              border border-gray-300
              block w-full rounded-md
              text-sm sm:text-base
              shadow-sm
              focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-80
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
              className="block text-xs sm:text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-[11px] sm:text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                px-3 h-9 sm:h-10
                border border-gray-300
                block w-full rounded-md
                text-sm sm:text-base
                shadow-sm
                focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-80
                transition-all
              "
              placeholder="••••••••"
            />
          </div>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
            Make sure you’re using the email you registered with.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2 
              text-xs sm:text-sm font-medium 
              text-gray-700 bg-white 
              border border-gray-300 
              rounded-md 
              hover:bg-gray-50 
              hover:-translate-y-[1px]
              active:translate-y-[1px]
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300
              transition-all
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoggingIn}
            className={`
              px-4 py-2 
              text-xs sm:text-sm font-medium 
              text-white 
              rounded-md 
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
              transition-all
              hover:-translate-y-[1px]
              active:translate-y-[1px]
              ${
                isLoggingIn
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {isLoggingIn ? "Logging In..." : "Log In"}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center space-x-2 px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-2 text-[11px] sm:text-xs text-gray-500">
          Or continue with
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Google Sign In */}
      <div className="flex justify-center">
        <div className="transform transition-transform duration-200 hover:-translate-y-[1px]">
          <SignIn onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
