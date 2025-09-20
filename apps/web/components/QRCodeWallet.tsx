"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { apiService } from "../lib/api";
import { AddressInfo } from "../types";

type NetworkType = "ethereum" | "solana";

interface QRCodeWalletProps {
  className?: string;
}

const QRCodeWallet: React.FC<QRCodeWalletProps> = ({ className = "" }) => {
  const [addresses, setAddresses] = useState<AddressInfo | null>(null);
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
      const addressData = await apiService.getUserAddresses();
      setAddresses(addressData);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setError("Failed to load wallet addresses");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentAddress = () => {
    if (!addresses) return "";

    if (selectedNetwork === "ethereum") {
      return addresses.ethereum.address;
    } else if (selectedNetwork === "solana" && addresses.solana) {
      return addresses.solana.address;
    }

    return "";
  };

  const getCurrentNetwork = () => {
    if (!addresses) return "";

    if (selectedNetwork === "ethereum") {
      return addresses.ethereum.network;
    } else if (selectedNetwork === "solana" && addresses.solana) {
      return addresses.solana.network;
    }

    return "";
  };

  const copyToClipboard = async () => {
    const address = getCurrentAddress();
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        // You could add a toast notification here
        alert("Address copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy address:", error);
        alert("Failed to copy address");
      }
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAddresses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!addresses) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          No wallet addresses found
        </div>
      </div>
    );
  }

  const currentAddress = getCurrentAddress();
  const currentNetwork = getCurrentNetwork();

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Wallet QR Code
        </h2>
        <p className="text-sm text-gray-600">
          Share your wallet address to receive payments
        </p>
      </div>

      {/* Network Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Network
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedNetwork("ethereum")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedNetwork === "ethereum"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ethereum
            <span className="block text-xs opacity-75">
              {addresses.ethereum.network}
            </span>
          </button>

          {addresses.solana && (
            <button
              onClick={() => setSelectedNetwork("solana")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedNetwork === "solana"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Solana
              <span className="block text-xs opacity-75">
                {addresses.solana.network}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* QR Code */}
      {currentAddress && (
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-100 flex justify-center">
            <QRCode
              value={currentAddress}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
        </div>
      )}

      {/* Address Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {selectedNetwork === "ethereum" ? "Ethereum" : "Solana"} Address
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-mono text-gray-900 break-all">
              {currentAddress}
            </p>
          </div>
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            title="Copy address"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Network Info */}
      <div className="text-xs text-gray-500 text-center">
        Network: {currentNetwork}
        {selectedNetwork === "ethereum" && addresses.ethereum.chainId && (
          <span> • Chain ID: {addresses.ethereum.chainId}</span>
        )}
      </div>
    </div>
  );
};

export default QRCodeWallet;
