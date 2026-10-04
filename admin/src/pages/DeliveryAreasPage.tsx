import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminClient';
import { AdminDeliveryArea, DeliveryAreaForm } from '../types/admin';
import { MapPin, Plus, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const DeliveryAreasPage: React.FC = () => {
  const [areas, setAreas] = useState<AdminDeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [deliveryFee, setDeliveryFee] = useState('25');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('99');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<{ success: boolean; data: AdminDeliveryArea[] }>(
        '/admin/delivery-areas'
      );
      if (res.data.success && res.data.data) {
        setAreas(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load delivery areas', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const openAddModal = () => {
    setPincode('');
    setCity('');
    setState('Andhra Pradesh');
    setDeliveryFee('25');
    setMinimumOrderAmount('99');
    setDeliveryAvailable(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this delivery area?')) return;
    try {
      await adminApi.delete(`/admin/delivery-areas/${id}`);
      setAreas((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete delivery area');
    }
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || !city.trim() || !state.trim()) {
      setErrorMsg('Pincode, city, and state are required');
      return;
    }
    setSaving(true);
    setErrorMsg('');

    try {
      const payload: DeliveryAreaForm = {
        pincode: pincode.trim(),
        city: city.trim(),
        state: state.trim(),
        deliveryAvailable,
        deliveryFee: parseFloat(deliveryFee),
        minimumOrderAmount: parseFloat(minimumOrderAmount),
      };

      await adminApi.post('/admin/delivery-areas', payload);
      setIsModalOpen(false);
      fetchAreas();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create delivery area');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Delivery Zones & Pincodes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control serviceable dark store regions for instant 10-minute dispatch</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Serviceable Pincode</span>
        </button>
      </div>

      {/* Areas Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Pincode</th>
                <th className="px-5 py-3.5">City & Region</th>
                <th className="px-5 py-3.5">State</th>
                <th className="px-5 py-3.5">Delivery Fee</th>
                <th className="px-5 py-3.5">Min Order Threshold</th>
                <th className="px-5 py-3.5">Availability</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    Loading serviceable areas...
                  </td>
                </tr>
              ) : areas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No serviceable delivery areas configured.
                  </td>
                </tr>
              ) : (
                areas.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{a.pincode}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-800 text-xs">{a.city}</td>

                    <td className="px-5 py-3.5 text-xs text-slate-600">{a.state}</td>

                    <td className="px-5 py-3.5 text-xs font-bold text-slate-900">₹{a.deliveryFee}</td>

                    <td className="px-5 py-3.5 text-xs text-slate-700">₹{a.minimumOrderAmount}</td>

                    <td className="px-5 py-3.5">
                      {a.deliveryAvailable ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                          ONLINE (10 MINS)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-md">
                          OFFLINE
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Area"
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

      {/* Add Area Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Add Serviceable Delivery Area</h2>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveArea} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">6-Digit Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 515001"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">City Name *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Anantapur"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Andhra Pradesh"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Delivery Fee (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Min Order (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={minimumOrderAmount}
                    onChange={(e) => setMinimumOrderAmount(e.target.value)}
                    placeholder="99"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={deliveryAvailable}
                  onChange={(e) => setDeliveryAvailable(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span>Enable active 10-minute delivery to this pincode</span>
              </label>

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
                  {saving ? 'Adding...' : 'Add Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
