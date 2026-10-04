import React, { useState } from 'react';
import { X, MapPin, Check, Search, AlertCircle } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

const popularLocations = [
  { city: 'Anantapur', state: 'Andhra Pradesh', pincode: '515001' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
];

export const LocationModal: React.FC = () => {
  const { isLocationModalOpen, closeLocationModal, pincode, setPincode } = useLocation();
  const [inputPincode, setInputPincode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLocationModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(inputPincode)) {
      setError('Please enter a 6-digit postal pincode');
      return;
    }

    setLoading(true);
    setError(null);
    const success = await setPincode(inputPincode);
    setLoading(false);

    if (success) {
      closeLocationModal();
      setInputPincode('');
    } else {
      setError(`Delivery is currently unavailable to pincode ${inputPincode}.`);
    }
  };

  const handleSelectPopular = async (code: string) => {
    setLoading(true);
    setError(null);
    const success = await setPincode(code);
    setLoading(false);

    if (success) {
      closeLocationModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => {
          if (localStorage.getItem('delivery_pincode')) {
            closeLocationModal();
          }
        }} 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200">
        {localStorage.getItem('delivery_pincode') && (
          <button
            onClick={closeLocationModal}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 leading-tight">Select Delivery Location</h3>
            <p className="text-xs text-slate-500 font-medium">
              {localStorage.getItem('delivery_pincode')
                ? 'Get your groceries in 10 minutes'
                : 'Location is required to continue shopping'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pincode Search form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex rounded-2xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 bg-slate-50">
            <input
              type="text"
              maxLength={6}
              value={inputPincode}
              onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit Pincode"
              className="w-full px-4 py-3 bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || inputPincode.length !== 6}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </form>

        {/* Detect My Location */}
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            if (navigator.geolocation) {
              setLoading(true);
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                      { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    if (data && data.address && data.address.postcode) {
                      const success = await setPincode(data.address.postcode);
                      if (success) closeLocationModal();
                      else setError(`Delivery unavailable to pincode ${data.address.postcode}.`);
                    } else {
                      setError('Could not detect pincode from your location.');
                    }
                  } catch (error) {
                    setError('Error detecting location.');
                  } finally {
                    setLoading(false);
                  }
                },
                (err) => {
                  setError('Location permission denied.');
                  setLoading(false);
                }
              );
            } else {
              setError('Geolocation is not supported by this browser.');
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 mb-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl font-bold text-sm transition-colors border border-emerald-200"
        >
          <MapPin className="w-4 h-4" />
          {loading ? 'Detecting...' : 'Detect My Location (GPS)'}
        </button>

        {/* Popular Locations */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Serviceable Cities
          </p>
          <div className="space-y-1.5">
            {popularLocations.map((loc) => {
              const isSelected = pincode === loc.pincode;
              return (
                <button
                  key={loc.pincode}
                  onClick={() => handleSelectPopular(loc.pincode)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-bold'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{loc.city}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{loc.state} · {loc.pincode}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
