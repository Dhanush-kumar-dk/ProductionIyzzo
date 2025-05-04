import { useState } from "react";
import { auth } from "../firebase"; // Ensure Firebase is initialized in this file
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import GoogleIcon from "../assets/google.png";

function SignIn({ onClose }: { onClose: () => void }) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    console.log("Login button clicked"); // Debugging log
    const provider = new GoogleAuthProvider();
    provider.addScope("email");

    setIsSigningIn(true);
    setError(null);

    try {
      // Call Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      console.log("Token retrieved:", token); // Debugging log

      // Send token using API
      const response = await fetch(
        "https://affiliate-server-8irx.onrender.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
        }
      );

      console.log("Response status:", response.status); // Debugging log

      if (!response.ok) {
        throw new Error("Failed to authenticate with the server.");
      }

      const data = await response.json();

      // Store trackingId and email
      localStorage.setItem("trackingId", data.trackingId);
      localStorage.setItem("email", data.email || "");

      // Close the sign-in modal
      onClose();
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 cursor-pointer 
        hover:bg-gray-200 shadow-md transition-all duration-100 ease-in-out ${
          isSigningIn ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={!isSigningIn ? handleClick : undefined}
      >
        <img src={GoogleIcon} alt="Google Icon" className="w-6 h-6" />
        {isSigningIn ? "Signing In..." : "Sign in with Google"}
      </div>
    </div>
  );
}

export default SignIn;
