import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Tag,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import api from '../api/client';
import { Address, CouponValidation } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { MapLocationPicker, LocationResult } from '../components/MapLocationPicker';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { cart, clearCart } = useCart();
  const { deliveryTime, city } = useLocation();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  // New Address state
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [formCity, setFormCity] = useState('Anantapur');
  const [formState, setFormState] = useState('Andhra Pradesh');
  const [formPincode, setFormPincode] = useState('515001');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'ONLINE_PAYMENT'>('CASH_ON_DELIVERY');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await api.get<{ success: boolean; data: Address[] }>('/users/addresses');
        if (res.data.success && res.data.data) {
          setAddresses(res.data.data);
          const defaultAddr = res.data.data.find((a) => a.isDefault) || res.data.data[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else {
            setShowAddressForm(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch addresses', err);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, openLoginModal]);

  const handleMapLocationSelected = (loc: LocationResult) => {
    setAddressLine1(loc.addressLine1);
    if (loc.landmark) setLandmark(loc.landmark);
    setFormCity(loc.city);
    setFormState(loc.state);
    setFormPincode(loc.pincode);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine1.trim() || !formCity.trim() || !formPincode.trim()) {
      setError('Please fill all required address fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post<{ success: boolean; data: Address }>('/users/addresses', {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || null,
        landmark: landmark.trim() || null,
        city: formCity.trim(),
        state: formState.trim(),
        pincode: formPincode.trim(),
        latitude,
        longitude,
        addressType,
        isDefault: true,
      });

      if (res.data.success && res.data.data) {
        const newAddr = res.data.data;
        setAddresses([newAddr, ...addresses]);
        setSelectedAddressId(newAddr.id);
        setShowAddressForm(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponError(null);
      const res = await api.post<{ success: boolean; data: CouponValidation }>('/coupons/validate', {
        code: couponCode.trim(),
        orderAmount: cart.subtotal,
      });

      if (res.data.success && res.data.data) {
        if (res.data.data.valid) {
          setAppliedCoupon(res.data.data);
          setCouponError(null);
        } else {
          setCouponError(res.data.data.message);
          setAppliedCoupon(null);
        }
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select or add a delivery address');
      return;
    }

    if (cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post<{ success: boolean; data: { id: number; orderNumber: string } }>('/orders', {
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      });

      if (res.data.success && res.data.data) {
        clearCart();
        navigate(`/orders/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">Add fresh groceries before proceeding to checkout.</p>
        <Link to="/" className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider">
          Return to Home
        </Link>
      </div>
    );
  }

  // Calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cart.subtotal + cart.deliveryFee - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500 font-medium">Delivering in {deliveryTime} to {city}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Address, Items, Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Delivery Address</h3>
              </div>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add New
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                {/* Pick from GPS / Google Maps */}
                <div className="pb-1">
                  <button
                    type="button"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs group"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-45 transition-transform" />
                    <span>
                      {latitude && longitude
                        ? `📍 Selected GPS (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°) - Click to Change`
                        : '📍 Auto-Detect Location via GPS / Google Maps'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Flat, House no., Building"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Area, Colony, Street"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near clock tower"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">City *</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={formPincode}
                      onChange={(e) => setFormPincode(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700"
                  >
                    Save & Deliver Here
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200/80 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {addr.addressType}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-xs text-slate-600">{addr.addressLine2}</p>}
                      <p className="text-[11px] text-slate-400 mt-1">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Order Items Review */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Order Items ({cart.totalItems})</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{item.productName}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{item.quantityDescription}</p>
                      <span className="text-[11px] text-slate-500 font-bold">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-slate-900">₹{item.itemTotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Payment Option</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cash on Delivery</p>
                    <p className="text-[10px] text-slate-500">Pay cash or UPI upon delivery</p>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all opacity-60 ${
                  paymentMethod === 'ONLINE_PAYMENT'
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE_PAYMENT'}
                  onChange={() => setPaymentMethod('ONLINE_PAYMENT')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Online Payment</p>
                    <p className="text-[10px] text-slate-500">UPI / Cards / Netbanking (Gateway)</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Coupon & Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" /> Apply Coupon
            </h4>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <div>
                  <span className="font-extrabold text-emerald-800 font-mono">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-emerald-600 mt-0.5">₹{appliedCoupon.discountAmount.toFixed(2)} savings applied</p>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs font-bold text-rose-600 hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME50"
                  className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase font-mono"
                />
                <button
                  type="submit"
                  disabled={!couponCode.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <p className="text-[11px] text-rose-600 font-medium mt-2">{couponError}</p>}

            {/* Quick coupon tags */}
            {!appliedCoupon && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {['WELCOME50', 'BLINKIT100', 'SUPER20'].map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCouponCode(code);
                    }}
                    className="text-[10px] font-mono font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-2 py-0.5 rounded-md border border-slate-200/60"
                  >
                    #{code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Bill Details</h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900">
                  {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee.toFixed(2)}`}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>To Pay</span>
                <span className="text-emerald-700">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddressId}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <span>Place Order · ₹{finalTotal.toFixed(0)}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

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
