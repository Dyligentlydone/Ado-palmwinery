import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, FolderOpen } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Product, Category } from '../../types';

interface AdminCategory extends Category {
  nameEs?: string;
  isActive: boolean;
  sortOrder: number;
}

interface ProductForm {
  name: string; nameEs: string; slug: string; description: string; descriptionEs: string;
  priceUSD: number; priceEUR: number; priceGBP: number; priceCRC: number; compareAtUSD: number;
  categoryId: string; sku: string; stock: number; weight: number;
  isActive: boolean; isFeatured: boolean; tags: string; images: string;
}

const emptyForm: ProductForm = {
  name: '', nameEs: '', slug: '', description: '', descriptionEs: '',
  priceUSD: 0, priceEUR: 0, priceGBP: 0, priceCRC: 0, compareAtUSD: 0,
  categoryId: '', sku: '', stock: 0, weight: 0,
  isActive: true, isFeatured: false, tags: '', images: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCats, setShowCats] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', nameEs: '', slug: '', sortOrder: 0, isActive: true });
  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    adminAPI.getProducts({ page, limit: 20 })
      .then(r => {
        setProducts(r.data.products);
        setTotalPages(r.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    adminAPI.getCategories().then(r => setCategories(r.data)).catch(() => {});
  };

  useEffect(() => { fetchProducts(); }, [page]);
  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, nameEs: (p as any).nameEs || '', slug: p.slug,
      description: p.description, descriptionEs: (p as any).descriptionEs || '',
      priceUSD: Number((p as any).priceUSD) || 0, priceEUR: (p as any).priceEUR || 0, priceGBP: (p as any).priceGBP || 0, priceCRC: (p as any).priceCRC || 0,
      compareAtUSD: p.compareAtUSD || 0, categoryId: p.categoryId, sku: p.sku,
      stock: p.stock, weight: p.weight || 0,
      isActive: p.isActive, isFeatured: p.isFeatured,
      tags: p.tags.join(', '), images: p.images.join('\n'),
    });
    setEditingId(p.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: form.images.split('\n').map(i => i.trim()).filter(Boolean),
      };
      if (editingId) {
        await adminAPI.updateProduct(editingId, data);
      } else {
        await adminAPI.createProduct(data);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const updateField = (field: keyof ProductForm, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const openCatEdit = (c: AdminCategory) => {
    setCatForm({ name: c.name, nameEs: c.nameEs || '', slug: c.slug, sortOrder: c.sortOrder ?? 0, isActive: c.isActive });
    setCatEditingId(c.id);
    setCatError('');
  };

  const resetCatForm = () => {
    setCatForm({ name: '', nameEs: '', slug: '', sortOrder: 0, isActive: true });
    setCatEditingId(null);
    setCatError('');
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatSaving(true);
    setCatError('');
    try {
      if (catEditingId) {
        await adminAPI.updateCategory(catEditingId, catForm);
      } else {
        await adminAPI.createCategory(catForm);
      }
      resetCatForm();
      fetchCategories();
    } catch (err: any) {
      setCatError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setCatSaving(false);
    }
  };

  const handleCatDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    setCatError('');
    try {
      await adminAPI.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      setCatError(err.response?.data?.error || 'Failed to delete category');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowCats(true); resetCatForm(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <FolderOpen size={16} /> Categories
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Categories Modal */}
      {showCats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Categories</h2>
              <button onClick={() => setShowCats(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {catError && <p className="text-sm text-red-600 mb-3">{catError}</p>}

            <div className="divide-y divide-gray-100 mb-5">
              {(categories as AdminCategory[]).map(c => (
                <div key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}
                      {!c.isActive && <span className="ml-2 text-xs text-gray-400">(inactive)</span>}
                    </p>
                    <p className="text-xs text-gray-400">{c.slug} · {c.productCount ?? 0} products</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openCatEdit(c)} className="p-1.5 text-gray-400 hover:text-primary-600"><Edit2 size={15} /></button>
                    <button onClick={() => handleCatDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-sm text-gray-500 py-4">No categories yet</p>}
            </div>

            <form onSubmit={handleCatSubmit} className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{catEditingId ? 'Edit Category' : 'New Category'}</p>
              <div className="grid grid-cols-2 gap-3">
                <input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required placeholder="Name" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={catForm.nameEs} onChange={e => setCatForm({ ...catForm, nameEs: e.target.value })} placeholder="Name (Spanish)" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value })} required placeholder="slug" className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" value={catForm.sortOrder} onChange={e => setCatForm({ ...catForm, sortOrder: +e.target.value })} placeholder="Sort order" className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={catForm.isActive} onChange={e => setCatForm({ ...catForm, isActive: e.target.checked })} /> Active
              </label>
              <div className="flex justify-end gap-3">
                {catEditingId && <button type="button" onClick={resetCatForm} className="px-4 py-2 text-sm text-gray-600">Cancel edit</button>}
                <button type="submit" disabled={catSaving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {catSaving ? 'Saving...' : catEditingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name (EN)</label>
                  <input value={form.name} onChange={e => updateField('name', e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name (ES)</label>
                  <input value={form.nameEs} onChange={e => updateField('nameEs', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                  <input value={form.slug} onChange={e => updateField('slug', e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">SKU</label>
                  <input value={form.sku} onChange={e => updateField('sku', e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description (EN)</label>
                <textarea value={form.description} onChange={e => updateField('description', e.target.value)} required rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description (ES)</label>
                <textarea value={form.descriptionEs} onChange={e => updateField('descriptionEs', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price USD</label>
                  <input type="number" step="0.01" value={form.priceUSD} onChange={e => updateField('priceUSD', +e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price EUR</label>
                  <input type="number" step="0.01" value={form.priceEUR} onChange={e => updateField('priceEUR', +e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price GBP</label>
                  <input type="number" step="0.01" value={form.priceGBP} onChange={e => updateField('priceGBP', +e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price CRC</label>
                  <input type="number" step="0.01" value={form.priceCRC} onChange={e => updateField('priceCRC', +e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Compare USD</label>
                  <input type="number" step="0.01" value={form.compareAtUSD} onChange={e => updateField('compareAtUSD', +e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select value={form.categoryId} onChange={e => updateField('categoryId', e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={e => updateField('stock', +e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
                  <input type="number" step="0.01" value={form.weight} onChange={e => updateField('weight', +e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Image URLs (one per line)</label>
                <textarea value={form.images} onChange={e => updateField('images', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="/images/products/example.jpg" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => updateField('tags', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="fresh, bestseller" />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={e => updateField('isActive', e.target.checked)} /> Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => updateField('isFeatured', e.target.checked)} /> Featured
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-lg h-14 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-right px-4 py-3 font-medium">Price</th>
                <th className="text-right px-4 py-3 font-medium">Stock</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg shrink-0 overflow-hidden">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">🌴</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category?.name}</td>
                  <td className="px-4 py-3 text-right font-medium">${Number((product as any).priceUSD ?? product.price ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={product.stock <= 0 ? 'text-red-600 font-medium' : product.stock < 10 ? 'text-yellow-600' : 'text-gray-700'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="p-1.5 text-gray-400 hover:text-primary-600">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
