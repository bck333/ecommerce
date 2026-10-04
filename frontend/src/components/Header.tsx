import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  MapPin,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Package,
  Clock,
  Sparkles,
  Menu,
  X,
  Mic,
  MicOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();
  const { cart, openCart } = useCart();
  const { pincode, city, deliveryTime, openLocationModal } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onResult: (spokenText) => {
      if (spokenText.trim()) {
        setSearchQuery(spokenText.trim());
        navigate(`/search?q=${encodeURIComponent(spokenText.trim())}`);
      }
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 md:gap-8">
          {/* Logo & Delivery Time */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight text-slate-900 leading-none">
                  blink<span className="text-emerald-600">cart</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase mt-0.5">
                  10 Minute Grocery
                </span>
              </div>
            </Link>

            {/* Location & Speed Tag */}
            <button
              onClick={openLocationModal}
              className="hidden lg:flex flex-col text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              {localStorage.getItem('delivery_pincode') ? (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Delivery in {deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[130px]">{city} - {pincode}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                    <span className="text-rose-500">Location Required</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <span>Please select delivery location</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Search Bar with Speech Recognition */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isListening ? '🎙️ Listening... speak now' : 'Search for "milk", "tomato", "chips", "atta"...'}
                className={`w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-100/80 border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all ${
                  isListening ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/30' : 'border-slate-200/60'
                }`}
              />
              <button
                type="button"
                onClick={handleVoiceToggle}
                title={isListening ? 'Stop listening' : 'Search by voice'}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 animate-pulse'
                    : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60'
                }`}
              >
                {isListening ? (
                  <Mic className="w-4 h-4 text-white animate-bounce" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          {/* Right Actions: Login & Cart */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User Account */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-800"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name || user?.mobileNumber}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Customer'}</p>
                      <p className="text-xs text-slate-500 font-mono">{user?.mobileNumber}</p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/addresses"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Saved Addresses</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profile Details</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Login
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={openCart}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                cart.totalItems > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.totalItems}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[11px] font-medium opacity-90">
                  {cart.totalItems > 0 ? `${cart.totalItems} items` : 'My Cart'}
                </span>
                {cart.totalItems > 0 && (
                  <span className="text-xs font-black">₹{cart.totalAmount.toFixed(0)}</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Location row */}
        <div className="lg:hidden py-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button onClick={openLocationModal} className="flex items-center gap-1.5 font-bold text-slate-800">
            {localStorage.getItem('delivery_pincode') ? (
              <>
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>10 Mins to {city} ({pincode})</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                <span className="text-rose-500">Select Location</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <Sparkles className="w-3 h-3" />
            <span>Free delivery above ₹199</span>
          </div>
        </div>
      </div>
    </header>
  );
};
