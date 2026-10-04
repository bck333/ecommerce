import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Frown, Sparkles } from 'lucide-react';
import api from '../api/client';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const performSearch = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data: { content: Product[] } }>('/products/search', {
          params: { query: query.trim(), page: 0, size: 40 },
        });
        if (res.data.success && res.data.data) {
          setProducts(res.data.data.content);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  // Load popular recommendations when search is empty or has zero results
  useEffect(() => {
    api.get<{ success: boolean; data: Product[] }>('/products/popular')
      .then((res) => {
        if (res.data.success) setPopularProducts(res.data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Search Results for <span className="text-emerald-700">"{query}"</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {products.length} {products.length === 1 ? 'item found' : 'items found'} in 10-minute inventory
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpenDetail={(product) => setSelectedProduct(product)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <SearchIcon className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-base text-slate-800">No results found for "{query}"</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Please check your spelling or browse popular categories below.
            </p>
          </div>

          {/* Recommended fallback */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-base text-slate-900">You might be interested in</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {popularProducts.slice(0, 6).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpenDetail={(product) => setSelectedProduct(product)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
