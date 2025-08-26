import api from './api';

// Admin-specific product interfaces
export interface AdminProduct {
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
}

export interface AdminProductsResponse {
  products: AdminProduct[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  images: string[];
  inventory: number;
  category: string[];
  sellerId: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export const adminShopService = {
  // Get all products for admin - using existing public endpoint
  getAllProducts: async (
    page: number = 1, 
    pageSize: number = 20, 
    search: string = '', 
    category: string = ''
  ): Promise<AdminProductsResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      // Use existing public endpoint for getting products
      const response = await api.get(`/shop/get-products?${params}`);
      const data = response.data;
      
      // Filter by search and category on frontend since backend doesn't have these filters
      let filteredProducts = Array.isArray(data) ? data : [];
      
      if (search) {
        filteredProducts = filteredProducts.filter(product => 
          product.name?.toLowerCase().includes(search.toLowerCase()) ||
          product.description?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category?.includes(category)
        );
      }
      
      // Create pagination structure
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        totalCount: filteredProducts.length,
        currentPage: page,
        totalPages: Math.ceil(filteredProducts.length / pageSize),
        hasNextPage: page < Math.ceil(filteredProducts.length / pageSize),
        hasPreviousPage: page > 1,
      };
    } catch (error: any) {
      console.error('Error fetching admin products:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch products');
    }
  },

  // Create a new product - using existing endpoint
  createProduct: async (productData: CreateProductRequest): Promise<AdminProduct> => {
    try {
      const response = await api.post('/shop/create-product', productData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(error.response?.data?.error || 'Failed to create product');
    }
  },

  // Update an existing product - not available in existing backend, return error message
  updateProduct: async (id: string, productData: UpdateProductRequest): Promise<AdminProduct> => {
    try {
      throw new Error('Product update functionality is not available in the current backend implementation');
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new Error(error.message || 'Update functionality not available');
    }
  },

  // Delete a product - not available in existing backend, return error message
  deleteProduct: async (id: string): Promise<{ message: string }> => {
    try {
      throw new Error('Product delete functionality is not available in the current backend implementation');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw new Error(error.message || 'Delete functionality not available');
    }
  },

  // Upload product images (placeholder - would integrate with file upload service)
  uploadImages: async (files: File[]): Promise<string[]> => {
    try {
      // This is a placeholder implementation
      // In a real app, you'd upload to a cloud storage service like AWS S3, Cloudinary, etc.
      const uploadPromises = files.map(async (file) => {
        // Mock upload - in reality this would be a FormData upload
        const mockUrl = `/api/placeholder/300/300?text=${encodeURIComponent(file.name)}`;
        return mockUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      return imageUrls;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    }
  },

  // Get available categories
  getCategories: (): string[] => {
    return [
      'tennis',
      'football', 
      'basketball',
      'badminton',
      'cricket',
      'swimming',
      'fitness',
      'accessories',
      'clothing',
      'equipment'
    ];
  }
};
