"use client";

import React from "react";
import QRPaymentFlow from "../../components/QRPaymentFlow";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";

export default function SendPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/20">
      {/* Header */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-lg shadow-black/5">
            <div className="px-6 py-4 flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-lg font-bold text-gray-900">Pokket</span>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  Dashboard
                </Link>
                <span className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-xl">
                  Send
                </span>
                <Link
                  href="/swap"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  Swap
                </Link>
              </div>

              {/* User */}
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Send Payment
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Scan or upload a QR code to send payment to anyone
            </p>
          </div>

          <QRPaymentFlow />
        </div>
      </main>
    </div>
  );
}
