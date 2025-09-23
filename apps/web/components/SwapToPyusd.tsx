"use client";

import { useState, useEffect } from "react";

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

interface SwapQuote {
  srcAmount: string;
  dstAmount: string;
  estimatedGas: string;
  protocols: any[];
}

export function SwapToPyusd() {
  const [tokens, setTokens] = useState<Record<string, Token>>({});
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(1);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  };

  // Create authenticated request headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Load supported tokens on mount
  useEffect(() => {
    loadSupportedTokens();
  }, []);

  const loadSupportedTokens = async () => {
    try {
      const response = await fetch("http://localhost:3001/swap/tokens");
      const data = await response.json();

      if (data.success) {
        setTokens(data.tokens);
        // Default to ETH
        if (data.tokens.ETH) {
          setSelectedToken(data.tokens.ETH.address);
        }
      }
    } catch (err) {
      console.error("Failed to load tokens:", err);
      setError("Failed to load supported tokens");
    }
  };

  const getQuote = async () => {
    if (!selectedToken || !amount || parseFloat(amount) <= 0) {
      setError("Please select a token and enter a valid amount");
      return;
    }

    setIsQuoting(true);
    setError("");
    setQuote(null);

    try {
      const selectedTokenInfo = Object.values(tokens).find(
        (t) => t.address === selectedToken
      );
      if (!selectedTokenInfo) {
        throw new Error("Invalid token selected");
      }

      // Convert amount to smallest units based on decimals
      const amountInSmallestUnits = (
        parseFloat(amount) * Math.pow(10, selectedTokenInfo.decimals)
      ).toString();

      const response = await fetch("http://localhost:3001/swap/quote", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          srcToken: selectedToken,
          amount: amountInSmallestUnits,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQuote(data.quote);
      } else {
        throw new Error(data.error || "Failed to get quote");
      }
    } catch (err) {
      console.error("Quote error:", err);
      setError((err as Error).message);
    } finally {
      setIsQuoting(false);
    }
  };

  const executeSwap = async () => {
    if (!quote || !selectedToken || !amount) {
      setError("Please get a quote first");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setTxHash("");

    try {
      const selectedTokenInfo = Object.values(tokens).find(
        (t) => t.address === selectedToken
      );
      if (!selectedTokenInfo) {
        throw new Error("Invalid token selected");
      }

      const amountInSmallestUnits = (
        parseFloat(amount) * Math.pow(10, selectedTokenInfo.decimals)
      ).toString();

      const response = await fetch("http://localhost:3001/swap/execute", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          srcToken: selectedToken,
          amount: amountInSmallestUnits,
          slippage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Swap executed successfully!");
        setTxHash(data.swapTxHash);
        // Reset form
        setAmount("");
        setQuote(null);
      } else {
        throw new Error(data.error || "Failed to execute swap");
      }
    } catch (err) {
      console.error("Swap error:", err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amountStr: string, decimals: number) => {
    const amount = parseFloat(amountStr) / Math.pow(10, decimals);
    return amount.toFixed(6);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Convert to PYUSD
            </h2>
            <p className="text-sm text-gray-600">
              Swap your Ethereum assets to PYUSD for easy PayPal off-ramping
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Token Selection */}
        <div className="space-y-2">
          <label
            htmlFor="token"
            className="block text-sm font-medium text-gray-700"
          >
            From Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select token to swap</option>
            {Object.values(tokens).map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.000001"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Slippage */}
        <div className="space-y-2">
          <label
            htmlFor="slippage"
            className="block text-sm font-medium text-gray-700"
          >
            Slippage Tolerance (%)
          </label>
          <select
            value={slippage.toString()}
            onChange={(e) => setSlippage(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1">1%</option>
            <option value="2">2%</option>
            <option value="3">3%</option>
            <option value="5">5%</option>
          </select>
        </div>

        {/* Quote Button */}
        <button
          onClick={getQuote}
          disabled={isQuoting || !selectedToken || !amount}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isQuoting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Getting Quote...
            </span>
          ) : (
            "Get Quote"
          )}
        </button>

        {/* Quote Display */}
        {quote && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">You pay:</span>
              <span className="font-medium">
                {amount}{" "}
                {
                  Object.values(tokens).find((t) => t.address === selectedToken)
                    ?.symbol
                }
              </span>
            </div>
            <div className="flex justify-center">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">You receive:</span>
              <span className="font-medium text-green-600">
                {formatAmount(quote.dstAmount, 6)} PYUSD
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Estimated gas:</span>
              <span>{parseInt(quote.estimatedGas).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Execute Swap Button */}
        {quote && (
          <button
            onClick={executeSwap}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Executing Swap...
              </span>
            ) : (
              "Execute Swap"
            )}
          </button>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
                {txHash && (
                  <div className="mt-2">
                    <a
                      href={`https://etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View on Etherscan →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-2">Why PYUSD?</p>
          <ul className="space-y-1">
            <li>• Stable value (USD-pegged)</li>
            <li>• Easy PayPal off-ramping</li>
            <li>• Lower volatility risk</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
