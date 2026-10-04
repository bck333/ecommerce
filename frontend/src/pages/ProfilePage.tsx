import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, MapPin, Package, ShieldCheck, LogOut, CheckCircle2, ChevronRight } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateProfile, logout, openLoginModal } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Account</h2>
        <p className="text-gray-600 mb-6 text-sm">Please log in with your phone number to access your account details, saved addresses, and previous orders.</p>
        <button
          onClick={openLoginModal}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-md"
        >
          Login with Mobile OTP
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateProfile(name.trim(), email.trim());
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">My Profile</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar Profile summary & Navigation */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3 shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : user.mobileNumber.slice(-2)}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{user.name || 'Valued Shopper'}</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">+91 {user.mobileNumber}</p>
            <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Account
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <nav className="divide-y divide-gray-100">
              <Link
                to="/orders"
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition text-gray-700 hover:text-emerald-700 font-medium text-sm"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span>My Orders</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/addresses"
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition text-gray-700 hover:text-emerald-700 font-medium text-sm"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>Saved Addresses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-red-600 transition font-medium text-sm text-left"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Personal Details</h1>
            <p className="text-xs text-gray-500 mb-6">Manage your contact details and account preferences</p>

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={`+91 ${user.mobileNumber}`}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 font-mono cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Mobile number is linked to your primary account authentication</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com for order receipts"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
