import { useState } from "react";
import { UserBilling } from "./types";
import { metaEvents } from "../../utils/tracking";
import {
  BanknotesIcon,
  ArrowUpRightIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";

interface BillingTabProps {
  billing: UserBilling;
  onUpdateBilling: (updated: UserBilling) => Promise<boolean>;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export default function BillingTab({ billing, onUpdateBilling, showToast }: BillingTabProps) {
  const [data, setData] = useState<UserBilling>(billing);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = JSON.stringify(data) !== JSON.stringify(billing);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await onUpdateBilling(data);
    setIsSaving(false);
    if (ok) {
      metaEvents.addPaymentInfo({
        content_category: data.payout_method,
        status: true,
      });
      showToast("success", "Payout details saved successfully!");
    } else {
      showToast("error", "Failed to update payout details.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-poppins">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Earnings &amp; Payout Wallet</h2>
        <p className="text-xs text-slate-500 mt-1">
          Track your verified affiliate reward credits, cashback balances, and configure fast UPI or direct bank withdrawal methods.
        </p>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15">
            <BanknotesIcon className="w-32 h-32 text-slate-950" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950/70 block">
            Available for Withdrawal
          </span>
          <div className="text-3xl font-black mt-2 tracking-tight">
            ₹{data.wallet_balance.toLocaleString("en-IN")}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast("info", "Withdrawal request submitted! Processed in 24 hours.")}
              disabled={data.wallet_balance <= 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-95"
            >
              <span>Withdraw to UPI</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-amber-950 font-medium">Min: ₹100</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Pending Affiliate Cashback
          </span>
          <div className="text-3xl font-black text-slate-800 mt-2 tracking-tight">
            ₹{data.pending_cashback.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            Credits verify within 30 days after Amazon return window closes. Automatically moved to available balance.
          </p>
        </div>
      </div>

      {/* Payout Details Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <CreditCardIcon className="w-4 h-4 text-amber-500" />
          Configure Payout Method
        </h3>

        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payout Method</label>
            <div className="grid grid-cols-3 gap-3">
              {(["UPI", "Bank", "Amazon Gift Card"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setData({ ...data, payout_method: method })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
                    data.payout_method === method
                      ? "border-amber-400 bg-amber-50 text-slate-950 ring-2 ring-amber-400/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {data.payout_method === "UPI" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                UPI ID (VPA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.upi_id}
                onChange={(e) => setData({ ...data, upi_id: e.target.value })}
                placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
              />
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" /> Instant zero-fee payout to Google Pay, PhonePe, or Paytm.
              </p>
            </div>
          )}

          {data.payout_method === "Bank" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bank Account Number</label>
                <input
                  type="text"
                  value={data.account_number || ""}
                  onChange={(e) => setData({ ...data, account_number: e.target.value })}
                  placeholder="Enter account number"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">IFSC Code</label>
                <input
                  type="text"
                  value={data.ifsc_code || ""}
                  onChange={(e) => setData({ ...data, ifsc_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-md ${
              !isDirty || isSaving
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10 active:scale-95"
            }`}
          >
            {isSaving ? "Saving..." : "Save Payout Settings"}
          </button>
        </form>
      </div>

      {/* Payout History */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Recent Payout History</h3>
        <div className="text-center py-6 text-slate-400 text-xs">
          <CheckCircleIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-600">No previous withdrawal requests yet.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">When you cash out your rewards, records will appear here.</p>
        </div>
      </div>
    </div>
  );
}
