// Vercel Serverless Function: Import and Ingest Amazon Affiliate Orders
// Supports CSV & JSON orders data, links partner tags to userjoins, and persists to Supabase

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

function parseCsv(content) {
  let text = typeof content === "string" ? content : content.toString("utf-8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\r") {
        if (nextChar === "\n") i++;
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
      } else if (char === "\n") {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows.filter((r) => r.some((c) => c.length > 0));
}

function normalizeHeaders(headerRow) {
  const map = {};
  headerRow.forEach((col, idx) => {
    const clean = col.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (/^(trackingid|trackingtag|tag|partnertag)$/.test(clean)) map.tracking_id = idx;
    else if (/^(producttitle|productname|itemname|name|title|item)$/.test(clean)) map.item_name = idx;
    else if (/^(asin|productid|itemid)$/.test(clean)) map.asin = idx;
    else if (/^(category|productcategory)$/.test(clean)) map.category = idx;
    else if (/^(seller|merchant)$/.test(clean)) map.seller = idx;
    else if (/^(dateshipped|date|orderdate|shippeddate)$/.test(clean)) map.date = idx;
    else if (/^(price|itemprice|unitprice)$/.test(clean)) map.price = idx;
    else if (/^(itemsshipped|shippeditems|quantity|units)$/.test(clean)) map.items_shipped = idx;
    else if (/^(returns|itemsreturned)$/.test(clean)) map.returns = idx;
    else if (/^(revenue|sales|shippedrevenue|totalrevenue|amount)$/.test(clean)) map.revenue = idx;
    else if (/^(adfees|advertisingfee|advertisingfees|fees|fee|commission|earnings)$/.test(clean)) map.fees = idx;
    else if (/^(devicetypegroup|devicetype|device)$/.test(clean)) map.device_type = idx;
    else if (/^(directsale)$/.test(clean)) map.direct_sale = idx;
  });
  return map;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    let rawData = req.body;
    let ordersToProcess = [];

    // Case 1: Client sent parsed orders directly
    if (rawData && Array.isArray(rawData.orders)) {
      ordersToProcess = rawData.orders;
    }
    // Case 2: Client sent a CSV string in body.csv or as raw string
    else if (typeof rawData === "string" || (rawData && typeof rawData.csv === "string")) {
      const csvContent = typeof rawData === "string" ? rawData : rawData.csv;
      const rows = parseCsv(csvContent);
      if (rows.length < 2) {
        return res.status(400).json({ error: "CSV file is empty or missing data rows" });
      }

      const headerMap = normalizeHeaders(rows[0]);
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || row.every((c) => !c)) continue;

        ordersToProcess.push({
          tracking_id: headerMap.tracking_id !== undefined ? row[headerMap.tracking_id] : "dk29112306-21",
          item_name: headerMap.item_name !== undefined ? row[headerMap.item_name] : "Amazon Product",
          asin: headerMap.asin !== undefined ? row[headerMap.asin] : "—",
          category: headerMap.category !== undefined ? row[headerMap.category] : "General",
          seller: headerMap.seller !== undefined ? row[headerMap.seller] : "Amazon Retail",
          date: headerMap.date !== undefined ? row[headerMap.date] : new Date().toISOString().slice(0, 10),
          price: headerMap.price !== undefined ? parseFloat(row[headerMap.price]) || 0 : 0,
          items_shipped: headerMap.items_shipped !== undefined ? parseInt(row[headerMap.items_shipped], 10) || 1 : 1,
          returns: headerMap.returns !== undefined ? parseInt(row[headerMap.returns], 10) || 0 : 0,
          revenue: headerMap.revenue !== undefined ? parseFloat(row[headerMap.revenue]) || 0 : 0,
          fees: headerMap.fees !== undefined ? parseFloat(row[headerMap.fees]) || 0 : 0,
          device_type: headerMap.device_type !== undefined ? row[headerMap.device_type] : "Mobile Phone",
          direct_sale: headerMap.direct_sale !== undefined ? row[headerMap.direct_sale] : "Y",
        });
      }
    }
    // Case 3: Empty body
    else if (!rawData || Object.keys(rawData).length === 0) {
      return res.status(400).json({ error: "No orders or CSV data provided in request body" });
    }

    if (ordersToProcess.length === 0) {
      return res.status(400).json({ error: "Could not parse any valid order rows from payload" });
    }

    // Fetch userjoins from Supabase to assign user emails
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
      console.warn("Could not load userjoins from Supabase:", err.message);
    }

    // Format rows for Supabase orders table
    const supabaseRows = ordersToProcess.map((order) => {
      const cleanTag = (order.tracking_id || "dk29112306-21").trim().toLowerCase();
      const matchedEmail = userMap[cleanTag] || order.email || "dhanushkumark62@gmail.com";

      const metadata = {
        asin: order.asin || "—",
        category: order.category || "General",
        seller: order.seller || "Amazon Retail",
        date: order.date || new Date().toISOString().slice(0, 10),
        price: Number(order.price) || 0,
        device_type: order.device_type || "Mobile Phone",
        direct_sale: order.direct_sale || "Y",
        returns: Number(order.returns) || 0,
      };

      return {
        trackingID: order.tracking_id || "dk29112306-21",
        email: matchedEmail,
        productTitle: order.item_name || "Amazon Product",
        itemsShipped: String(order.items_shipped || 1),
        revenue: String(order.revenue || 0),
        advertisingFee: String(order.fees || 0),
        status: false,
        upiID: JSON.stringify(metadata),
      };
    });

    // Write to Supabase orders table
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(supabaseRows),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("Supabase insert failed:", errText);
      return res.status(500).json({ error: "Failed to persist orders to Supabase", details: errText });
    }

    const insertedData = await insertRes.json();
    const totalRev = ordersToProcess.reduce((sum, o) => sum + (Number(o.revenue) || 0), 0);
    const totalFee = ordersToProcess.reduce((sum, o) => sum + (Number(o.fees) || 0), 0);

    return res.status(200).json({
      success: true,
      message: "Upload and import successful",
      count: insertedData.length || ordersToProcess.length,
      totalRevenue: totalRev,
      totalFees: totalFee,
      orders: ordersToProcess,
    });
  } catch (err) {
    console.error("Exception in sendorderdata handler:", err);
    return res.status(500).json({ error: "Internal server error processing orders", details: err.message });
  }
}
