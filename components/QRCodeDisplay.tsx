"use client";
import { useState } from "react";
import { Download, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export default function QRCodeDisplay({ url, size = 160 }: QRCodeDisplayProps) {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  // encodeURIComponent fully encodes the URL including the # fragment
  // This is critical — the # contains the AES decryption key
  // Without full encoding the QR API truncates the URL at the # symbol
  const safeUrl = encodeURIComponent(url);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safeUrl}&bgcolor=12151c&color=00e5a0&qzone=2&format=png`;

  const getBlob = async (): Promise<Blob | null> => {
    try {
      const res = await fetch(qrUrl);
      if (!res.ok) return null;
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
      await handleDownload();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600 uppercase tracking-widest">QR Code</p>

      <div className="inline-block p-3 rounded-xl bg-surface-card border border-surface-border">
        {/* Loading spinner */}
        {loading && !imgError && (
          <div
            className="flex items-center justify-center rounded-lg bg-surface"
            style={{ width: size, height: size }}
          >
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
          </div>
        )}

        {/* QR image */}
        {!imgError && (
          <img
            src={qrUrl}
            alt="QR Code"
            width={size}
            height={size}
            className={`rounded-lg ${loading ? "hidden" : "block"}`}
            onLoad={() => setLoading(false)}
            onError={() => { setImgError(true); setLoading(false); }}
          />
        )}

        {/* Error state */}
        {imgError && (
          <div
            className="flex flex-col items-center justify-center rounded-lg bg-surface gap-2"
            style={{ width: size, height: size }}
          >
            <p className="text-xs text-slate-500 text-center px-2">QR generation failed</p>
            <button
              onClick={() => { setImgError(false); setLoading(true); }}
              className="text-xs text-brand hover:underline"
            >
              Retry
            </button>
          </div>
        )}
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
