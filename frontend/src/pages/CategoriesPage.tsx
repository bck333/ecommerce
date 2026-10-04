import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Category } from '../types';
import { ChevronRight, Layers, Sparkles } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCategories = async () => {
      try {
        const res = await api.get<Category[]>('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">All Categories</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore Grocery Categories</h1>
            <p className="text-sm text-gray-600">Fresh farm produce, dairy, pantry staples and daily essentials delivered in 10 minutes</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-center p-2 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/category/${cat.slug}`}
                      className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1"
                    >
                      {cat.name}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{cat.description}</p>
                  </div>
                </div>

                {/* Subcategories list */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subcategories</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/category/${cat.slug}?sub=${sub.slug}`}
                          className="px-2.5 py-1 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 text-xs rounded-lg transition-colors font-medium border border-gray-200/60"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-emerald-600 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Delivered in 10 mins
                </span>
                <Link
                  to={`/category/${cat.slug}`}
                  className="hover:underline flex items-center gap-0.5"
                >
                  View All Products &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
