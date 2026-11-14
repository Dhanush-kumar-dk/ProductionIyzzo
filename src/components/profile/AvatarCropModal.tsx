import React, { useState, useRef, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, CheckIcon } from "@heroicons/react/24/solid";

interface AvatarCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export default function AvatarCropModal({ imageSrc, onCropComplete, onClose }: AvatarCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      draw();
    };
  }, [imageSrc]);

  useEffect(() => {
    draw();
  }, [zoom, pan]);

  const draw = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Save context for circular clipping
    ctx.save();

    // Scale calculation
    const aspect = img.width / img.height;
    let baseW = size;
    let baseH = size;
    if (aspect > 1) {
      baseW = size * aspect;
    } else {
      baseH = size / aspect;
    }

    const drawW = baseW * zoom;
    const drawH = baseH * zoom;
    const drawX = (size - drawW) / 2 + pan.x;
    const drawY = (size - drawH) / 2 + pan.y;

    // Draw Image
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Dark overlay outside circle
    ctx.fillStyle = "rgba(11, 19, 43, 0.55)";
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2, true);
    ctx.fill();

    // Circle border
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    // Render final 300x300 circular icon onto a clean export canvas
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 320;
    exportCanvas.height = 320;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    const size = exportCanvas.width;
    const scale = size / canvas.width;

    const aspect = img.width / img.height;
    let baseW = size;
    let baseH = size;
    if (aspect > 1) {
      baseW = size * aspect;
    } else {
      baseH = size / aspect;
    }

    const drawW = baseW * zoom;
    const drawH = baseH * zoom;
    const drawX = (size - drawW) / 2 + pan.x * scale;
    const drawY = (size - drawH) / 2 + pan.y * scale;

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    const dataUrl = exportCanvas.toDataURL("image/jpeg", 0.92);
    onCropComplete(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 font-poppins">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Crop & Position Avatar</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-6 flex flex-col items-center bg-slate-50">
          <div
            className="relative cursor-move rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-900 select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} width={280} height={280} className="block" />
          </div>
          <span className="text-[11px] text-slate-400 mt-3 font-medium">
            Drag image to position • Adjust zoom below
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center gap-3">
          <MagnifyingGlassMinusIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <MagnifyingGlassPlusIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition"
          >
            <CheckIcon className="w-4 h-4" />
            Apply Avatar
          </button>
        </div>
      </div>
    </div>
  );
}
