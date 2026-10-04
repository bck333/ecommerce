import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Clock, Award, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-100">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">10-Minute Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5">Lightning fast local store fulfillment at your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Best Price & Offers</h4>
              <p className="text-xs text-slate-500 mt-0.5">Direct procurement discounts on fresh groceries daily</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Wide Assortment</h4>
              <p className="text-xs text-slate-500 mt-0.5">5,000+ products across vegetables, dairy, snacks & household</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-black text-xl text-slate-900">blink<span className="text-emerald-600">cart</span></span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              India's favorite 10-minute grocery delivery platform. Fresh vegetables, dairy, snacks, and home essentials.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">Popular Categories</h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/category/vegetables-fruits" className="hover:text-emerald-600 transition-colors">Vegetables & Fruits</Link></li>
              <li><Link to="/category/dairy-breakfast" className="hover:text-emerald-600 transition-colors">Dairy & Breakfast</Link></li>
              <li><Link to="/category/munchies-snacks" className="hover:text-emerald-600 transition-colors">Munchies & Snacks</Link></li>
              <li><Link to="/category/cold-drinks-juices" className="hover:text-emerald-600 transition-colors">Cold Drinks & Juices</Link></li>
              <li><Link to="/category/atta-rice-dal" className="hover:text-emerald-600 transition-colors">Atta, Rice & Dal</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">Customer Support</h5>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/orders" className="hover:text-emerald-600 transition-colors">Track Orders</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-600 transition-colors">Your Profile</Link></li>
              <li><Link to="/addresses" className="hover:text-emerald-600 transition-colors">Delivery Addresses</Link></li>
              <li><span className="text-slate-400">help@blinkcart.com</span></li>
              <li><span className="text-slate-400">Call: 1800-123-4567</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">Admin Portal</h5>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Store managers and logistics operators access the unified administration portal.
            </p>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>Open Admin Panel</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Blinkcart Technologies Pvt Ltd. All rights reserved.</p>
          <p className="font-medium text-slate-500">Fast 10-Minute Grocery Delivery</p>
        </div>
      </div>
    </footer>
  );
};
