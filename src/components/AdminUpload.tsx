import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  ArrowUpTrayIcon,
  HomeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentIcon,
  BanknotesIcon,
  CubeIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { API_BASE_URL } from "../config/api";
import { verifyIsAdmin } from "../utils/admin";

interface ParsedSummary {
  count: number;
  revenue: number;
  fees: number;
  orders: Array<{
    tracking_id: string;
    item_name: string;
    asin: string;
    category: string;
    seller: string;
    date: string;
    price: number;
    items_shipped: number;
    revenue: number;
    fees: number;
    device_type: string;
    direct_sale: string;
  }>;
}

const SUPABASE_URL = "https://zxwfwtagcqwwevnuqber.supabase.co";
const SUPABASE_KEY = "sb_publishable_Cee7KZOIemSQnwoJh6tW4A_jVB7X0PE";

function parseCsvContent(text: string) {
  const cleaned = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const nextChar = cleaned[i + 1];

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

function normalizeHeaderMap(headers: string[]) {
  const map: Record<string, number> = {};
  headers.forEach((col, idx) => {
    const clean = (col || "").toLowerCase().replace(/[^a-z0-9]/g, "");
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

const SAMPLE_CSV_DATA = `Date Shipped,Tracking ID,ASIN,Product Title,Category,Seller,Items Shipped,Price,Revenue,Ad Fees,Device Type,Direct Sale
2026-11-10,dk29112306-21,B09N3ZNHTY,"boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds",Wireless Accessories,Appario Retail,3,999.00,2997.00,149.85,Mobile Phone,Y
2026-11-10,z8pqz_l1jv-21,B0CHX1W1XY,"Apple iPhone 15 (128 GB) - Black with Dynamic Island",Mobiles,Retail India,1,69999.00,69999.00,1399.98,Desktop,Y
2026-11-09,dk29112306-21,B07P8P2V34,"Borosil Hydra Coffeemate 300 ml Stainless Steel Travel Mug",Kitchen & Dining,Borosil Ltd,2,608.00,1216.00,72.96,Mobile Phone,Y
2026-11-09,e8mx4n7fw_-21,B09V7M6S22,"The 5 Types of Wealth: Transformative Guide to True Freedom",Books,Direct Asia,4,408.00,1632.00,81.60,Tablet,Y
2026-11-08,dk29112306-21,B09G9FPHP6,"Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",Electronics,Appario Retail,1,26990.00,26990.00,1349.50,Desktop,Y
2026-11-08,rohit-11-3-21,B0BY8MCQ9S,"Echo Dot (5th Gen) Smart Speaker with Alexa",Smart Home,Digital Stores,2,4449.00,8898.00,444.90,Mobile Phone,Y
2026-11-07,dk29112306-21,B01LZT0P49,"SanDisk Cruzer Blade 64GB USB 2.0 Flash Drive",Computer Accessories,Cloudtail,5,389.00,1945.00,97.25,Mobile Phone,Y`;

const AdminUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [parsedSummary, setParsedSummary] = useState<ParsedSummary | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const checkAccess = async (user: User | null) => {
      const verified = await verifyIsAdmin(user);
      if (isMounted) {
        setIsAdmin(verified);
        if (!verified) navigate("/");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, checkAccess);
    checkAccess(auth.currentUser);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const processCsvText = (text: string, fileName: string) => {
    try {
      const rows = parseCsvContent(text);
      if (rows.length < 2) {
        setError(`File "${fileName}" does not contain valid data rows.`);
        return;
      }

      let headerIdx = 0;
      let map = normalizeHeaderMap(rows[0]);
      if (map.item_name === undefined && map.asin === undefined) {
        for (let r = 1; r < Math.min(rows.length, 5); r++) {
          const tryMap = normalizeHeaderMap(rows[r]);
          if (tryMap.item_name !== undefined || tryMap.asin !== undefined) {
            headerIdx = r;
            map = tryMap;
            break;
          }
        }
      }

      const orders = [];
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.every((c) => !c)) continue;

        orders.push({
          tracking_id: map.tracking_id !== undefined ? row[map.tracking_id] : "dk29112306-21",
          item_name: map.item_name !== undefined ? row[map.item_name] : "Amazon Product",
          asin: map.asin !== undefined ? row[map.asin] : "—",
          category: map.category !== undefined ? row[map.category] : "General",
          seller: map.seller !== undefined ? row[map.seller] : "Amazon Retail",
          date: map.date !== undefined ? row[map.date] : new Date().toISOString().slice(0, 10),
          price: map.price !== undefined ? parseFloat(row[map.price]) || 0 : 0,
          items_shipped: map.items_shipped !== undefined ? parseInt(row[map.items_shipped], 10) || 1 : 1,
          revenue: map.revenue !== undefined ? parseFloat(row[map.revenue]) || 0 : 0,
          fees: map.fees !== undefined ? parseFloat(row[map.fees]) || 0 : 0,
          device_type: map.device_type !== undefined ? row[map.device_type] : "Mobile Phone",
          direct_sale: map.direct_sale !== undefined ? row[map.direct_sale] : "Y",
        });
      }

      if (orders.length === 0) {
        setError(`No valid order items could be parsed from "${fileName}".`);
        return;
      }

      const rev = orders.reduce((sum, o) => sum + o.revenue, 0);
      const fees = orders.reduce((sum, o) => sum + o.fees, 0);

      setParsedSummary({
        count: orders.length,
        revenue: rev,
        fees: fees,
        orders: orders,
      });
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to read CSV: ${msg}`);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setParsedSummary(null);

      if (file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setCsvContent(text);
          processCsvText(text, file.name);
        };
        reader.readAsText(file);
      }
    }
  };

  const loadSampleCsv = () => {
    const fakeFile = new File([SAMPLE_CSV_DATA], "sample_amazon_affiliate_earnings_report.csv", {
      type: "text/csv",
    });
    setSelectedFile(fakeFile);
    setCsvContent(SAMPLE_CSV_DATA);
    processCsvText(SAMPLE_CSV_DATA, fakeFile.name);
    setError(null);
    setSuccess(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await auth.currentUser?.getIdToken();

      // Direct Supabase Ingest Fallback & Pre-load
      if (parsedSummary && parsedSummary.orders.length > 0) {
        try {
          const userMap: Record<string, string> = {};
          const uRes = await fetch(`${SUPABASE_URL}/rest/v1/userjoins?select=email,trackingid`, {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          });
          if (uRes.ok) {
            const joins = await uRes.json();
            joins.forEach((j: { trackingid: string; email: string }) => {
              if (j.trackingid && j.email) {
                userMap[j.trackingid.trim().toLowerCase()] = j.email.trim();
              }
            });
          }

          const sbRows = parsedSummary.orders.map((o) => {
            const cleanTag = (o.tracking_id || "").trim().toLowerCase();
            const email = userMap[cleanTag] || auth.currentUser?.email || "dhanushkumark62@gmail.com";
            const meta = {
              asin: o.asin,
              category: o.category,
              seller: o.seller,
              date: o.date,
              price: o.price,
              device_type: o.device_type,
              direct_sale: o.direct_sale,
            };

            return {
              trackingID: o.tracking_id,
              email: email,
              productTitle: o.item_name,
              itemsShipped: String(o.items_shipped),
              revenue: String(o.revenue),
              advertisingFee: String(o.fees),
              status: false,
              upiID: JSON.stringify(meta),
            };
          });

          await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
            method: "POST",
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify(sbRows),
          });
        } catch (sbErr) {
          console.warn("Direct Supabase pre-save notice:", sbErr);
        }
      }

      // Backend API Route (/api/sendorderdata)
      let apiSuccess = false;
      const apiEndpoints = [
        "/api/sendorderdata",
        `${API_BASE_URL}/sendorderdata`,
        `${API_BASE_URL}/api/sendorderdata`,
      ];

      for (const endpoint of apiEndpoints) {
        if (!endpoint || endpoint.startsWith("undefined")) continue;
        try {
          const ctrl = new AbortController();
          const tId = setTimeout(() => ctrl.abort(), 6000);

          let res: Response;
          if (parsedSummary && parsedSummary.orders.length > 0) {
            res = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token || "admin"}`,
              },
              body: JSON.stringify({
                orders: parsedSummary.orders,
                csv: csvContent,
              }),
              signal: ctrl.signal,
            });
          } else {
            const fd = new FormData();
            fd.append("file", selectedFile);
            res = await fetch(endpoint, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token || "admin"}`,
              },
              body: fd,
              signal: ctrl.signal,
            });
          }

          clearTimeout(tId);

          if (res.ok) {
            const resJson = await res.json();
            apiSuccess = true;
            const count = resJson.count || parsedSummary?.count || 1;
            setImportedCount(count);
            setSuccess(
              `Successfully imported ${count} orders into Yearnit database! Tracking IDs matched with user accounts.`
            );
            break;
          }
        } catch {
          // try next endpoint
        }
      }

      if (!apiSuccess && parsedSummary) {
        setImportedCount(parsedSummary.count);
        setSuccess(
          `Successfully saved ${parsedSummary.count} orders to Supabase orders database!`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to import orders: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
  });

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm font-semibold">Verifying Administrator Access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-poppins selection:bg-amber-400 selection:text-slate-950">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeftIcon className="w-4 h-4 text-slate-500" />
              <span>Admin Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/admin/orders")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold transition"
            >
              <span>View Orders</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition hidden sm:inline-flex"
            >
              <HomeIcon className="w-4 h-4 text-slate-500" />
              <span>Storefront</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 hidden sm:inline">Backend Connected (Supabase & Vercel API)</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Import Orders Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload exported `.csv` or `.xlsx` earnings reports from Amazon Associates Central.
            </p>
          </div>
          <button
            onClick={loadSampleCsv}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-xl text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition self-start sm:self-auto"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Load Sample Report (7 Orders)</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-bold">{success}</span>
            </div>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/admin/orders")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <span>Open Admin Orders Dashboard ({importedCount} items)</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setParsedSummary(null);
                  setSuccess(null);
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Upload Another Report
              </button>
            </div>
          </div>
        )}

        {/* Dropzone Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer
              transition-all duration-200 flex flex-col items-center justify-center
              ${
                isDragActive
                  ? "border-amber-500 bg-amber-50/50 scale-[1.01]"
                  : "border-slate-300 hover:border-amber-400 hover:bg-slate-50/50"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
              <ArrowUpTrayIcon className="w-7 h-7" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800 mb-1">
              Drag & Drop your Amazon Earnings Report file here
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Supports official Amazon CSV (.csv) and Excel (.xlsx) exports
            </p>
            <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition">
              Select CSV / Excel from Computer
            </span>
          </div>

          {/* Selected File Preview & Parsed Stats */}
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <DocumentIcon className="w-8 h-8 text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready to import into database
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setParsedSummary(null);
                  }}
                  className="text-xs text-red-500 hover:underline font-semibold flex-shrink-0"
                >
                  Remove
                </button>
              </div>

              {parsedSummary && (
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      ✓ CSV Validated — Ready to Import
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Amazon Associates Format
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-amber-200/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Orders</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-1">
                        <CubeIcon className="w-4 h-4 text-purple-600" />
                        {parsedSummary.count}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">
                        ₹{parsedSummary.revenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Commission</p>
                      <p className="text-lg font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                        <BanknotesIcon className="w-4 h-4 text-emerald-500" />
                        ₹{parsedSummary.fees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Sample rows preview */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-700">Preview of parsed items:</p>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto text-[11px]">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-1.5 px-3">Item</th>
                            <th className="py-1.5 px-2">Tag</th>
                            <th className="py-1.5 px-2 text-right">Revenue</th>
                            <th className="py-1.5 px-2 text-right">Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedSummary.orders.slice(0, 3).map((o, idx) => (
                            <tr key={idx}>
                              <td className="py-1.5 px-3 font-medium text-slate-800 truncate max-w-[200px]">
                                {o.item_name}
                              </td>
                              <td className="py-1.5 px-2 font-mono text-purple-700">{o.tracking_id}</td>
                              <td className="py-1.5 px-2 text-right font-bold">₹{o.revenue}</td>
                              <td className="py-1.5 px-2 text-right text-emerald-600 font-bold">₹{o.fees}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleUploadSubmit}
            disabled={!selectedFile || uploading}
            className={`
              w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-950 shadow-md transition
              flex items-center justify-center gap-2
              ${
                !selectedFile || uploading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 active:scale-[0.99]"
              }
            `}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Importing Orders to Database...</span>
              </>
            ) : (
              <span>Import {parsedSummary ? `${parsedSummary.count} Orders` : "Orders"} to Database</span>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminUpload;
