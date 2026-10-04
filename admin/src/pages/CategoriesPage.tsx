import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminClient';
import { AdminCategory, CategoryForm, SubCategoryForm } from '../types/admin';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  FolderPlus,
  XCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AdminCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catOrder, setCatOrder] = useState(1);
  const [catSaving, setCatSaving] = useState(false);

  // Subcategory Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedParentCatId, setSelectedParentCatId] = useState<number>(0);
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subImage, setSubImage] = useState('');
  const [subOrder, setSubOrder] = useState(1);
  const [subSaving, setSubSaving] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<AdminCategory[]>('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddCategory = () => {
    setEditingCat(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=60');
    setCatOrder(categories.length + 1);
    setErrorMsg('');
    setIsCatModalOpen(true);
  };

  const openEditCategory = (cat: AdminCategory) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || '');
    setCatImage(cat.image);
    setCatOrder(cat.displayOrder || 1);
    setErrorMsg('');
    setIsCatModalOpen(true);
  };

  const openAddSubcategory = (catId: number) => {
    setSelectedParentCatId(catId);
    setSubName('');
    setSubSlug('');
    setSubImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=60');
    setSubOrder(1);
    setErrorMsg('');
    setIsSubModalOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category? All its subcategories will be removed!')) return;
    try {
      await adminApi.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await adminApi.delete(`/admin/subcategories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catImage.trim()) {
      setErrorMsg('Category name and image are required');
      return;
    }
    setCatSaving(true);
    setErrorMsg('');

    try {
      const payload: CategoryForm = {
        name: catName.trim(),
        slug: catSlug.trim() || undefined,
        description: catDesc.trim() || undefined,
        image: catImage.trim(),
        displayOrder: Number(catOrder),
        active: true,
      };

      if (editingCat) {
        await adminApi.put(`/admin/categories/${editingCat.id}`, payload);
      } else {
        await adminApi.post('/admin/categories', payload);
      }

      setIsCatModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save category');
    } finally {
      setCatSaving(false);
    }
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !selectedParentCatId) {
      setErrorMsg('Subcategory name is required');
      return;
    }
    setSubSaving(true);
    setErrorMsg('');

    try {
      const payload: SubCategoryForm = {
        categoryId: selectedParentCatId,
        name: subName.trim(),
        slug: subSlug.trim() || undefined,
        image: subImage.trim() || undefined,
        displayOrder: Number(subOrder),
        active: true,
      };

      await adminApi.post('/admin/subcategories', payload);
      setIsSubModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create subcategory');
    } finally {
      setSubSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Category Structure</h1>
          <p className="text-xs text-slate-500 mt-0.5">Organize aisles, categories, and subcategories for instant navigation</p>
        </div>
        <button
          onClick={openAddCategory}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse h-48"></div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-slate-100">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">No categories found</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cat Top */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 p-2 flex items-center justify-center shrink-0">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">/{cat.slug}</p>
                      <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 inline-block">
                        Order #{cat.displayOrder}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {cat.description && (
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2">{cat.description}</p>
                )}

                {/* Subcategories list */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      Subcategories ({cat.subcategories?.length || 0})
                    </span>
                    <button
                      onClick={() => openAddSubcategory(cat.id)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Sub</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      cat.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="group inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200"
                        >
                          <span>{sub.name}</span>
                          <button
                            onClick={() => handleDeleteSubcategory(sub.id)}
                            className="text-slate-300 hover:text-rose-600 transition"
                            title="Remove Subcategory"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No subcategories defined</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              {editingCat ? 'Edit Category' : 'Create Category'}
            </h2>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Dairy, Bread & Eggs"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Image URL *</label>
                <input
                  type="text"
                  required
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Display Order</label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  {catSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Add Subcategory</h2>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveSubcategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Milk & Cream"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Display Order</label>
                <input
                  type="number"
                  value={subOrder}
                  onChange={(e) => setSubOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  {subSaving ? 'Saving...' : 'Add Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
