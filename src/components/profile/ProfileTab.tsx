import React, { useState, useEffect, useRef } from "react";
import { UserProfile } from "./types";
import AvatarCropModal from "./AvatarCropModal";
import {
  CameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  MapPinIcon,
  UserIcon,
  AtSymbolIcon,
} from "@heroicons/react/24/solid";
import { FaLinkedin, FaXTwitter, FaGithub } from "react-icons/fa6";

interface ProfileTabProps {
  profile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => Promise<boolean>;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export default function ProfileTab({ profile, onSave, showToast }: ProfileTabProps) {
  // Form State
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [initialData, setInitialData] = useState<UserProfile>(profile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avatar Cropping State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameMessage, setUsernameMessage] = useState<string>("");

  // Sync state if parent profile changes
  useEffect(() => {
    setFormData(profile);
    setInitialData(profile);
  }, [profile]);

  // Determine if form is dirty (modified)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  // Debounced username availability check
  useEffect(() => {
    const rawUsername = formData.username.trim().toLowerCase();
    if (!rawUsername) {
      setUsernameStatus("invalid");
      setUsernameMessage("Username is required.");
      return;
    }

    if (rawUsername === initialData.username.trim().toLowerCase()) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(rawUsername)) {
      setUsernameStatus("invalid");
      setUsernameMessage("Use 3-30 letters, numbers, or underscores.");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile?check_username=${encodeURIComponent(rawUsername)}&current_user_id=${formData.id}`);
        if (!res.ok) {
          setUsernameStatus("available");
          return;
        }
        const data = await res.json();
        if (data.available) {
          setUsernameStatus("available");
          setUsernameMessage("Username is available!");
        } else {
          setUsernameStatus("taken");
          setUsernameMessage(data.error || "This username is already taken.");
        }
      } catch (err) {
        setUsernameStatus("available");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.username, initialData.username, formData.id]);

  // Handle avatar file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("error", "Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Avatar file size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setTempImageSrc(event.target.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      showToast("error", "Please choose a valid and available username.");
      return;
    }

    if (!formData.full_name.trim()) {
      showToast("error", "Full name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    const success = await onSave(formData);
    setIsSubmitting(false);

    if (success) {
      setInitialData(formData);
      showToast("success", "Profile updated successfully!");
    } else {
      showToast("error", "Failed to update profile. Please try again.");
    }
  };

  // User Initials fallback
  const getInitials = () => {
    if (formData.full_name?.trim()) {
      const parts = formData.full_name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (formData.email || "U").slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-fade-in font-poppins">
      {/* Tab Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Public Profile</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage how your identity, bio, and social presence appear to other Yearnit buyers and community reviewers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-2xl bg-white border border-slate-100 shadow-xs">
          <div className="relative group">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt={formData.full_name || "User Avatar"}
                className="w-24 h-24 rounded-full object-cover border-2 border-amber-400 shadow-md ring-4 ring-amber-400/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black flex items-center justify-center text-2xl shadow-md border-2 border-white ring-4 ring-amber-400/10">
                {getInitials()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 rounded-full shadow-lg transition active:scale-90"
              title="Upload new avatar"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900">Profile Photo</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              Square PNG, JPG, or WebP up to 5MB. Click the camera icon to upload and position your avatar using our 1:1 circular cropper.
            </p>
            {formData.avatar_url && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, avatar_url: "" })}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline pt-1"
              >
                Remove photo and use initials
              </button>
            )}
          </div>
        </div>

        {/* Basic Information Grid */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Dhanush Kumar"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                  }
                  placeholder="e.g. dhanush_dk"
                  className={`w-full text-xs font-medium pl-8 pr-9 py-2.5 rounded-xl border outline-none transition ${
                    usernameStatus === "taken" || usernameStatus === "invalid"
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-400/20 bg-rose-50/20"
                      : usernameStatus === "available"
                      ? "border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 bg-emerald-50/20"
                      : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  }`}
                />
                <AtSymbolIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                <div className="absolute right-3 top-3">
                  {usernameStatus === "checking" && <ArrowPathIcon className="w-4 h-4 text-slate-400 animate-spin" />}
                  {usernameStatus === "available" && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                  {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                    <ExclamationCircleIcon className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              </div>
              {usernameMessage && (
                <p
                  className={`text-[11px] mt-1 font-medium ${
                    usernameStatus === "available" ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {usernameMessage}
                </p>
              )}
            </div>
          </div>

          {/* Headline / Bio with 160 char counter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Headline / Bio
              </label>
              <span
                className={`text-[11px] font-bold ${
                  formData.headline.length > 150 ? "text-amber-600" : "text-slate-400"
                }`}
              >
                {formData.headline.length}/160
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={160}
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. Tech enthusiast & audiophile reviewing the best budget earbuds and flagships on Yearnit."
              className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition resize-none"
            />
          </div>

          {/* Work & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Acme Studio"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
                <BuildingOfficeIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Job Title</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="e.g. Hardware Reviewer"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
                <BriefcaseIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
                <MapPinIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Online Presence & Social Links */}
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Website & Social Links</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Personal Website / Blog</label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourdomain.com"
                  className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
                <GlobeAltIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">LinkedIn Profile</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.social_links.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, linkedin: e.target.value },
                    })
                  }
                  placeholder="linkedin.com/in/username"
                  className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
                <FaLinkedin className="w-4 h-4 text-[#0077B5] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">X (Twitter)</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.social_links.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, twitter: e.target.value },
                    })
                  }
                  placeholder="@handle"
                  className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
                <FaXTwitter className="w-4 h-4 text-slate-800 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">GitHub Profile</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.social_links.github}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, github: e.target.value },
                    })
                  }
                  placeholder="github.com/username"
                  className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
                <FaGithub className="w-4 h-4 text-slate-800 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Actions Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
          <div className="text-xs text-slate-400">
            {isDirty ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved modifications detected
              </span>
            ) : (
              <span>All changes saved to database</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                type="button"
                onClick={() => setFormData(initialData)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Reset
              </button>
            )}
            <button
              type="submit"
              disabled={!isDirty || isSubmitting || usernameStatus === "taken" || usernameStatus === "invalid"}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                !isDirty || isSubmitting || usernameStatus === "taken" || usernameStatus === "invalid"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/20 active:scale-95"
              }`}
            >
              {isSubmitting && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Crop Modal */}
      {cropModalOpen && (
        <AvatarCropModal
          imageSrc={tempImageSrc}
          onCropComplete={async (croppedDataUrl) => {
            setFormData((prev) => ({ ...prev, avatar_url: croppedDataUrl }));
            showToast("info", "Uploading avatar to Cloudflare R2 storage...");
            try {
              const res = await fetch("/api/upload-screenshot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  image_data: croppedDataUrl,
                  category: "avatar",
                  user_id: formData.id,
                  filename: "avatar.jpg",
                }),
              });
              const data = await res.json();
              if (data.url) {
                setFormData((prev) => ({ ...prev, avatar_url: data.url }));
                showToast("success", "Avatar stored securely in Cloudflare R2!");
              } else {
                showToast("info", "Avatar ready. Click Save Changes to store.");
              }
            } catch {
              showToast("info", "Avatar ready. Click Save Changes to store.");
            }
          }}
          onClose={() => setCropModalOpen(false)}
        />
      )}
    </div>
  );
}
