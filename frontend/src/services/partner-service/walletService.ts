import axiosInstance from "../api";

export interface WalletBalance {
  balance: number;
  currency?: string;
  lastUpdated?: Date;
}

export interface UserWallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export const getUserWalletBalance = async (userId: string): Promise<number> => {
  try {
    const response = await axiosInstance.get(`/wallet/balance/${userId}`);
    return response.data.balance || 0;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return 0; // Return 0 if there's an error
  }
};

export const addMoneyToWallet = async (
  userId: string,
  amount: number
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post(`/wallet/add-credits`, {
      userId,
      credits: amount,
    });
    return response.data.success || false;
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    return false;
  }
};

export const deductMoneyFromWallet = async (
  userId: string,
  amount: number
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post(`/wallet/deduct-credits`, {
      userId,
      credits: amount,
    });
    return response.data.success || false;
  } catch (error) {
    console.error("Error deducting money from wallet:", error);
    return false;
  }
};

export const getUserWallet = async (userId: string): Promise<UserWallet | null> => {
  try {
    const response = await axiosInstance.get(`/wallet/user/${userId}`);
    return response.data.data || null;
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    return null;
  }
};
