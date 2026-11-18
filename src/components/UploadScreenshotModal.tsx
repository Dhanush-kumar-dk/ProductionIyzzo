import React, { useState, useRef } from "react";
import {
  XMarkIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  PhotoIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { useScreenshotUpload, R2UploadResult } from "../utils/r2Storage";
import { metaEvents } from "../utils/tracking";

interface UploadScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: "order_proof" | "support" | "feedback";
  orderId?: string;
  onUploadSuccess?: (result: R2UploadResult) => void;
}

export default function UploadScreenshotModal({
  isOpen,
  onClose,
  defaultCategory = "order_proof",
  orderId: initialOrderId = "",
  onUploadSuccess,
}: UploadScreenshotModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(defaultCategory);
  const [orderId, setOrderId] = useState<string>(initialOrderId);
  const [notes, setNotes] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { upload, isUploading, error, result, reset } = useScreenshotUpload();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Screenshot must be under 10MB.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const res = await upload(selectedFile, {
        category,
        orderId,
        filename: selectedFile.name,
      });

      if (category === "order_proof") {
        metaEvents.submitApplication({
          content_name: "Cashback Order Verification",
          order_id: orderId || undefined,
        });
        metaEvents.purchase(0.0, "INR", {
          content_name: "Order Proof Submission",
          order_id: orderId || undefined,
        });
      } else {
        metaEvents.contact({
          method: "screenshot_upload",
          category,
        });
      }

      if (onUploadSuccess) {
        onUploadSuccess(res);
      }
    } catch {
      // Error handled by hook
    }
  };

  const handleModalClose = () => {
    reset();
    setSelectedFile(null);
    setPreviewSrc(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-poppins">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <CloudArrowUpIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Upload Verification Screenshot
              </h3>
              <p className="text-[11px] text-slate-500">
                Encrypted & stored in Cloudflare R2 bucket: yearnit-storage/Screenshot/
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {result?.success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Screenshot Uploaded Successfully!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your verification image has been stored securely in private
                  Cloudflare R2 storage.
                </p>
              </div>

              {/* Bucket details badge */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-left space-y-1.5 text-xs text-slate-600 font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-sans">Storage Target:</span>
                  <span className="font-semibold text-slate-800">yearnit-storage/Screenshot/</span>
                </div>
                <div className="flex justify-between items-center text-[11px] truncate">
                  <span className="text-slate-400 font-sans">Object Key:</span>
                  <span className="truncate max-w-[220px] text-slate-700" title={result.key}>
                    {result.key}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Screenshot Purpose
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "order_proof", label: "Order Proof" },
                    { id: "support", label: "Help & Issue" },
                    { id: "feedback", label: "Feedback" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                        category === cat.id
                          ? "bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Order ID */}
              {category === "order_proof" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 402-1234567-8901234"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
              )}

              {/* Drag & Drop File Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Screenshot
                </label>

                {previewSrc ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                    <img
                      src={previewSrc}
                      alt="Preview"
                      className="w-full h-44 object-contain bg-slate-950/80"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold shadow hover:bg-slate-100"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewSrc(null);
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200/70 text-slate-500 flex items-center justify-center">
                      <PhotoIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to browse or drag & drop screenshot
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PNG, JPG, WebP up to 10MB
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any details regarding this screenshot..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Error banner */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                  {error}
                </div>
              )}

              {/* Privacy badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>
                  Your screenshot is kept strictly private and accessed only for verification.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isUploading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Uploading to R2...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4" />
                      <span>Upload Screenshot</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
