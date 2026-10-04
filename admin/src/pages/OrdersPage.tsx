import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../api/adminClient';
import { AdminOrder } from '../types/admin';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  RefreshCw,
  ChevronDown,
  MapPin,
  Phone,
  AlertCircle,
  Navigation,
  ExternalLink,
} from 'lucide-react';

const orderStatuses = [
  'ALL',
  'PLACED',
  'CONFIRMED',
  'PACKING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export const OrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page: 0, size: 50 };
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      if (searchQuery.trim()) {
        params.query = searchQuery.trim();
      }

      const res = await adminApi.get<{
        success: boolean;
        data: { content: AdminOrder[]; totalElements: number };
      }>('/admin/orders', { params });

      if (res.data.success && res.data.data) {
        setOrders(res.data.data.content);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await adminApi.put<{ success: boolean; data: AdminOrder }>(
        `/admin/orders/${orderId}/status`,
        {
          orderStatus: newStatus,
          paymentStatus: newStatus === 'DELIVERED' ? 'COMPLETED' : undefined,
        }
      );

      if (res.data.success && res.data.data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.data.data : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PACKING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track and update customer 10-minute grocery dispatches</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {orderStatuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number (ORD-...), customer name, or mobile number"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Order</th>
                <th className="px-5 py-3.5">Customer & Address</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5">Total & Payment</th>
                <th className="px-5 py-3.5">Status & Dispatch</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-xs">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    {/* Order Number & Date */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-mono text-xs font-bold text-slate-900">{order.orderNumber}</div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4 align-top max-w-xs">
                      <div className="font-semibold text-slate-900 text-xs">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>+91 {order.customerMobile}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-1 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {order.address?.addressLine1}, {order.address?.city} ({order.address?.pincode})
                        </span>
                      </div>
                      {order.address?.latitude && order.address?.longitude && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5 font-semibold">
                            <Navigation className="w-2.5 h-2.5 text-emerald-600" />
                            GPS: {Number(order.address.latitude).toFixed(4)}°, {Number(order.address.longitude).toFixed(4)}°
                          </span>
                          <a
                            href={`https://www.google.com/maps?q=${order.address.latitude},${order.address.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Maps
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Items */}
                    <td className="px-5 py-4 align-top">
                      <div className="text-xs font-semibold text-slate-800">
                        {order.items?.length || 0} items
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 max-w-xs">
                        {order.items?.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                      </div>
                    </td>

                    {/* Total & Payment */}
                    <td className="px-5 py-4 align-top">
                      <div className="text-xs font-bold text-slate-900">₹{order.totalAmount}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Online Paid'}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded mt-1 ${
                          order.paymentStatus === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-5 py-4 align-top">
                      <div className="relative inline-block text-left">
                        <select
                          disabled={updatingId === order.id}
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer transition ${getStatusBadge(
                            order.orderStatus
                          )}`}
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PACKING">PACKING</option>
                          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 align-top text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-emerald-600 font-bold">
                  {selectedOrder.orderNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Delivery Info */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Delivery Destination
                </p>
                <p className="text-sm font-bold text-slate-900">{selectedOrder.customerName}</p>
                <p className="text-xs text-slate-600 font-mono">+91 {selectedOrder.customerMobile}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {selectedOrder.address?.addressLine1}
                  {selectedOrder.address?.addressLine2 ? `, ${selectedOrder.address.addressLine2}` : ''}
                  {selectedOrder.address?.landmark ? ` (Near: ${selectedOrder.address.landmark})` : ''},{' '}
                  {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                </p>

                {/* If Customer selected pin via Google Maps / GPS */}
                {selectedOrder.address?.latitude && selectedOrder.address?.longitude && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                    <div className="p-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold font-mono text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Drop GPS: {Number(selectedOrder.address.latitude).toFixed(5)}°, {Number(selectedOrder.address.longitude).toFixed(5)}°
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${selectedOrder.address.latitude},${selectedOrder.address.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Navigate in Google Maps</span>
                      </a>
                    </div>
                    <div className="h-44 w-full bg-slate-100">
                      <iframe
                        title="Delivery GPS Location Map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(selectedOrder.address.longitude) - 0.005}%2C${Number(selectedOrder.address.latitude) - 0.005}%2C${Number(selectedOrder.address.longitude) + 0.005}%2C${Number(selectedOrder.address.latitude) + 0.005}&layer=mapnik&marker=${selectedOrder.address.latitude}%2C${selectedOrder.address.longitude}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Items ({selectedOrder.items?.length || 0})
                </p>
                <div className="space-y-2 border border-slate-100 rounded-xl p-3 divide-y divide-slate-100">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-10 h-10 object-contain rounded-lg border border-slate-100"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{item.productName}</p>
                          <p className="text-[11px] text-slate-400">
                            ₹{item.price} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Details */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>₹{selectedOrder.deliveryFee}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Coupon ({selectedOrder.couponCode})</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Amount Paid / Payable</span>
                  <span className="text-emerald-700">₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
