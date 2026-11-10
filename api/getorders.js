// Vercel Serverless Function: Retrieve Store Orders
// Reads from Supabase PostgreSQL orders table, unpacks metadata, and formats for AdminOrders

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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  try {
    // 1. Fetch userjoins to ensure current email mapping
    const userMap = {};
    try {
      const uRes = await fetch(`${SUPABASE_URL}/rest/v1/userjoins?select=email,trackingid`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (uRes.ok) {
        const joins = await uRes.json();
        joins.forEach((j) => {
          if (j.trackingid && j.email) {
            userMap[j.trackingid.trim().toLowerCase()] = j.email.trim();
          }
        });
      }
    } catch (err) {
      console.warn("Could not load userjoins:", err.message);
    }

    // 2. Fetch orders from Supabase
    const ordersRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!ordersRes.ok) {
      const errText = await ordersRes.text();
      console.error("Failed to query orders from Supabase:", errText);
      return res.status(500).json({ error: "Failed to query orders from database", details: errText });
    }

    const rawOrders = await ordersRes.json();

    // 3. Normalize orders for frontend
    const formattedOrders = rawOrders.map((o) => {
      let meta = {};
      if (o.upiID && typeof o.upiID === "string" && o.upiID.startsWith("{")) {
        try {
          meta = JSON.parse(o.upiID);
        } catch {
          // not JSON
        }
      }

      const cleanTag = (o.trackingID || o.tracking_id || "dk29112306-21").trim().toLowerCase();
      const email = userMap[cleanTag] || o.email || "dhanushkumark62@gmail.com";

      const shipped = parseInt(o.itemsShipped || o.items_shipped, 10) || 1;
      const rev = parseFloat(o.revenue) || 0;
      const fee = parseFloat(o.advertisingFee || o.fees) || 0;
      const price = meta.price ? parseFloat(meta.price) : rev && shipped ? rev / shipped : 0;

      return {
        id: o.id,
        email: email,
        tracking_id: o.trackingID || o.tracking_id || "dk29112306-21",
        item_name: o.productTitle || o.item_name || "Amazon Partner Item",
        category: meta.category || o.category || "General",
        asin: meta.asin || o.asin || "—",
        seller: meta.seller || o.seller || "Amazon Retail",
        date: meta.date || (o.created_at ? o.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)),
        price: price,
        items_shipped: shipped,
        returns: meta.returns !== undefined ? Number(meta.returns) : 0,
        revenue: rev,
        fees: fee,
        device_type: meta.device_type || o.device_type || "Mobile Phone",
        direct_sale: meta.direct_sale || o.direct_sale || "Y",
        status: o.status === true,
      };
    });

    return res.status(200).json(formattedOrders);
  } catch (err) {
    console.error("Exception in getorders handler:", err);
    return res.status(500).json({ error: "Internal server error fetching orders", details: err.message });
  }
}
