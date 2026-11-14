/**
 * Vercel Serverless Function: /api/profile
 * Handles fetching, validating, and mutating user profile metadata
 * Supported Methods: GET (lookup / username uniqueness check), PATCH (update profile)
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

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };

  // -------------------------------------------------------------
  // GET: Fetch profile OR Check username availability
  // -------------------------------------------------------------
  if (req.method === "GET") {
    const { id, email, username, check_username, current_user_id } = req.query;

    // Check unique username availability
    if (check_username) {
      const cleanUser = String(check_username).trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUser)) {
        return res.status(200).json({
          available: false,
          error: "Username must be 3-30 characters and contain only letters, numbers, or underscores.",
        });
      }

      try {
        const queryUrl = `${SUPABASE_URL}/rest/v1/profiles?select=id,username&username=ilike.${encodeURIComponent(cleanUser)}&limit=1`;
        const r = await fetch(queryUrl, { headers });
        if (!r.ok) {
          // If profiles table isn't created yet, allow username
          return res.status(200).json({ available: true });
        }
        const data = await r.json();
        const existing = Array.isArray(data) && data.length > 0 ? data[0] : null;

        if (existing && existing.id !== current_user_id) {
          return res.status(200).json({ available: false, error: "Username is already taken." });
        }
        return res.status(200).json({ available: true });
      } catch (err) {
        return res.status(200).json({ available: true });
      }
    }

    // Retrieve user profile by id, email, or username
    const filter = id
      ? `id=eq.${encodeURIComponent(id)}`
      : email
      ? `email=eq.${encodeURIComponent(email)}`
      : username
      ? `username=ilike.${encodeURIComponent(username)}`
      : null;

    if (!filter) {
      return res.status(400).json({ error: "Missing lookup identifier (id, email, or username)." });
    }

    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&${filter}&limit=1`, { headers });
      if (!r.ok) {
        return res.status(200).json({ profile: null });
      }
      const rows = await r.json();
      return res.status(200).json({ profile: Array.isArray(rows) && rows.length > 0 ? rows[0] : null });
    } catch (err) {
      console.warn("Profile fetch error:", err);
      return res.status(500).json({ error: "Failed to query database." });
    }
  }

  // -------------------------------------------------------------
  // PATCH: Update Profile Fields
  // -------------------------------------------------------------
  if (req.method === "PATCH") {
    const {
      id,
      email,
      username,
      full_name,
      headline,
      avatar_url,
      company,
      job_title,
      location,
      website,
      social_links,
      preferences,
      notifications,
      billing,
      two_factor_enabled,
    } = req.body || {};

    if (!id && !email) {
      return res.status(400).json({ error: "User ID or Email is required for profile updates." });
    }

    // Validation
    if (headline && String(headline).length > 160) {
      return res.status(400).json({ error: "Headline cannot exceed 160 characters." });
    }

    if (username) {
      const cleanUser = String(username).trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUser)) {
        return res.status(400).json({
          error: "Username must be between 3 and 30 alphanumeric characters or underscores.",
        });
      }
    }

    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (username !== undefined) payload.username = String(username).trim().toLowerCase();
    if (full_name !== undefined) payload.full_name = String(full_name).trim();
    if (headline !== undefined) payload.headline = String(headline).trim().slice(0, 160);
    if (avatar_url !== undefined) payload.avatar_url = String(avatar_url).trim();
    if (company !== undefined) payload.company = String(company).trim();
    if (job_title !== undefined) payload.job_title = String(job_title).trim();
    if (location !== undefined) payload.location = String(location).trim();
    if (website !== undefined) payload.website = String(website).trim();
    if (social_links !== undefined) payload.social_links = social_links;
    if (preferences !== undefined) payload.preferences = preferences;
    if (notifications !== undefined) payload.notifications = notifications;
    if (billing !== undefined) payload.billing = billing;
    if (two_factor_enabled !== undefined) payload.two_factor_enabled = Boolean(two_factor_enabled);
    if (email && !payload.email) payload.email = String(email).trim().toLowerCase();
    if (id && !payload.id) payload.id = String(id).trim();

    try {
      // Upsert profile record into Supabase
      const upsertUrl = `${SUPABASE_URL}/rest/v1/profiles?on_conflict=email`;
      const r = await fetch(upsertUrl, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const errText = await r.text();
        return res.status(r.status).json({ error: `Database error: ${errText}` });
      }

      const updated = await r.json();
      return res.status(200).json({
        success: true,
        profile: Array.isArray(updated) && updated.length > 0 ? updated[0] : payload,
      });
    } catch (err) {
      console.warn("Profile update error:", err);
      return res.status(500).json({ error: "Failed to persist profile updates." });
    }
  }

  return res.status(405).json({ error: "Method not allowed. Supported: GET, PATCH." });
}
