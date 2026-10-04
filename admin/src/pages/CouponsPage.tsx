import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminClient';
import { AdminCoupon, CouponForm } from '../types/admin';
import { TicketPercent, Plus, Trash2, Calendar, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('199');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [expiryDate, setExpiryDate] = useState('2027-12-31T23:59:59');
  const [usageLimit, setUsageLimit] = useState(1000);
  const [active, setActive] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<{ success: boolean; data: AdminCoupon[] }>('/admin/coupons');
      if (res.data.success && res.data.data) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setCode('');
    setDescription('');
    setDiscountType('FIXED');
    setDiscountValue('');
    setMinOrder('199');
    setMaxDiscount('100');
    setExpiryDate('2027-12-31T23:59:59');
    setUsageLimit(1000);
    setActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await adminApi.delete(`/admin/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue || !expiryDate) {
      setErrorMsg('Code, discount value, and expiry date are required');
      return;
    }
    setSaving(true);
    setErrorMsg('');

    try {
      const payload: CouponForm = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: parseFloat(discountValue),
        minimumOrderAmount: minOrder ? parseFloat(minOrder) : undefined,
        maximumDiscount: discountType === 'PERCENTAGE' && maxDiscount ? parseFloat(maxDiscount) : undefined,
        expiryDate,
        usageLimit: Number(usageLimit),
        active,
      };

      await adminApi.post('/admin/coupons', payload);
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Coupons & Promotions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer discount codes, minimum basket thresholds, and savings</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Promo Code</th>
                <th className="px-5 py-3.5">Discount Type & Value</th>
                <th className="px-5 py-3.5">Min Order Basket</th>
                <th className="px-5 py-3.5">Expiry Date</th>
                <th className="px-5 py-3.5">Redemption Usage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No active discount coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-emerald-700">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{c.code}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans font-normal mt-0.5">{c.description}</p>
                    </td>

                    <td className="px-5 py-3.5 text-xs font-bold text-slate-900">
                      {c.discountType === 'PERCENTAGE' ? (
                        <span>
                          {c.discountValue}% OFF {c.maximumDiscount ? `(up to ₹${c.maximumDiscount})` : ''}
                        </span>
                      ) : (
                        <span>₹{c.discountValue} FLAT OFF</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-700">
                      ₹{c.minimumOrderAmount || 0}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-600 font-mono">
                      {new Date(c.expiryDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {c.usedCount || 0} / {c.usageLimit || '∞'} uses
                    </td>

                    <td className="px-5 py-3.5">
                      {c.active ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">
                          INACTIVE
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Create Promo Coupon</h2>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Promo Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH100"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Get ₹100 off on fresh fruits & vegetables"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Discount Type *</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="FIXED">Flat Fixed (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'FIXED' ? '50' : '20'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="199"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Expiry Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={expiryDate.slice(0, 16)}
                  onChange={(e) => setExpiryDate(e.target.value + ':00')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
