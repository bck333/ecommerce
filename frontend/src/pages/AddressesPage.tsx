import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Address } from '../types';
import { MapLocationPicker, LocationResult } from '../components/MapLocationPicker';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ChevronRight,
  Home,
  Briefcase,
  Compass,
  AlertCircle,
  Navigation,
  ExternalLink,
} from 'lucide-react';

export const AddressesPage: React.FC = () => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form State
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Anantapur');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('515001');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; data: Address[] }>('/users/addresses');
      if (res.data.success && res.data.data) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const openAddModal = () => {
    setEditingAddress(null);
    setAddressLine1('');
    setAddressLine2('');
    setLandmark('');
    setCity('Anantapur');
    setState('Andhra Pradesh');
    setPincode('515001');
    setLatitude(undefined);
    setLongitude(undefined);
    setAddressType('HOME');
    setIsDefault(addresses.length === 0);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setLatitude(addr.latitude);
    setLongitude(addr.longitude);
    setAddressType(addr.addressType);
    setIsDefault(addr.isDefault);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleMapLocationSelected = (loc: LocationResult) => {
    setAddressLine1(loc.addressLine1);
    if (loc.landmark) setLandmark(loc.landmark);
    setCity(loc.city);
    setState(loc.state);
    setPincode(loc.pincode);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine1.trim() || !pincode.trim() || !city.trim() || !state.trim()) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        latitude,
        longitude,
        addressType,
        isDefault,
      };

      if (editingAddress) {
        await api.put(`/users/addresses/${editingAddress.id}`, payload);
      } else {
        await api.post('/users/addresses', payload);
      }
      setIsModalOpen(false);
      await fetchAddresses();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved Addresses</h2>
        <p className="text-gray-600 mb-6 text-sm">Please log in to manage your delivery locations for 10-minute grocery drops.</p>
        <button
          onClick={openLoginModal}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-md"
        >
          Login with Mobile OTP
        </button>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOME':
        return <Home className="w-4 h-4" />;
      case 'WORK':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/profile" className="hover:text-emerald-600 transition-colors">Profile</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Saved Addresses</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Addresses</h1>
          <p className="text-sm text-gray-600">Manage locations for your instant 10-minute orders</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-40"></div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No addresses saved yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your flat, house or office location for quick checkout.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                addr.isDefault ? 'border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs' : 'border-gray-200/70 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">
                      {getTypeIcon(addr.addressType)}
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md">
                        <CheckCircle2 className="w-3 h-3" />
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-900 mb-1">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-xs text-gray-600 mb-0.5">{addr.addressLine2}</p>}
                {addr.landmark && (
                  <p className="text-xs text-gray-500 mb-1">Landmark: {addr.landmark}</p>
                )}
                <p className="text-xs text-gray-600 font-medium">
                  {addr.city}, {addr.state} - <span className="font-mono text-gray-900 font-bold">{addr.pincode}</span>
                </p>

                {addr.latitude && addr.longitude && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                      <Navigation className="w-3 h-3" />
                      GPS: {Number(addr.latitude).toFixed(4)}°, {Number(addr.longitude).toFixed(4)}°
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 ml-auto"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Maps</span>
                    </a>
                  </div>
                )}
              </div>

              {!addr.isDefault && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/users/addresses/${addr.id}`, {
                          ...addr,
                          isDefault: true,
                        });
                        fetchAddresses();
                      } catch (err) {
                        console.error('Failed to set default', err);
                      }
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Set as Default
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {editingAddress ? 'Edit Address' : 'Add New Delivery Address'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">Enter accurate delivery details for 10-minute drop</p>

            {/* Quick Locate via GPS / Google Maps */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setIsMapPickerOpen(true)}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs group"
              >
                <Navigation className="w-4 h-4 text-emerald-600 group-hover:rotate-45 transition-transform" />
                <span>
                  {latitude && longitude
                    ? '📍 Change Location via GPS / Google Maps'
                    : '📍 Detect Location via GPS / Google Maps'}
                </span>
              </button>

              {latitude && longitude && (
                <div className="mt-2 p-2 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-800">
                  <span className="font-mono font-medium">
                    Selected Pin: {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline flex items-center gap-0.5 text-emerald-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Verify
                  </a>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HOME', 'WORK', 'OTHER'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressType(type)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                        addressType === type
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {getTypeIcon(type)}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  House / Flat / Block / Street *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. Flat 302, Green Valley Apts, MG Road"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Area / Colony / Street 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. Near Clock Tower"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite ICICI Bank"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-gray-300 focus:ring-emerald-500"
                />
                <span>Set this address as default delivery location</span>
              </label>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50 shadow-xs"
                >
                  {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Maps / GPS Location Picker Modal */}
      <MapLocationPicker
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelectLocation={handleMapLocationSelected}
        initialLat={latitude}
        initialLng={longitude}
      />
    </div>
  );
};
