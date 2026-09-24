import { useEffect, useState } from 'react';
import { Plus, Edit2, X, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  baseCost: number;
  perKgCost: number;
  currency: string;
  estimatedDays: string;
  isActive: boolean;
}

export default function AdminShipping() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', countries: '', baseCost: 0, perKgCost: 0,
    currency: 'USD', estimatedDays: '', isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchZones = () => {
    setLoading(true);
    adminAPI.getShippingZones()
      .then(r => setZones(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchZones(); }, []);

  const openEdit = (z: ShippingZone) => {
    setForm({
      name: z.name, countries: z.countries.join(', '),
      baseCost: Number(z.baseCost), perKgCost: Number(z.perKgCost),
      currency: z.currency, estimatedDays: z.estimatedDays, isActive: z.isActive,
    });
    setEditingId(z.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        countries: form.countries.split(',').map(c => c.trim()).filter(Boolean),
      };
      if (editingId) {
        await adminAPI.updateShippingZone(editingId, data);
      } else {
        await adminAPI.createShippingZone(data);
      }
      setShowForm(false);
      fetchZones();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shipping zone?')) return;
    try {
      await adminAPI.deleteShippingZone(id);
      fetchZones();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipping Zones</h1>
        <button
          onClick={() => { setForm({ name: '', countries: '', baseCost: 0, perKgCost: 0, currency: 'USD', estimatedDays: '', isActive: true }); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
        >
          <Plus size={16} /> Add Zone
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Zone' : 'New Zone'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Countries (comma-separated ISO codes)</label>
                <input value={form.countries} onChange={e => setForm({ ...form, countries: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="US, CA, MX" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Base Cost</label>
                  <input type="number" step="0.01" value={form.baseCost} onChange={e => setForm({ ...form, baseCost: +e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Per Kg</label>
                  <input type="number" step="0.01" value={form.perKgCost} onChange={e => setForm({ ...form, perKgCost: +e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>USD</option><option>EUR</option><option>GBP</option><option>CRC</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Estimated Days</label>
                <input value={form.estimatedDays} onChange={e => setForm({ ...form, estimatedDays: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="5-7 business days" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-lg h-16 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Zone</th>
                <th className="text-left px-4 py-3 font-medium">Countries</th>
                <th className="text-right px-4 py-3 font-medium">Base Cost</th>
                <th className="text-right px-4 py-3 font-medium">Per Kg</th>
                <th className="text-left px-4 py-3 font-medium">Delivery</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {zones.map(z => (
                <tr key={z.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{z.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{z.countries.join(', ')}</td>
                  <td className="px-4 py-3 text-right">{z.currency} {Number(z.baseCost).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{z.currency} {Number(z.perKgCost).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">{z.estimatedDays}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${z.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {z.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(z)} className="p-1.5 text-gray-400 hover:text-primary-600">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(z.id)} className="p-1.5 text-gray-400 hover:text-red-600">
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
    </div>
  );
}
