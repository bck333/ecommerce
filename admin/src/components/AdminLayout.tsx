import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  TicketPercent,
  Image,
  MapPin,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Bell,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Orders', path: '/orders', icon: Package },
  { name: 'Products Catalog', path: '/products', icon: ShoppingBag },
  { name: 'Categories', path: '/categories', icon: Layers },
  { name: 'Coupons & Promos', path: '/coupons', icon: TicketPercent },
  { name: 'Home Banners', path: '/banners', icon: Image },
  { name: 'Delivery Areas', path: '/delivery-areas', icon: MapPin },
  { name: 'Customers', path: '/users', icon: Users },
];

export const AdminLayout: React.FC = () => {
  const { adminUser, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
            BC
          </div>
          <span className="font-bold text-lg tracking-tight">Blinkcart Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-slate-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Tag */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
                ⚡
              </div>
              <div>
                <h1 className="font-extrabold text-white text-lg tracking-tight leading-none">
                  blink<span className="text-emerald-400">cart</span>
                </h1>
                <span className="text-[10px] font-semibold tracking-wider text-emerald-400/90 uppercase">
                  Management Console
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
              Operations
            </p>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin info & Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-sm">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{adminUser?.name || 'Store Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{adminUser?.email || 'admin@grocery.com'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </a>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>API Gateway Live (Port 8080)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-700 block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[11px] text-slate-400">10-Minute Dark Store System</span>
            </div>

            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Customer Store</span>
            </a>
          </div>
        </header>

        {/* Page View Outlet */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
