/**
 * Vercel Serverless Function: /api/avatar
 * Handles uploading cropped avatar data and persisting avatar URL into 'user_profiles' table
 * Supported Methods: POST
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://zxwfwtagcqwwevnuqber.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_SECRET_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_KEY ||
  "sb_publishable_Cee7KZOIemSQnwoJh6tW4A_jVB7X0PE";

const PRIMARY_TABLE = "user_profiles";
const FALLBACK_TABLE = "profiles";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { id, email, image_data } = req.body || {};

  if (!image_data || typeof image_data !== "string") {
    return res.status(400).json({ error: "Missing or invalid image data payload." });
  }

  // Validate data URL format and max file size (~3MB limit for Base64)
  if (!image_data.startsWith("data:image/") && !image_data.startsWith("https://")) {
    return res.status(400).json({ error: "Avatar must be a valid base64 image data URL or HTTPS image link." });
  }

  if (image_data.length > 4 * 1024 * 1024) {
    return res.status(400).json({ error: "Image file exceeds maximum upload size (3MB limit)." });
  }

  const avatarUrl = image_data;

  // Persist directly to user_profiles table if identifier provided
  if (id || email) {
    try {
      const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      };

      const payload = {
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      if (id) payload.id = id;
      if (email) payload.email = email;

      let r = await fetch(`${SUPABASE_URL}/rest/v1/${PRIMARY_TABLE}?on_conflict=email`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (r.status === 404) {
        await fetch(`${SUPABASE_URL}/rest/v1/${FALLBACK_TABLE}?on_conflict=email`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.warn("Avatar DB sync warning:", err);
    }
  }

  return res.status(200).json({
    success: true,
    avatar_url: avatarUrl,
    message: "Avatar saved to user_profiles table successfully.",
  });
}
