import api from './api';
import { ApiResponse, ShippingAddress } from '../types';

// Shop-specific types based on backend models
export interface ShopProduct {
  id?: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  inventory: number;
  category: string[];
  createdAt?: Date;
  updatedAt?: Date;
  sellerId: string;
  // Frontend specific fields for display
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isNew?: boolean;
  isSale?: boolean;
}

export interface ShopCartProduct {
  productId: string;
  quantity: number;
  name: string;
}



export interface ShopOrder {
  id?: string;
  products: ShopCartProduct[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  totalItems: number;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  orderStatus: string;
  paymentStatus: string;
  paymentDetails?: {
    paymentAmount: number;
    paymentMethod: string;
    paymentDate?: string | Date;
    isRefunded?: boolean;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };
  customerDetails?: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  sellerId: string;
}

export interface CreateOrderRequest {
  userId: string;
  products: ShopCartProduct[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  totalItems: number;
  sellerId: string;
  paymentMethod?: 'Razorpay' | 'Wallet';
}

export interface PaymentResponse {
  id: string;
  receipt: string;
}

export const shopService = {
  // Get all products with pagination
  getAllProducts: async (page: number = 1, pageSize: number = 10): Promise<ShopProduct[]> => {
    try {
      const response = await api.get(`/shop/get-products?page=${page}&pageSize=${pageSize}`);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch products');
    }
  },

  // Get products by IDs
  getProductsByIds: async (productIds: string[]): Promise<ShopProduct[]> => {
    try {
      if (!productIds || productIds.length === 0) {
        return [];
      }
      const response = await api.post('/shop/get-product-by-ids/', {
        productIds
      });
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching products by IDs:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch products');
    }
  },

  // Create a product (for sellers/admin)
  createProduct: async (productData: Omit<ShopProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShopProduct> => {
    const response = await api.post('/shop/create-product', productData);
    return response.data;
  },

  // Create order before payment
  createOrderBeforePayment: async (orderData: CreateOrderRequest): Promise<ShopOrder | string> => {
    try {
      console.log('Creating order with data:', orderData);
      
      // Prepare order data with payment method in the request body
      // Ensure payment method matches backend enum values exactly
      const paymentMethod = orderData.paymentMethod === 'Wallet' ? 'Wallet' : 'Razorpay';
      
      const orderPayload = {
        ...orderData,
        paymentDetails: {
          paymentMethod: paymentMethod,
          paymentAmount: orderData.totalAmount
        }
      };
      
      console.log('Order payload:', orderPayload);
      
      const response = await api.post(`/shop/create-shop-order-before-payment/${paymentMethod}`, orderPayload);
      return response.data; // backend may return just the order id (string)
    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response);
      throw new Error(error.response?.data?.error || 'Failed to create order');
    }
  },

  // Create payment for order
  createOrderPayment: async (orderId: string): Promise<ApiResponse<PaymentResponse>> => {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      const response = await api.post(`/shop/shop-order-payment/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw new Error(error.response?.data?.error || 'Failed to create payment');
    }
  },

  // Verify payment and complete order
  verifyPaymentAndOrder: async (
    orderId: string, 
    paymentDetails: {
      paymentId?: string;
      signature?: string;
      orderId: string;
    }
  ): Promise<ApiResponse<string>> => {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      const response = await api.post(`/shop/verify-shop-order/${orderId}`, paymentDetails);
      return response.data;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw new Error(error.response?.data?.error || 'Failed to verify payment');
    }
  },

  // Get all shop orders for user
  getAllShopOrders: async (page: number = 1, pageSize: number = 10): Promise<ShopOrder[]> => {
    const response = await api.get(`/shop/get-shop-orders?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Get specific shop order by ID
  getShopOrderById: async (orderId: string): Promise<ShopOrder> => {
    const response = await api.get(`/shop/get-shop-order/${orderId}`);
    return response.data;
  },
};

