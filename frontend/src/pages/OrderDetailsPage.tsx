import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shopService, ShopOrder } from '../services/shopService';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!orderId) return;
        setLoading(true);
        const data = await shopService.getShopOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/orders" className="text-green-700 hover:underline">← Back to My Orders</Link>
        </div>
        {loading && <div>Loading order...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {order && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h1 className="text-2xl font-bold mb-2">Order #{order.id}</h1>
            <div className="text-sm text-gray-600 mb-4">Status: {order.orderStatus} • Payment: {order.paymentStatus}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-semibold mb-2">Items</h2>
                <ul className="space-y-2">
                  {order.products.map((p) => (
                    <li key={p.productId} className="flex justify-between">
                      <span>{p.name}</span>
                      <span>Qty: {p.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Shipping Address</h2>
                <div className="text-gray-700 text-sm">
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city} - {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{order.totalAmount.toLocaleString()}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;



