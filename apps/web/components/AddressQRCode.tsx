"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { apiService } from "../lib/api";
import { AddressInfo } from "../types";

type NetworkType = "ethereum" | "solana";

interface AddressQRCodeProps {
  className?: string;
}

export default function AddressQRCode({ className = "" }: AddressQRCodeProps) {
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const [selectedNetwork, setSelectedNetwork] =
    useState<NetworkType>("ethereum");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const addresses = await apiService.getUserAddresses();
      setAddressInfo(addresses);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentAddress = () => {
    if (!addressInfo) return "";

    if (selectedNetwork === "ethereum") {
      return addressInfo.ethereum.address;
    } else {
      return addressInfo.solana?.address || "";
    }
  };

  const getCurrentNetworkLabel = () => {
    if (!addressInfo) return "";

    if (selectedNetwork === "ethereum") {
      return `${addressInfo.ethereum.network.toUpperCase()} Network`;
    } else {
      return `${addressInfo.solana?.network.toUpperCase() || "DEVNET"} Network`;
    }
  };

  const getQRValue = () => {
    const address = getCurrentAddress();
    if (!address) return "";

    // Format QR code value for wallets
    if (selectedNetwork === "ethereum") {
      return `ethereum:${address}`;
    } else {
      return address; // Solana addresses don't need prefix
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-32"></div>
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !addressInfo) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>Error loading QR code</p>
          <button
            onClick={fetchAddresses}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Receive Payments
          </h3>
          <p className="text-sm text-gray-600">
            Choose sender's network and share this QR code to receive payments
          </p>
        </div>

        {/* Network Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sender's Network
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedNetwork("ethereum")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedNetwork === "ethereum"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ethereum
            </button>
            {addressInfo.solana && (
              <button
                onClick={() => setSelectedNetwork("solana")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedNetwork === "solana"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Solana
              </button>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border">
            <QRCode
              value={getQRValue()}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
        </div>

        {/* Address Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {getCurrentNetworkLabel()}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(getCurrentAddress())}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <code className="text-xs text-gray-800 break-all">
              {getCurrentAddress()}
            </code>
          </div>
        </div>

        {selectedNetwork === "solana" && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              <span className="font-medium">Auto-conversion:</span> SOL payments
              will be automatically converted to ETH in your wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
