"use client";

import React, { useEffect, useState } from "react";
import { apiService } from "../lib/api";
import { PortfolioSummary, TokenInfo } from "../types";

interface TokenPortfolioProps {
  className?: string;
}

export function TokenPortfolio({ className = "" }: TokenPortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError("");
      const portfolioData = await apiService.getUserPortfolio();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error("Error loading portfolio:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load portfolio"
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshPortfolio = async () => {
    try {
      setRefreshing(true);
      setError("");
      const portfolioData = await apiService.getUserPortfolio();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error("Error refreshing portfolio:", error);
      setError(
        error instanceof Error ? error.message : "Failed to refresh portfolio"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const formatUSD = (value: number | undefined) => {
    if (value === undefined || value === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (balance: string, decimals: number = 18) => {
    const num = parseFloat(balance);
    if (num === 0) return "0";
    if (num < 0.000001) return "< 0.000001";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert(`${label} copied to clipboard!`);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={loadPortfolio}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Sepolia Testnet
            </span>
          </div>
          <button
            onClick={refreshPortfolio}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">
            Total Portfolio Value (Testnet)
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {formatUSD(portfolio?.totalValueUSD)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            * Mock prices for demo purposes
          </p>
        </div>
      </div>

      {/* ETH Balance */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ETH</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Ethereum</p>
              <p className="text-sm text-gray-500">ETH</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {formatBalance(portfolio?.ethBalanceFormatted || "0")} ETH
            </p>
            <p className="text-sm text-gray-500">
              {formatUSD(portfolio?.ethValueUSD)}
            </p>
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="px-6 py-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          ERC-20 Tokens
        </h4>

        {portfolio?.tokens && portfolio.tokens.length > 0 ? (
          <div className="space-y-3">
            {portfolio.tokens.map((token: TokenInfo) => (
              <div
                key={token.address}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {token.logoURI ? (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-bold">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{token.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500">{token.symbol}</p>
                      <button
                        onClick={() =>
                          copyToClipboard(token.address, "Contract address")
                        }
                        className="text-xs text-blue-600 hover:text-blue-800"
                        title="Copy contract address"
                      >
                        Copy Address
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatBalance(token.balanceFormatted)} {token.symbol}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatUSD(token.valueUSD)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No tokens found</p>
            <p className="text-gray-400 text-xs mt-1">
              Send some tokens to your wallet to see them here
            </p>
          </div>
        )}
      </div>

      {/* Portfolio Actions */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Receive
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
