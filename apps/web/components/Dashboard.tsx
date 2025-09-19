'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, WalletInfo } from '../lib/api';
import { ethers } from 'ethers';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      setLoading(true);
      const walletData = await apiService.getUserWallet();
      setWallet(walletData);
      
      // Get ETH balance (this would typically use a provider)
      // For demo purposes, we'll show 0 ETH
      setBalance('0.0');
    } catch (error) {
      console.error('Error loading wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={loadWalletInfo}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">TipLink Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* User Info */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                User Profile
              </h3>
              <div className="flex items-center">
                {user?.avatar && (
                  <img
                    className="h-12 w-12 rounded-full mr-4"
                    src={user.avatar}
                    alt={user.name || 'User avatar'}
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'Anonymous User'}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Ethereum Wallet
              </h3>
              
              <div className="space-y-4">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={wallet?.address || ''}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(wallet?.address || '', 'Address')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Balance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ETH Balance
                  </label>
                  <div className="p-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-lg font-bold text-gray-900">{balance} ETH</span>
                  </div>
                </div>

                {/* Private Key (Warning: This should be handled more securely in production) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Private Key
                    <span className="text-red-500 text-xs ml-2">
                      (Keep this secret and secure!)
                    </span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="password"
                      value={wallet?.privateKey || ''}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(wallet?.privateKey || '', 'Private Key')}
                      className="px-3 py-2 bg-yellow-600 text-white rounded-r-lg hover:bg-yellow-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Create TipLink
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  View History
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Send ETH
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}