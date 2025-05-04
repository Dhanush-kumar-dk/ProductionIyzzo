import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import SignIn from "./GoogleSignUp";

export default function LogIn({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      // Firebase Sign In
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

      // Get Firebase auth token
      const token = await user.getIdToken();
      console.log("Token:", token);

      // Send token to backend
      const response = await fetch(
        "https://affiliate-server-8irx.onrender.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include", // Ensure cookies are included
        }
      );

      if (!response.ok) {
        throw new Error("Failed to authenticate with the server.");
      }

      const data = await response.json();
      console.log("Server Response:", data);

      // Extract and store tracking ID and email
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
    <div className="w-96 h-auto border p-4 rounded-md bg-white">
      <div className="flex flex-col justify-center align-middle">
        <p className="flex justify-center font-bold text-2xl">
          Sign in to your account
        </p>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-1 flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
          >
            Email address
          </label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-2 mt-1 h-9 border-2 block w-full rounded-sm border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-100"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-2 mt-1 h-9 border-2 block w-full rounded-sm border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        <div className="flex justify-center space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoggingIn ? "Logging In..." : "Log In"}
          </button>
        </div>
      </form>

      <div className="flex items-center space-x-2 px-4 py-3">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">Or continue with</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <SignIn onClose={onClose} />
    </div>
  );
}
