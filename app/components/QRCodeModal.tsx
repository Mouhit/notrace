// app/components/QRCodeModal.tsx
// QR Code display and download modal - By Engage Ad

'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  secretLink: string;
  secretId: string;
}

export default function QRCodeModal({ isOpen, onClose, secretLink, secretId }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && !qrCode) {
      generateQRCode();
    }
  }, [isOpen, qrCode]);

  const generateQRCode = async () => {
    setLoading(true);
    setError('');
    try {
      const qrDataUrl = await QRCode.toDataURL(secretLink, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrCode(qrDataUrl);
    } catch (err) {
      console.error('QR generation failed:', err);
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCode) return;

    try {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `notrace-secret-${secretId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download QR code');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-dark dark:text-light">
              🔲 Secret QR Code
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* QR Code Display */}
          <div className="bg-light dark:bg-gray-900 rounded-lg p-6 flex justify-center mb-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Generating QR code...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : qrCode ? (
              <img
                src={qrCode}
                alt="Secret QR Code"
                className="rounded-lg border-2 border-primary"
                width={300}
                height={300}
              />
            ) : null}
          </div>

          {/* Info */}
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            Scan with your phone camera or download to share
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadQR}
              disabled={!qrCode || loading}
              className="flex-1 bg-primary text-dark font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📥 Download QR
            </button>
            <button
              onClick={onClose}
              className="flex-1 border-2 border-primary text-primary font-semibold py-2 rounded-lg hover:bg-primary hover:text-dark transition"
            >
              Close
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              💡 <strong>Tip:</strong> Share the QR code instead of the link for extra security. The recipient must scan to see the encryption key.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
