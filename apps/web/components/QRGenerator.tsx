"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRGeneratorProps {
  onClose: () => void;
}

export default function QRGenerator({ onClose }: QRGeneratorProps) {
  const [qrDataURL, setQrDataURL] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const testData = {
    name: "John Doe",
    ethAddress: "0x742d35Cc6638C0532C21a0D1dBD8A8b73e7CC4c5",
    solAddress: "GJPWbnjeUR7yo61yMRLLGH7UPRTHZQEFPkFGbgn44eKQ",
  };

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, JSON.stringify(testData), {
            width: 256,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });

          // Also create data URL for download
          const dataURL = await QRCode.toDataURL(JSON.stringify(testData));
          setQrDataURL(dataURL);
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, []);

  const regenerateQRCode = async () => {
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, JSON.stringify(testData), {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        // Also create data URL for download
        const dataURL = await QRCode.toDataURL(JSON.stringify(testData));
        setQrDataURL(dataURL);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.download = "test-payment-qr.png";
    link.href = qrDataURL;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 fade-in">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Test QR Code</h2>
              <p className="text-sm text-gray-600">
                Use this to test the scanner
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 text-center">
          <canvas
            ref={canvasRef}
            className="mx-auto mb-4 border border-gray-200 rounded-xl"
          />

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">QR Code Data:</h3>
            <pre className="text-xs text-gray-600 text-left overflow-auto">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>

          <button onClick={downloadQR} className="btn-secondary w-full mb-3">
            Download QR Code
          </button>

          <p className="text-xs text-gray-500">
            You can scan this QR code or download and upload it to test the
            payment flow
          </p>
        </div>
      </div>
    </div>
  );
}
