import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ChevronRight, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '../api/client';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const OrdersPage: React.FC = () => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data: Order[] }>('/orders');
        if (res.data.success && res.data.data) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, openLoginModal]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">Delivered</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs animate-pulse">Out for Delivery</span>;
      case 'PACKING':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">Packing</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold text-xs">Confirmed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">Order Placed</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Grocery Orders</h1>
          <p className="text-xs text-slate-500 font-medium">View order receipts and track delivery</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto mb-6">
            Your ordered groceries will appear here with live 10-minute delivery tracking.
          </p>
          <Link to="/" className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-3xl border border-slate-200/80 p-5 hover:border-emerald-500/50 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">{order.orderNumber}</span>
                  <p className="text-[11px] text-slate-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.orderStatus)}
                  <span className="font-black text-base text-slate-900">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                  {order.items?.slice(0, 4).map((item) => (
                    <div key={item.id} className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden">
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded-tl-md">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                  {order.items && order.items.length > 4 && (
                    <span className="text-xs font-bold text-slate-400 pl-1">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0">
                  <span>Track Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
