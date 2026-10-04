import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../api/adminClient';
import { DashboardStats } from '../types/admin';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Users,
  Package,
  Clock,
  ArrowUpRight,
  Plus,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard');
      if (res.data.success && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatPrice = (amount: number | null | undefined) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PACKING':
      case 'CONFIRMED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs animate-pulse h-32"></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs animate-pulse h-80"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dark Store Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time inventory, orders, and 10-minute dispatch metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
          <Link
            to="/products"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{formatPrice(stats?.totalRevenue)}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Today: {formatPrice(stats?.todayRevenue)}</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            <span className="text-blue-600 font-semibold">{stats?.todayOrders || 0}</span> placed today
          </p>
        </div>

        {/* Pending / Active Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{stats?.pendingOrders || 0}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting packing & dispatch</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock SKUs</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{stats?.lowStockProducts || 0}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Under 10 units in stock</p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">7-Day Sales & Dispatch Trend</h2>
            <p className="text-xs text-slate-500">Gross merchandise value and order volume</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
            Daily Trends
          </span>
        </div>

        <div className="h-64 w-full">
          {stats?.salesTrend && stats.salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No sales data logged yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500">Live order queue for instant delivery</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3">Order Number</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Placed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900">
                      <Link to={`/orders?query=${ord.orderNumber}`} className="hover:text-emerald-600">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{ord.customerName}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">+91 {ord.customerMobile}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{formatPrice(ord.amount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getStatusColor(ord.status)}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {new Date(ord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                    No orders placed yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
