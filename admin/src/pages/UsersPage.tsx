import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminClient';
import { AdminUserItem } from '../types/admin';
import { Users, Phone, Mail, ShoppingBag, ShieldCheck, Power, RefreshCw } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<{
        success: boolean;
        data: { content: AdminUserItem[]; totalElements: number };
      }>('/admin/users', {
        params: { page: 0, size: 50 },
      });
      if (res.data.success && res.data.data) {
        setUsers(res.data.data.content);
      }
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: number) => {
    try {
      setTogglingId(userId);
      await adminApi.put(`/admin/users/${userId}/toggle-status`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registered Customers</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage user accounts, order volume, and access control</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Mobile Number</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Total Orders</th>
                <th className="px-5 py-3.5">Joined On</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No customer accounts registered yet.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : u.mobileNumber.slice(-2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {u.name || 'Shopper'}
                          </p>
                          {u.profileCompleted && (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5 font-medium">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                      +91 {u.mobileNumber}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {u.email || '—'}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{u.totalOrders} orders</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-3.5">
                      {u.active ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-md">
                          SUSPENDED
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        disabled={togglingId === u.id}
                        onClick={() => handleToggleStatus(u.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                          u.active
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                        title={u.active ? 'Suspend Account' : 'Activate Account'}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{u.active ? 'Suspend' : 'Activate'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
