/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Wallet as WalletIcon,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import walletService, {
  IUiTransaction,
  Wallet,
} from "../services/walletService";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const WalletPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredTransaction, setHoveredTransaction] = useState<string | null>(
    null
  );

  const {
    data: walletData,
    isLoading: isLoadingWallet,
    error: errorWallet,
    refetch: refetchWallet,
  } = useQuery<Wallet>({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      const response = await walletService.getUserWallet(user?.id ?? "");
      return response.data;
    },
    enabled: !!user?.id && isAuthenticated,
  });

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: errorTransactions,
    refetch: refetchTransactions,
  } = useQuery<IUiTransaction[]>({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const result = await walletService.getWalletHistory();
      // Handle both direct array or response object
      if (Array.isArray(result)) {
        return result;
      } else if (result && typeof result === "object" && "data" in result) {
        // @ts-expect-error: result may have data property
        return result.data || [];
      } else {
        return [];
      }
    },
    enabled: !!user?.id && isAuthenticated,
  });

  useEffect(() => {
    setIsVisible(true);
    if (refetchWallet) {
      refetchWallet();
    }
  }, [user?.id, isAuthenticated, refetchWallet]);

  useEffect(() => {
    if (walletData?.balance !== undefined) {
      setBalance(walletData.balance);
      setLoading(false);
    }
  }, [walletData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refetchWallet();
    setIsRefreshing(false);
  };

  const getTransactionIcon = (transaction: IUiTransaction) => {
    // Failed transaction
    if (transaction.captured === false) {
      return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />;
    }

    // Successful credit (membership/deposit)
    if (transaction.membershipId && transaction.membershipId !== "") {
      return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />;
    }

    // Successful debit (payment/withdrawal)
    return <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />;
  };

  const getTransactionColors = (transaction: IUiTransaction) => {
    if (transaction.captured === false) {
      return {
        bg: "bg-red-600/20 group-hover:bg-red-600/30",
        text: "text-red-400 group-hover:text-red-300",
        badge: "bg-red-700/40 text-red-200",
        dot: "bg-red-400",
      };
    }

    if (transaction.membershipId && transaction.membershipId !== "") {
      return {
        bg: "bg-green-600/20 group-hover:bg-green-600/30",
        text: "text-green-400 group-hover:text-green-300",
        badge: "bg-green-700/40 text-green-200",
        dot: "bg-green-400",
      };
    }

    return {
      bg: "bg-orange-600/20 group-hover:bg-orange-600/30",
      text: "text-orange-400 group-hover:text-orange-300",
      badge: "bg-orange-700/40 text-orange-200",
      dot: "bg-orange-400",
    };
  };

  const getTransactionStatus = (transaction: IUiTransaction) => {
    if (transaction.captured === false) {
      return {
        label: "Failed",
        description: "Transaction failed to process",
      };
    }

    if (transaction.membershipId && transaction.membershipId !== "") {
      return {
        label: "Completed",
        description: "Credits added successfully",
      };
    }

    return {
      label: "Completed",
      description: "Payment processed successfully",
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden mt-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-60 sm:h-60 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div
        className={`relative z-10 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 transform transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 transform transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-0">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl transform hover:rotate-12 transition-transform duration-300">
                <WalletIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-1 text-cyan-400 text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium tracking-wide uppercase">
                    Financial Hub
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  My Wallet
                </h1>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="group p-3 sm:p-4 hover:bg-gray-800/50 bg-gray-800/30 backdrop-blur-sm rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-gray-700/50 hover:border-gray-600/50"
              title="Refresh Wallet"
            >
              <RefreshCw
                className={`h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-white transition-all duration-300 ${
                  isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                }`}
              />
            </button>
          </div>

          {/* Stats Cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 transform transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            {/* Balance Card */}
            <div className="group bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">
                    Total Balance
                  </h2>
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  {loading ? (
                    <div className="animate-pulse bg-gray-700 h-12 w-32 rounded"></div>
                  ) : (
                    `₹${balance.toFixed(2)}`
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  {!isAuthenticated
                    ? "Please login to view balance"
                    : "Available credits"}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div
            className={`bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-700/50 transform transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transform hover:rotate-12 transition-transform duration-300">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Recent Transactions
                </h2>
              </div>
              <span className="text-xs sm:text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                {transactions?.length ?? 0} transactions
              </span>
            </div>

            <div className="space-y-1">
              {isLoadingTransactions ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="group p-4 sm:p-5 rounded-xl border border-gray-700/50 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-5 bg-gray-700 rounded w-20 mb-1"></div>
                        <div className="w-2 h-2 bg-gray-700 rounded-full ml-auto"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : errorTransactions ? (
                // Error state
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 mb-2">
                    Failed to load transactions
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Please try refreshing the page
                  </p>
                  <button
                    onClick={() => refetchTransactions()}
                    className="px-4 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : transactions && transactions.length > 0 ? (
                // Transactions list
                transactions.map((transaction, index) => {
                  const colors = getTransactionColors(transaction);
                  const status = getTransactionStatus(transaction);

                  return (
                    <div
                      key={transaction.id}
                      className={`group p-4 sm:p-5 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-600/50 hover:bg-gray-700/30 transform ${
                        hoveredTransaction === transaction.id
                          ? "scale-102 shadow-lg"
                          : ""
                      }`}
                      style={{
                        transitionDelay: `${index * 100}ms`,
                        transform: isVisible
                          ? "translateX(0) opacity(1)"
                          : "translateX(-20px) opacity(0)",
                      }}
                      onMouseEnter={() => setHoveredTransaction(transaction.id)}
                      onMouseLeave={() => setHoveredTransaction(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div
                            className={`flex-shrink-0 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${colors.bg}`}
                          >
                            {getTransactionIcon(transaction)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium sm:font-semibold text-sm sm:text-base text-white group-hover:text-gray-100 transition-colors duration-300 truncate">
                                {transaction?.name ?? "Unknown Transaction"}
                              </p>
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded-full ${colors.badge}`}
                              >
                                {status.label}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mb-1">
                              {formatDate(
                                transaction?.capturedAt
                                  ? typeof transaction.capturedAt === "string"
                                    ? transaction.capturedAt
                                    : transaction.capturedAt.toISOString()
                                  : ""
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {status.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span
                            className={`font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${colors.text}`}
                          >
                            {transaction.captured === false
                              ? ""
                              : transaction.membershipId &&
                                transaction.membershipId !== ""
                              ? "+"
                              : "-"}
                            ₹{Math.abs(transaction.amount).toFixed(2)}
                          </span>
                          <div
                            className={`w-2 h-2 rounded-full mt-1 ml-auto transition-all duration-300 ${
                              colors.dot
                            } ${
                              hoveredTransaction === transaction.id
                                ? "scale-150"
                                : "scale-100"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Empty state
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No transactions yet</p>
                  <p className="text-sm text-gray-500">
                    Your transactions will appear here
                  </p>
                </div>
              )}
            </div>

            {!isAuthenticated && (
              <div className="text-center py-12">
                <WalletIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">
                  Please login to view your transactions
                </p>
                <p className="text-sm text-gray-500">
                  Your wallet data will appear here once you're logged in
                </p>
              </div>
            )}

            {isAuthenticated && transactions?.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No transactions yet</p>
                <p className="text-sm text-gray-500">
                  Your transactions will appear here
                </p>
              </div>
            )}
          </div>

          {/* Floating particles */}
          <div className="absolute top-16 sm:top-20 left-6 sm:left-10 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          <div
            className="absolute top-32 sm:top-40 right-12 sm:right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-50"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-24 sm:bottom-32 left-12 sm:left-20 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-ping opacity-60"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
