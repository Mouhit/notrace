"use client";
import { useRef } from "react";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export default function QRCodeDisplay({ url, size = 160 }: QRCodeDisplayProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=12151c&color=00e5a0&qzone=2`;

  const getBlob = async (): Promise<Blob | null> => {
    try {
      const res = await fetch(qrUrl);
      return await res.blob();
    } catch { return null; }
  };

  const handleDownload = async () => {
    const blob = await getBlob();
    if (!blob) { toast.error("Failed to download QR"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "notrace-qr.png";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("QR code downloaded!");
  };

  const handleCopy = async () => {
    const blob = await getBlob();
    if (!blob) { toast.error("Failed to copy QR"); return; }
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("QR code copied to clipboard!");
    } catch {
      toast.error("Copy not supported on this browser");
    }
  };

  const handleShare = async () => {
    const blob = await getBlob();
    if (!blob) { toast.error("Failed to share QR"); return; }
    const file = new File([blob], "notrace-qr.png", { type: "image/png" });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "NoTrace Secret Link", text: url });
    } else {
      // Fallback — download
      await handleDownload();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600 uppercase tracking-widest">QR Code</p>

      {/* Always visible QR */}
      <div className="inline-block p-3 rounded-xl bg-surface-card border border-surface-border">
        <img
          ref={imgRef}
          src={qrUrl}
          alt="QR Code"
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-border bg-brand-muted text-xs text-brand hover:bg-brand/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Download PNG
        </button>
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border text-xs text-slate-300 hover:border-brand-border hover:text-brand transition-all"
        >
          <Download className="w-3.5 h-3.5 rotate-180" /> Copy Image
        </button>
        <button onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border text-xs text-slate-300 hover:border-brand-border hover:text-brand transition-all"
        >
          <Share2 className="w-3.5 h-3.5" /> Share QR
        </button>
      </div>
    </div>
  );
}
