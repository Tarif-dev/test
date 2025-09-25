"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { QRUploadSend } from "../../components/QRUploadSend";

export default function SendPage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20">
      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-lg shadow-black/5">
            <div className="px-6 py-4 flex justify-between items-center">
              {/* Minimal Logo */}
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    Pokket
                  </span>
                </Link>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  Dashboard
                </Link>
                <span className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl">
                  Send
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
      <main className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Send Crypto
            </h1>

            {/* Safety Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">
                    Send securely with QR codes
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    Always verify recipient addresses before sending.
                    Transactions are irreversible.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Send Interface */}
          <div className="max-w-2xl mx-auto">
            <QRUploadSend />
          </div>
        </div>
      </main>
    </div>
  );
}
