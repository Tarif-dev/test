"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../lib/api";
import { WalletInfo } from "../types";
import { TokenPortfolio } from "./TokenPortfolio";
import AddressQRCode from "./AddressQRCode";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      setLoading(true);
      const walletData = await apiService.getUserWallet();
      setWallet(walletData);
    } catch (error) {
      console.error("Error loading wallet:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Modern toast would be better here, but using alert for now
      alert(`${label} copied to clipboard!`);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Dashboard
          </h3>
          <p className="text-gray-500">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center p-8">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Connection Error
          </h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
          <button onClick={loadWalletInfo} className="btn-primary w-full">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20">
      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-lg shadow-black/5">
            <div className="px-6 py-4 flex justify-between items-center">
              {/* Minimal Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-lg font-bold text-gray-900">TipLink</span>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <span className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-xl">
                  Dashboard
                </span>
                <Link
                  href="/swap"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  Swap
                </Link>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50/50 rounded-xl">
                  {user?.avatar && (
                    <img
                      className="w-7 h-7 rounded-full"
                      src={user.avatar}
                      alt={user.name || "User avatar"}
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-left mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome, {user?.name?.split(" ")[0] || "User"}
            </h1>
          </div>

          {/* Main Dashboard Grid */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Portfolio Section - Left Side */}
              <div className="order-2 lg:order-1">
                <TokenPortfolio />
              </div>

              {/* QR Code Section - Right Side */}
              <div className="order-1 lg:order-2">
                <div className="sticky top-32">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Receive Payments
                    </h2>
                    <p className="text-gray-600">
                      Share your QR code to receive payments
                    </p>
                  </div>
                  <AddressQRCode className="shadow-2xl shadow-black/10" />
                </div>
              </div>
            </div>
          </div>

          {/* Light Footer */}
          <div className="max-w-4xl mx-auto mt-24">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-8 shadow-xl shadow-black/5">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-md transform rotate-45"></div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    TipLink
                  </span>
                </div>

                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Secure, fast, and simple crypto transactions for everyone
                </p>

                <div className="flex items-center justify-center space-x-8 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700">Wallet Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Multi-Chain</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Encrypted</span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                  <span>© 2025 TipLink</span>
                  <span>•</span>
                  <span>Built with ❤️</span>
                  <span>•</span>
                  <span>Powered by Web3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
