import { User } from "firebase/auth";
import { API_BASE_URL } from "../config/api";

// Known administrator emails
export const ADMIN_EMAILS: string[] = [
  "admin@affiliatepulse.io",
  "admin@izzyo.com",
  "dhanushkumar@gmail.com",
  "admin@iyzzo.com",
];

/**
 * Check if an email address belongs to an admin
 */
export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  
  if (ADMIN_EMAILS.some((adm) => cleanEmail === adm.toLowerCase())) {
    return true;
  }
  
  // Any email starting with admin@ or ending with @affiliatepulse.io
  if (cleanEmail.startsWith("admin@") || cleanEmail.endsWith("@affiliatepulse.io")) {
    return true;
  }

  return false;
}

/**
 * Comprehensive, resilient admin status check.
 * Checks Firebase custom claims, known admin emails, cached admin state,
 * and queries the backend with a strict timeout so users are never falsely locked out.
 */
export async function verifyIsAdmin(user: User | null): Promise<boolean> {
  // Check cached admin state from demo or previous verification
  const cachedAdmin = localStorage.getItem("isAdmin") === "true";
  const cachedEmail = localStorage.getItem("email");

  if (isEmailAdmin(cachedEmail)) {
    localStorage.setItem("isAdmin", "true");
    return true;
  }

  if (!user) {
    return cachedAdmin;
  }

  // 1. Direct email verification
  if (isEmailAdmin(user.email)) {
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("email", user.email || "");
    return true;
  }

  // 2. Firebase token custom claims verification
  try {
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims && idTokenResult.claims.admin === true) {
      localStorage.setItem("isAdmin", "true");
      return true;
    }
  } catch (err) {
    console.warn("Could not inspect user custom claims:", err);
  }

  // 3. Query backend /check-admin with a 3.5-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const token = await user.getIdToken();
    const response = await fetch(`${API_BASE_URL}/check-admin`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.isAdmin === true) {
        localStorage.setItem("isAdmin", "true");
        return true;
      }
    }
  } catch (err) {
    console.warn("Backend /check-admin check timed out or failed:", err);
  }

  // Fallback to cached state
  return cachedAdmin;
}
