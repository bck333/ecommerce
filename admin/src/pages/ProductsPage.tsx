import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminClient';
import { AdminProduct, AdminCategory, ProductForm } from '../types/admin';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  Tag,
  DollarSign,
  Package,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>(undefined);
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [unit, setUnit] = useState('pack');
  const [quantity, setQuantity] = useState('1 unit');
  const [stockQuantity, setStockQuantity] = useState(50);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await adminApi.get<AdminCategory[]>('/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !categoryId) {
        setCategoryId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<{
        success: boolean;
        data: { content: AdminProduct[] };
      }>('/products', {
        params: { size: 100 },
      });
      if (res.data.success && res.data.data) {
        setProducts(res.data.data.content);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setSubcategoryId(undefined);
    setBrand('');
    setSku(`SKU-${Date.now().toString().slice(-6)}`);
    setPrice('');
    setMrp('');
    setUnit('pack');
    setQuantity('1 pack');
    setStockQuantity(50);
    setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60');
    setDescription('');
    setFeatured(false);
    setActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: AdminProduct) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setSubcategoryId(prod.subcategoryId);
    setBrand(prod.brand || '');
    setSku(prod.sku);
    setPrice(prod.price.toString());
    setMrp(prod.mrp.toString());
    setUnit(prod.unit);
    setQuantity(prod.quantity);
    setStockQuantity(prod.stockQuantity);
    setImage(prod.image);
    setDescription(prod.description || '');
    setFeatured(prod.featured);
    setActive(prod.active !== false);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await adminApi.post<{ success: boolean; data: string }>(
        '/admin/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      if (res.data.success && res.data.data) {
        setImage(res.data.data);
      }
    } catch (err: any) {
      alert('Failed to upload image. Please provide a direct image URL.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !mrp || !sku.trim() || !image.trim() || !categoryId) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const payload: ProductForm = {
        name: name.trim(),
        categoryId,
        subcategoryId: subcategoryId || undefined,
        brand: brand.trim() || undefined,
        sku: sku.trim(),
        price: parseFloat(price),
        mrp: parseFloat(mrp),
        unit: unit.trim(),
        quantity: quantity.trim(),
        stockQuantity: Number(stockQuantity),
        image: image.trim(),
        description: description.trim() || undefined,
        featured,
        active,
      };

      if (editingProduct) {
        await adminApi.put(`/admin/products/${editingProduct.id}`, payload);
      } else {
        await adminApi.post('/admin/products', payload);
      }

      setIsModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' || p.categoryId.toString() === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedCategoryObj = categories.find((c) => c.id === Number(categoryId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grocery Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage stock, pricing, and 10-minute grocery inventory</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id.toString())}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === c.id.toString()
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, brand, SKU..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Pricing & MRP</th>
                <th className="px-5 py-3.5">Stock Quantity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-xs">
                    Loading catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    {/* Image & Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs line-clamp-1">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-400">{p.quantity}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({p.sku})</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-[11px]">
                        {p.categoryName}
                      </span>
                    </td>

                    {/* Price & MRP */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-slate-900">₹{p.price}</span>
                        {p.mrp > p.price && (
                          <span className="text-[11px] text-slate-400 line-through">₹{p.mrp}</span>
                        )}
                      </div>
                      {p.discountPercentage > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                          {p.discountPercentage}% OFF
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold text-xs ${
                            p.stockQuantity <= 10 ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {p.stockQuantity} units
                        </span>
                        {p.stockQuantity <= 10 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {p.inStock ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                          IN STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-md">
                          OUT OF STOCK
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Grocery Item' : 'Add New Grocery Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amul Taaza Fresh Toned Milk"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(Number(e.target.value));
                      setSubcategoryId(undefined);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Subcategory (Optional)
                  </label>
                  <select
                    value={subcategoryId || ''}
                    onChange={(e) =>
                      setSubcategoryId(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">None</option>
                    {selectedCategoryObj?.subcategories?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Amul, Britannia, Nestlé"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="28"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Package Quantity Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 500 ml, 1 kg, 4 pcs"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Inventory Stock Count *
                  </label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Product Image URL *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <label className="shrink-0 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nutritional facts, freshness highlights..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span>Feature on Homepage deals</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span>Active in customer store</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
