import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Upload,
  X
} from 'lucide-react';
import { AdminProduct, adminShopService, CreateProductRequest } from '../../../services/adminShopService';
import { shopService, ShopOrder } from '../../../services/shopService';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  inventory: string;
  category: string[];
  images: string[];
  sellerId: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  inventory: '',
  category: [],
  images: [],
  sellerId: 'default-admin-seller'
};

const ProductManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [categories] = useState(adminShopService.getCategories());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Orders state (Admin view)
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'products') {
        fetchProducts();
      } else {
        fetchOrders();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, activeTab]);

  // Separate effect for search query with debouncing
  useEffect(() => {
    if (searchQuery === '') {
      fetchProducts();
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500); // Debounce search input

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminShopService.getAllProducts(
        currentPage,
        10,
        searchQuery,
        selectedCategory
      );
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory]);

  const fetchOrders = React.useCallback(async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      // For now fetch first 50 orders
      const resp = await shopService.getAllShopOrders(1, 50);
      setOrders(resp || []);
    } catch (err: any) {
      setOrdersError(err.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleCreateProduct = () => {
    setFormData(initialFormData);
    setShowCreateModal(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      inventory: String(product.inventory),
      category: product.category,
      images: product.images,
      sellerId: product.sellerId,
    });
    setEditingProductId(product.id || null);
    setShowCreateModal(false);
    // Flag edit mode using showEditModal
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (product: AdminProduct) => {
    if (!product.id) return;
    if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      await adminShopService.deleteProduct(product.id);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = React.useCallback(async (productData: CreateProductRequest) => {
    try {
      setFormLoading(true);
      setError(null);

      if (showEditModal) {
        if (!editingProductId) throw new Error('Missing product ID to update');
        await adminShopService.updateProduct(editingProductId, productData);
      } else {
        await adminShopService.createProduct(productData);
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingProductId(null);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  }, [editingProductId, showEditModal, fetchProducts]);

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCategoryChange = React.useCallback((category: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  }, []);

  const handleImageAdd = React.useCallback(() => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    }
  }, []);

  const handleImageRemove = React.useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  const ProductForm: React.FC<{ isEdit?: boolean }> = ({ isEdit = false }) => {
    const [localName, setLocalName] = useState(formData.name);
    const [localDescription, setLocalDescription] = useState(formData.description);
    const [localPrice, setLocalPrice] = useState(formData.price);
    const [localInventory, setLocalInventory] = useState(formData.inventory);
    const [localCategory, setLocalCategory] = useState<string[]>(formData.category);
    const [localImages, setLocalImages] = useState<string[]>(formData.images);

    const toggleLocalCategory = (category: string) => {
      setLocalCategory(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
    };

    const removeLocalImage = (index: number) => {
      setLocalImages(prev => prev.filter((_, i) => i !== index));
    };

    const addLocalImage = () => {
      const imageUrl = prompt('Enter image URL:');
      if (imageUrl) setLocalImages(prev => [...prev, imageUrl]);
    };

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!localName.trim() || !localDescription.trim() || !localPrice) {
        setError('Please fill in all required fields');
        return;
      }
      const productData: CreateProductRequest = {
        name: localName.trim(),
        description: localDescription.trim(),
        price: parseFloat(localPrice),
        inventory: parseInt(localInventory) || 0,
        category: localCategory,
        images: localImages,
        sellerId: formData.sellerId,
      };
      await handleFormSubmit(productData);
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isEdit ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setError(null);
            }}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={localPrice}
                onChange={(e) => setLocalPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Inventory
              </label>
              <input
                type="number"
                name="inventory"
                value={localInventory}
                onChange={(e) => setLocalInventory(e.target.value)}
                min="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categories
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localCategory.includes(category)}
                    onChange={() => toggleLocalCategory(category)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-sm capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Images
            </label>
            <div className="space-y-2">
              {localImages.map((image, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-700 p-2 rounded">
                  <img src={image} alt={`Preview ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                  <span className="text-gray-300 text-sm flex-1 truncate">{image}</span>
                  <button
                    type="button"
                    onClick={() => removeLocalImage(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addLocalImage}
                className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
              >
                <Upload className="w-4 h-4 mx-auto mb-1" />
                Add Image URL
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setError(null);
              }}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Shop Management</h2>
          <p className="text-gray-400 mt-1">Manage products and view orders</p>
        </div>
        {activeTab === 'products' && (
          <button
            onClick={handleCreateProduct}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 w-full">
        <button
          onClick={() => setActiveTab('products')}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
        >
          Orders
        </button>
      </div>

      {/* Stats Cards - only for Products tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-white">{totalCount}</p>
              </div>
              <Package className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">In Stock</p>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => p.inventory > 0).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Out of Stock</p>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => p.inventory === 0).length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters (Products tab only) */}
      {activeTab === 'products' && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    e.persist();
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="capitalize">
                    {category}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Products Table */}
      {activeTab === 'products' && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-2">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No products found</h3>
              <p className="text-gray-500">Get started by creating your first product.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Inventory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Categories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.images[0] || '/api/placeholder/40/40'}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-white">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-400 max-w-xs truncate">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          ₹{product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.inventory > 0
                              ? 'bg-green-900/20 text-green-400'
                              : 'bg-red-900/20 text-red-400'
                            }`}>
                            {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <div className="flex flex-wrap gap-1">
                            {product.category.slice(0, 2).map((cat) => (
                              <span key={cat} className="bg-gray-700 px-2 py-1 rounded text-xs capitalize">
                                {cat}
                              </span>
                            ))}
                            {product.category.length > 2 && (
                              <span className="text-gray-500 text-xs">
                                +{product.category.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-gray-300 hover:text-white p-1"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-900 px-6 py-3 flex items-center justify-between border-t border-gray-700">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * 10, totalCount)}</span> of{' '}
                        <span className="font-medium">{totalCount}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNumber = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber
                                  ? 'z-10 bg-blue-600 border-blue-500 text-white'
                                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Orders List */}
      {activeTab === 'orders' && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          {ordersLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-2">Loading orders...</p>
            </div>
          ) : ordersError ? (
            <div className="p-8 text-center text-red-400">{ordersError}</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {orders.map((o) => (
                    <React.Fragment key={o.id}>
                      <tr className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-3 font-mono text-sm text-white">{o.id}</td>
                        <td className="px-6 py-3 text-sm text-gray-300">{o.customerDetails?.customerName || o.userId}</td>
                        <td className="px-6 py-3 text-sm text-gray-300">{o.totalItems}</td>
                        <td className="px-6 py-3 text-sm text-white">₹{o.totalAmount?.toLocaleString?.() ?? o.totalAmount}</td>
                        <td className="px-6 py-3 text-sm text-gray-300">{o.paymentStatus}</td>
                        <td className="px-6 py-3 text-sm text-gray-300">{o.orderStatus}</td>
                        <td className="px-6 py-3 text-right text-sm">
                          <button
                            onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : (o.id as string))}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {expandedOrderId === o.id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      {expandedOrderId === o.id && (
                        <tr className="bg-gray-900/40">
                          <td className="px-6 py-4" colSpan={7}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                              <div>
                                <h4 className="font-semibold text-white mb-2">Customer Details</h4>
                                <div className="text-gray-300 space-y-1">
                                  <p>Name: {o.customerDetails?.customerName || '-'}</p>
                                  <p>Email: {o.customerDetails?.customerEmail || '-'}</p>
                                  <p>Phone: {o.customerDetails?.customerPhone || '-'}</p>
                                  <p>User ID: {o.userId}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Shipping Address</h4>
                                <div className="text-gray-300 space-y-1">
                                  <p>{o.shippingAddress.addressLine1}</p>
                                  {o.shippingAddress.addressLine2 && <p>{o.shippingAddress.addressLine2}</p>}
                                  <p>{o.shippingAddress.city} - {o.shippingAddress.postalCode}</p>
                                  <p>{o.shippingAddress.country}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Products</h4>
                                <ul className="text-gray-300 list-disc list-inside space-y-1">
                                  {o.products.map((p) => (
                                    <li key={p.productId}>{p.name} × {p.quantity}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Payment</h4>
                                <div className="text-gray-300 space-y-1">
                                  <p>Method: {o.paymentDetails?.paymentMethod || '-'}</p>
                                  <p>Amount: ₹{(o.paymentDetails?.paymentAmount ?? o.totalAmount).toLocaleString?.() ?? o.totalAmount}</p>
                                  {((o as any).paymentDetails?.razorpayOrderId) && <p>Rz Order ID: {(o as any).paymentDetails.razorpayOrderId}</p>}
                                  {((o as any).paymentDetails?.razorpayPaymentId) && <p>Rz Payment ID: {(o as any).paymentDetails.razorpayPaymentId}</p>}
                                  {((o as any).paymentDetails?.paymentDate) && <p>Date: {new Date((o as any).paymentDetails.paymentDate).toLocaleString()}</p>}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                              <p><span className="text-gray-400">Order Status:</span> {o.orderStatus}</p>
                              <p><span className="text-gray-400">Payment Status:</span> {o.paymentStatus}</p>
                              <p><span className="text-gray-400">Created:</span> {new Date(o.createdAt as any).toLocaleString()}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <ProductForm />}
      {showEditModal && <ProductForm isEdit />}
    </div>
  );
};

export default ProductManagement;
