"use client";
import { useState, useEffect, useRef } from "react";
import { Download, QrCode } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export default function QRCodeDisplay({ url, size = 160 }: QRCodeDisplayProps) {
  const [show, setShow] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=12151c&color=00e5a0&qzone=2`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "notrace-qr.png";
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("QR code downloaded");
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-border text-xs text-slate-300 hover:border-brand-border hover:text-brand transition-all duration-150"
      >
        <QrCode className="w-3.5 h-3.5" />
        {show ? "Hide QR" : "Show QR"}
      </button>

      {show && (
        <div className="flex flex-col items-start gap-2">
          <div className="p-3 rounded-xl bg-surface-card border border-surface-border">
            <img
              ref={imgRef}
              src={qrUrl}
              alt="QR Code"
              width={size}
              height={size}
              className="rounded-lg"
            />
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-border bg-brand-muted text-xs text-brand hover:bg-brand/20 transition-all duration-150"
          >
            <Download className="w-3.5 h-3.5" />
            Download QR
          </button>
        </div>
      )}
    </div>
  );
}
