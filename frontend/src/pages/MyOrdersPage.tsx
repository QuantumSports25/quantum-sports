import React, { useEffect, useState } from 'react';
import { shopService, ShopOrder } from '../services/shopService';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const MyOrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await shopService.getAllShopOrders(1, 50);
        setOrders(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Please log in to view your orders</h1>
        <Link to="/login" className="inline-block mt-4 px-6 py-3 bg-green-600 text-white rounded-xl">Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
        {loading && <div>Loading orders...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-600">No orders yet.</div>
        )}
        <div className="grid grid-cols-1 gap-4">
          {orders.map((o) => (
            <Link to={`/orders/${o.id}`} key={o.id} className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Order ID</div>
                  <div className="font-mono font-semibold">{o.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Amount</div>
                  <div className="font-semibold">₹{o.totalAmount?.toLocaleString?.() ?? o.totalAmount}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 flex gap-4">
                <span>Status: {o.orderStatus}</span>
                <span>Payment: {o.paymentStatus}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;



