import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, ChevronRight, ShieldCheck, Clock } from 'lucide-react';
import api from '../api/client';
import { Banner, Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bannersRes, catRes, featRes, popRes] = await Promise.all([
          api.get<{ success: boolean; data: Banner[] }>('/banners'),
          api.get<{ success: boolean; data: Category[] }>('/categories'),
          api.get<{ success: boolean; data: Product[] }>('/products/featured'),
          api.get<{ success: boolean; data: Product[] }>('/products/popular'),
        ]);

        if (bannersRes.data.success) setBanners(bannersRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (featRes.data.success) setFeaturedProducts(featRes.data.data);
        if (popRes.data.success) setPopularProducts(popRes.data.data);
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen pb-16">
      {/* 1. Hero Promo Banner Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {banners.length > 0 && (
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 bg-slate-900 aspect-21/9 sm:aspect-24/8">
            <img
              src={banners[0].image}
              alt={banners[0].title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent flex items-center p-6 sm:p-12">
              <div className="max-w-xl text-white space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> 10-Minute Grocery Delivery
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  {banners[0].title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Fresh dairy, farm vegetables, ice-cold drinks & instant snacks delivered to your kitchen in minutes.
                </p>
                <div className="pt-2">
                  <Link
                    to="/category/vegetables-fruits"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Category Grid Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-xs text-slate-500 font-medium">Shop from our wide assortment of daily groceries</p>
          </div>
          <Link to="/categories" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center text-center p-2 rounded-2xl hover:bg-white hover:shadow-md hover:shadow-slate-200/60 border border-transparent hover:border-slate-200/80 transition-all duration-200"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 mb-2 border border-slate-200/50 p-1 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Super Deals & Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-amber-500 stroke-amber-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Super Deals & Discounts</h2>
              <p className="text-xs text-slate-500 font-medium">Unbeatable prices on daily essentials</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {featuredProducts.slice(0, 12).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. Second Banner / Coupon Teaser */}
      {banners.length > 1 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-lg text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Exclusive Coupon Offer
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                Use code <span className="text-amber-300 font-mono underline decoration-wavy">WELCOME50</span> for Flat ₹50 OFF
              </h3>
              <p className="text-xs text-emerald-100">
                Valid on your first grocery delivery above ₹249. Fast 10-minute dispatch.
              </p>
            </div>
            <Link
              to="/category/dairy-breakfast"
              className="px-6 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all shrink-0"
            >
              Order Groceries
            </Link>
          </div>
        </section>
      )}

      {/* 5. Best Seller Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Best Sellers in Your Area</h2>
            <p className="text-xs text-slate-500 font-medium">Top ordered items by customers nearby</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {popularProducts.slice(0, 12).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
