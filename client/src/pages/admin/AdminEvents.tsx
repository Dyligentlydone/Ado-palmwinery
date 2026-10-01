import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, EyeOff, Eye, Calendar, Tag, Image as ImageIcon, X } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface AdminEvent {
  id: string;
  slug: string;
  title: string;
  titleEs: string | null;
  excerpt: string | null;
  excerptEs: string | null;
  body: string;
  bodyEs: string | null;
  imageUrl: string | null;
  isPromotion: boolean;
  isPublished: boolean;
  publishedAt: string;
}

const emptyForm = {
  title: '',
  titleEs: '',
  excerpt: '',
  excerptEs: '',
  body: '',
  bodyEs: '',
  imageUrl: '',
  isPromotion: false,
  isPublished: true,
  publishedAt: new Date().toISOString().slice(0, 10),
  slug: '',
};

export default function AdminEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageLibrary, setImageLibrary] = useState<string[]>([]);
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    adminAPI.listEvents()
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
    setErr('');
  };

  const openEdit = (ev: AdminEvent) => {
    setForm({
      title: ev.title,
      titleEs: ev.titleEs || '',
      excerpt: ev.excerpt || '',
      excerptEs: ev.excerptEs || '',
      body: ev.body,
      bodyEs: ev.bodyEs || '',
      imageUrl: ev.imageUrl || '',
      isPromotion: ev.isPromotion,
      isPublished: ev.isPublished,
      publishedAt: ev.publishedAt.slice(0, 10),
      slug: ev.slug,
    });
    setEditing(ev.id);
    setErr('');
  };

  const openPicker = async () => {
    if (!imageLibrary.length) {
      try {
        const r = await adminAPI.listProductImages();
        setImageLibrary(r.data);
      } catch { /* ignore */ }
    }
    setPicker(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    const payload: Record<string, unknown> = { ...form };
    if (!payload.titleEs) payload.titleEs = null;
    if (!payload.excerpt) payload.excerpt = null;
    if (!payload.excerptEs) payload.excerptEs = null;
    if (!payload.bodyEs) payload.bodyEs = null;
    if (!payload.imageUrl) payload.imageUrl = null;
    if (!payload.slug) delete payload.slug;
    try {
      if (editing === 'new') {
        await adminAPI.createEvent(payload);
      } else if (editing) {
        await adminAPI.updateEvent(editing, payload);
      }
      setEditing(null);
      load();
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await adminAPI.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events & Promotions</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-lg h-16 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No events yet. Create your first one.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {events.map(ev => (
            <div key={ev.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
              <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {ev.imageUrl ? (
                  <img src={ev.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate flex items-center gap-2">
                  {ev.title}
                  {!ev.isPublished && <span className="text-[10px] font-semibold uppercase bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Draft</span>}
                  {ev.isPromotion && <span className="text-[10px] font-semibold uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Promo</span>}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                  <Calendar size={11} /> {new Date(ev.publishedAt).toLocaleDateString()} <span>·</span> /{ev.slug}
                </p>
              </div>
              <button onClick={() => openEdit(ev)} className="p-2 text-gray-400 hover:text-primary-600">
                <Pencil size={16} />
              </button>
              <button onClick={() => remove(ev.id)} className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">{editing === 'new' ? 'New Event' : 'Edit Event'}</h2>
              <button onClick={() => setEditing(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              {err && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{err}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (EN)</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (ES)</label>
                  <input value={form.titleEs} onChange={e => setForm({ ...form, titleEs: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (EN)</label>
                  <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Short summary shown in the list" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (ES)</label>
                  <textarea value={form.excerptEs} onChange={e => setForm({ ...form, excerptEs: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body (EN)</label>
                  <textarea required value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={8} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body (ES)</label>
                  <textarea value={form.bodyEs} onChange={e => setForm({ ...form, bodyEs: e.target.value })} rows={8} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="Optional" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="/images/products/..." />
                  <button type="button" onClick={openPicker} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Browse</button>
                </div>
                {form.imageUrl && (
                  <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.publishedAt} onChange={e => setForm({ ...form, publishedAt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="auto from title" />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.isPromotion} onChange={e => setForm({ ...form, isPromotion: e.target.checked })} />
                    <Tag size={14} /> Promotion / Upcoming
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
                    {form.isPublished ? <Eye size={14} /> : <EyeOff size={14} />} Published
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>

            {picker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 sticky top-0 bg-white">
                    <h3 className="font-semibold">Image Library</h3>
                    <button onClick={() => setPicker(false)} className="p-1 text-gray-400 hover:text-gray-700">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {imageLibrary.map(url => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => { setForm({ ...form, imageUrl: url }); setPicker(false); }}
                        className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {imageLibrary.length === 0 && <p className="col-span-full text-center text-gray-500 py-8">No images found</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
