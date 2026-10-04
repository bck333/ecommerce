import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminClient';
import { AdminBanner, BannerForm } from '../types/admin';
import { Image, Plus, Trash2, ExternalLink, AlertCircle, Upload } from 'lucide-react';

export const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('/category/dairy-bread-eggs');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [active, setActive] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<{ success: boolean; data: AdminBanner[] }>('/admin/banners');
      if (res.data.success && res.data.data) {
        setBanners(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load banners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setTitle('');
    setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80');
    setLink('/category/dairy-bread-eggs');
    setDisplayOrder(banners.length + 1);
    setActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await adminApi.delete(`/admin/banners/${id}`);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete banner');
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
    } catch (err) {
      alert('Failed to upload image. Please provide a direct image URL.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      setErrorMsg('Title and image are required');
      return;
    }
    setSaving(true);
    setErrorMsg('');

    try {
      const payload: BannerForm = {
        title: title.trim(),
        image: image.trim(),
        link: link.trim() || undefined,
        displayOrder: Number(displayOrder),
        active,
      };

      await adminApi.post('/admin/banners', payload);
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Homepage Banners</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control visual promos, top deals, and instant grocery carousel slides</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse h-56"></div>
          ))
        ) : banners.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-slate-100">
            <Image className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No banners configured yet.</p>
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-36 w-full bg-slate-100 relative overflow-hidden">
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                    Order #{b.displayOrder}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-sm">{b.title}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{b.link || 'No target link'}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                  ACTIVE
                </span>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Add Promo Banner</h2>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Farm Fresh Mango Festival"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Image URL *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  <label className="shrink-0 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Link Destination</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/category/fresh-vegetables"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {saving ? 'Saving...' : 'Add Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
