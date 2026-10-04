import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import api from '../api/client';
import { Category, Product, SubCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const catRes = await api.get<{ success: boolean; data: Category }>(`/categories/${slug}`);
        if (catRes.data.success && catRes.data.data) {
          const cat = catRes.data.data;
          setCategory(cat);
          setSubcategories(cat.subcategories || []);
          setSelectedSubId(null);
        }
      } catch (err) {
        console.error('Failed to load category', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;
      try {
        setLoading(true);
        const params: any = {
          categoryId: category.id,
          page: 0,
          size: 40,
          sortBy,
          sortDir,
        };

        if (selectedSubId) {
          params.subcategoryId = selectedSubId;
        }

        if (inStockOnly) {
          params.inStock = true;
        }

        const res = await api.get<{ success: boolean; data: { content: Product[] } }>('/products', { params });
        if (res.data.success && res.data.data) {
          setProducts(res.data.data.content);
        }
      } catch (err) {
        console.error('Failed to fetch category products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, selectedSubId, sortBy, sortDir, inStockOnly]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'price_asc') {
      setSortBy('price');
      setSortDir('asc');
    } else if (val === 'price_desc') {
      setSortBy('price');
      setSortDir('desc');
    } else if (val === 'discount_desc') {
      setSortBy('discountPercentage');
      setSortDir('desc');
    } else {
      setSortBy('id');
      setSortDir('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Category Hero Header */}
      {category && (
        <div className="flex items-center gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs mb-6">
          <img
            src={category.image}
            alt={category.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1">
              <Link to="/" className="hover:text-emerald-700">Home</Link>
              <span>/</span>
              <span>Categories</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{category.name}</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{category.description}</p>
          </div>
        </div>
      )}

      {/* Main Layout: Subcategory Sidebar Rail & Product Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Subcategory Rail */}
        <div className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Subcategories</h3>
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedSubId(null)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all shrink-0 ${
                  selectedSubId === null
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                All {category?.name}
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all shrink-0 ${
                    selectedSubId === sub.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filter Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filter & Sort</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sort By</label>
                <select
                  onChange={handleSortChange}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="default">Relevance / Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount_desc">Highest Discount</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-700">In Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
              <h4 className="font-bold text-base text-slate-800">No products found in this category</h4>
              <p className="text-xs text-slate-500 mt-1">Try changing subcategories or filter options</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpenDetail={(product) => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
