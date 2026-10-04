import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, ArrowLeft, ShieldCheck, MapPin, AlertCircle, XCircle } from 'lucide-react';
import api from '../api/client';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';

const steps: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Received at dark store' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Inventory allocated' },
  { key: 'PACKING', label: 'Packing Items', desc: 'Hygienic sealed box' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Rider on the way' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Arrived at your door' },
];

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, openLoginModal } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
        if (res.data.success && res.data.data) {
          setOrder(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, isAuthenticated, openLoginModal]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelLoading(true);
      const res = await api.post<{ success: boolean; data: Order }>(`/orders/${order.id}/cancel`);
      if (res.data.success && res.data.data) {
        setOrder(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'CONFIRMED': return 1;
      case 'PACKING': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return -1;
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-xs font-bold text-slate-400">Loading order status...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h3 className="font-bold text-lg text-slate-900 mb-2">Order Not Found</h3>
        <Link to="/orders" className="text-xs font-bold text-emerald-600 hover:underline">
          Back to all orders
        </Link>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold text-slate-400">Order #{order.orderNumber}</span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {isCancelled ? 'Order Cancelled' : currentStepIdx === 4 ? 'Delivered!' : 'Arriving in 10-15 Mins'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Payment Method: {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Online Payment'} ({order.paymentStatus})
          </p>
        </div>

        {/* Cancel button if PLACED or CONFIRMED */}
        {(order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED') && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelLoading}
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
          >
            {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Order Status Stepper */}
      {!isCancelled ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-6">Delivery Progress</h3>
          <div className="relative flex justify-between">
            {steps.map((step, i) => {
              const isPassed = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;

              return (
                <div key={step.key} className="flex-1 flex flex-col items-center text-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPassed
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : i + 1}
                  </div>
                  <span className={`text-[11px] font-extrabold mt-2 leading-tight ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  <span className="hidden sm:inline text-[9px] text-slate-400 leading-none mt-0.5">
                    {step.desc}
                  </span>
                </div>
              );
            })}
            {/* Connecting bar */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-slate-100 -z-0">
              <div
                className="h-1 bg-emerald-600 transition-all duration-500"
                style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-rose-50 rounded-3xl border border-rose-200 p-5 flex items-center gap-3 text-rose-800 text-xs">
          <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">This order was cancelled</p>
            <p className="text-rose-600 mt-0.5">Reserved inventory has been restored to the store catalog.</p>
          </div>
        </div>
      )}

      {/* Items & Bill */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Ordered Items</h3>
        <div className="divide-y divide-slate-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-xl object-cover bg-slate-50" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{item.productName}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Qty: {item.quantity} · ₹{item.price.toFixed(2)} each</p>
                </div>
              </div>
              <span className="font-black text-xs text-slate-900">₹{item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Bill */}
        <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Item Subtotal</span>
            <span className="font-bold text-slate-900">₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Charge</span>
            <span className="font-bold text-slate-900">
              {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-₹{order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-black text-slate-900">
            <span>Total Paid</span>
            <span className="text-emerald-700">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-start gap-3">
          <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Delivered To</h4>
            <p className="font-semibold text-slate-800">{order.customerName} ({order.customerMobile})</p>
            <p className="text-slate-600 mt-0.5">{order.address.addressLine1}, {order.address.addressLine2 || ''}</p>
            <p className="text-slate-400">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
          </div>
        </div>
      )}
    </div>
  );
};
