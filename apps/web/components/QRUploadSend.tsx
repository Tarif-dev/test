"use client";

import React, { useState, useRef, useCallback } from "react";

interface QRUploadSendProps {
  className?: string;
}

interface ParsedQRData {
  type: "address" | "payment_request" | "unknown";
  address: string;
  amount?: string;
  network?: string;
  label?: string;
}

export function QRUploadSend({ className = "" }: QRUploadSendProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState<ParsedQRData | null>(null);
  const [error, setError] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse QR code data
  const parseQRData = (data: string): ParsedQRData => {
    try {
      // Handle Ethereum URI format: ethereum:0x123...?value=1000000000000000000
      if (data.startsWith("ethereum:")) {
        const urlParts = data.replace("ethereum:", "").split("?");
        const address = urlParts[0];
        const params = new URLSearchParams(urlParts[1] || "");

        return {
          type: "payment_request",
          address: urlParts[0] || "",
          amount: params.get("value")
            ? (parseInt(params.get("value")!) / 1e18).toString()
            : undefined,
          network: "ethereum",
          label: params.get("label") || undefined,
        };
      }

      // Handle Bitcoin URI format
      if (data.startsWith("bitcoin:")) {
        const urlParts = data.replace("bitcoin:", "").split("?");
        const address = urlParts[0];
        const params = new URLSearchParams(urlParts[1] || "");

        return {
          type: "payment_request",
          address: urlParts[0] || "",
          amount: params.get("amount") || undefined,
          network: "bitcoin",
          label: params.get("label") || undefined,
        };
      }

      // Handle plain addresses
      if (data.match(/^0x[a-fA-F0-9]{40}$/)) {
        return {
          type: "address",
          address: data,
          network: "ethereum",
        };
      }

      if (data.match(/^[1-9A-HJ-NP-Za-km-z]{25,62}$/)) {
        return {
          type: "address",
          address: data,
          network: "solana",
        };
      }

      return {
        type: "unknown",
        address: data,
      };
    } catch (error) {
      return {
        type: "unknown",
        address: data,
      };
    }
  };

  const handleQRResult = useCallback((result: any, error: any) => {
    if (result) {
      const parsedData = parseQRData(result?.text || "");
      setQrData(parsedData);
      setIsScanning(false);
      setError("");
    }

    if (error) {
      console.error("QR scan error:", error);
    }
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      setIsProcessing(true);

      // Create image element to read QR from uploaded image
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        try {
          // Use a QR code library to read from canvas
          // For now, we'll simulate this with a timeout
          setTimeout(() => {
            // This would be replaced with actual QR reading from image
            setError(
              "Please use camera scan or paste address manually for now"
            );
            setIsProcessing(false);
          }, 1000);
        } catch (error) {
          setError("Could not read QR code from image");
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setError("Invalid image file");
        setIsProcessing(false);
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      setError("Failed to process image");
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!qrData || !sendAmount) return;

    try {
      setIsProcessing(true);
      setError("");

      // Simulate API call for sending
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        `Successfully sent ${sendAmount} to ${qrData.address.slice(0, 6)}...${qrData.address.slice(-4)}`
      );

      // Reset form
      setQrData(null);
      setSendAmount("");
      setIsProcessing(false);
    } catch (error) {
      setError("Failed to send transaction");
      setIsProcessing(false);
    }
  };

  const resetScan = () => {
    setQrData(null);
    setError("");
    setSendAmount("");
    setIsScanning(false);
  };

  return (
    <div
      className={`bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-xl shadow-black/5 ${className}`}
    >
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Send via QR</h3>
          <p className="text-gray-600">
            Scan or upload QR codes to send payments instantly
          </p>
        </div>

        {!isScanning && !qrData && (
          <div className="space-y-4">
            {/* Scan Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setIsScanning(true)}
                className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Camera Scan
                </h4>
                <p className="text-sm text-gray-600 text-center">
                  Use camera to scan QR codes
                </p>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl hover:border-green-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Upload Image
                </h4>
                <p className="text-sm text-gray-600 text-center">
                  Upload QR code image
                </p>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {isProcessing && (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mr-3"></div>
                <span className="text-gray-600">Processing image...</span>
              </div>
            )}
          </div>
        )}

        {isScanning && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl p-8 text-center">
              <div className="w-24 h-24 border-4 border-dashed border-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">
                Camera Access Required
              </h4>
              <p className="text-gray-300 text-sm mb-4">
                Allow camera access to scan QR codes
              </p>

              {/* Manual Address Input */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                  Or paste address manually:
                </label>
                <input
                  type="text"
                  placeholder="Enter recipient address..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      const parsedData = parseQRData(e.target.value.trim());
                      setQrData(parsedData);
                      setIsScanning(false);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setIsScanning(false)}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {qrData && (
          <div className="space-y-6">
            {/* QR Data Display */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Payment Details
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Recipient:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {qrData.address.slice(0, 8)}...{qrData.address.slice(-6)}
                  </span>
                </div>

                {qrData.network && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Network:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {qrData.network}
                    </span>
                  </div>
                )}

                {qrData.amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Requested Amount:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {qrData.amount} ETH
                    </span>
                  </div>
                )}

                {qrData.label && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Label:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {qrData.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Send
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder={qrData.amount || "0.00"}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-sm text-gray-500">
                    {qrData.network?.toUpperCase() || "ETH"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={resetScan}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleSend}
                disabled={!sendAmount || isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span>Send Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
