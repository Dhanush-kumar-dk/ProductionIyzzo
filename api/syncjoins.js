// Vercel Serverless Function: Synchronize User Joins & Partner Tracking Tags

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://zxwfwtagcqwwevnuqber.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_SECRET_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_Cee7KZOIemSQnwoJh6tW4A_jVB7X0PE";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // 1. Fetch userjoins
    const uRes = await fetch(`${SUPABASE_URL}/rest/v1/userjoins?select=email,trackingid`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    const userMap = {};
    if (uRes.ok) {
      const joins = await uRes.json();
      joins.forEach((j) => {
        if (j.trackingid && j.email) {
          userMap[j.trackingid.trim().toLowerCase()] = j.email.trim();
        }
      });
    }

    // 2. Fetch orders
    const oRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id,trackingID,email`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    let syncCount = 0;
    if (oRes.ok) {
      const orders = await oRes.json();
      for (const order of orders) {
        const cleanTag = (order.trackingID || "").trim().toLowerCase();
        const expectedEmail = userMap[cleanTag];
        if (expectedEmail && order.email !== expectedEmail) {
          syncCount++;
          await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: expectedEmail }),
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Database synchronization complete! ${syncCount} order tracking links updated.`,
      count: syncCount,
    });
  } catch (err) {
    console.error("Exception in syncjoins handler:", err);
    return res.status(500).json({ error: "Internal server error during sync", details: err.message });
  }
}
