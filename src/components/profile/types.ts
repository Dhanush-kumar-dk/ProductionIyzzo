/**
 * User Profile & Account Settings Types
 */

export type ProfileTabId = "profile" | "security" | "preferences" | "notifications" | "billing";

export interface SocialLinks {
  linkedin: string;
  twitter: string;
  github: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: "light" | "dark" | "system";
  currency: string;
}

export interface UserNotifications {
  email_price_alerts: boolean;
  email_weekly_digest: boolean;
  email_security: boolean;
  email_restock: boolean;
  in_app_deals: boolean;
  in_app_system: boolean;
}

export interface UserBilling {
  wallet_balance: number;
  pending_cashback: number;
  payout_method: "UPI" | "Bank" | "Amazon Gift Card";
  upi_id: string;
  account_number?: string;
  ifsc_code?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  email_verified: boolean;
  username: string;
  full_name: string;
  headline: string;
  avatar_url: string;
  company: string;
  job_title: string;
  location: string;
  website: string;
  social_links: SocialLinks;
  preferences: UserPreferences;
  notifications: UserNotifications;
  billing: UserBilling;
  two_factor_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}
