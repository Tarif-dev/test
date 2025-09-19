"use client";

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { Dashboard } from "../components/Dashboard";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to TipLink
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Create and manage Ethereum wallets. Send crypto via shareable links.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Get Started
            </h2>
            <p className="text-gray-600">
              Sign in with Google to create your Ethereum wallet
            </p>
          </div>

          <GoogleSignInButton
            onError={(error) => {
              console.error("Sign in error:", error);
              alert(`Sign in failed: ${error}`);
            }}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-blue-600 text-2xl mb-2">🔐</div>
              <h3 className="font-semibold text-gray-900">Secure Wallet</h3>
              <p className="text-sm text-gray-600">
                Your private keys are encrypted and stored securely
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-green-600 text-2xl mb-2">🔗</div>
              <h3 className="font-semibold text-gray-900">Easy Sharing</h3>
              <p className="text-sm text-gray-600">
                Send crypto via shareable links to anyone
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-purple-600 text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900">Fast Setup</h3>
              <p className="text-sm text-gray-600">
                Get started in seconds with Google authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
