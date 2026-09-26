import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Pencil, Trash2, Star, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Address } from '../../types';

const COUNTRIES: { code: string; name: string }[] = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'MX', name: 'Mexico' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'BZ', name: 'Belize' },
  { code: 'HN', name: 'Honduras' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panama' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AT', name: 'Austria' },
  { code: 'IE', name: 'Ireland' },
  { code: 'FI', name: 'Finland' },
  { code: 'GR', name: 'Greece' },
];

const emptyAddress = {
  label: '', firstName: '', lastName: '', street: '',
  city: '', state: '', postalCode: '', country: '', phone: '', isDefault: false,
};

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function Account() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone || '');
    authAPI.getProfile().then(r => setAddresses(r.data.addresses || []));
  }, [user, authLoading, navigate]);

  const saveProfile = async () => {
    try {
      await authAPI.updateProfile({ firstName, lastName, phone: phone || undefined });
      setProfileMsg(t('account.profileSaved'));
      setTimeout(() => setProfileMsg(''), 3000);
    } catch {
      setProfileMsg(t('common.error'));
    }
  };

  const field = (key: keyof typeof emptyAddress) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  const openNew = () => {
    setForm({ ...emptyAddress, firstName, lastName });
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEdit = (addr: Address) => {
    setForm({
      label: addr.label || '', firstName: addr.firstName, lastName: addr.lastName,
      street: addr.street, city: addr.city, state: addr.state || '',
      postalCode: addr.postalCode, country: addr.country, phone: addr.phone || '',
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
    setError('');
  };

  const saveAddress = async () => {
    if (!form.firstName || !form.lastName || !form.street || !form.city || !form.postalCode || !form.country) {
      setError(t('checkout.fillDetails'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = { ...form, label: form.label || undefined, state: form.state || undefined, phone: form.phone || undefined };
      if (editingId) {
        const res = await authAPI.updateAddress(editingId, data);
        setAddresses(addrs => addrs.map(a => {
          if (a.id === editingId) return res.data;
          if (res.data.isDefault) return { ...a, isDefault: false };
          return a;
        }));
      } else {
        const res = await authAPI.createAddress(data);
        setAddresses(addrs => {
          const next = res.data.isDefault ? addrs.map(a => ({ ...a, isDefault: false })) : addrs;
          return [...next, res.data];
        });
      }
      setShowForm(false);
      setEditingId(null);
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.error || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    try {
      await authAPI.deleteAddress(id);
      setAddresses(addrs => addrs.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    }
  };

  const setDefault = async (id: string) => {
    try {
      await authAPI.updateAddress(id, { isDefault: true });
      setAddresses(addrs => addrs.map(a => ({ ...a, isDefault: a.id === id })));
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    }
  };

  if (authLoading || !user) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">{t('common.loading')}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-[family-name:var(--font-heading)]">
        {t('account.title')}
      </h1>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <User size={20} className="text-primary-600" /> {t('account.profile')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t('auth.firstName')} className={inputCls} />
          <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t('auth.lastName')} className={inputCls} />
          <input value={user.email} disabled className={`${inputCls} bg-gray-50 text-gray-400`} />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('auth.phone')} className={inputCls} />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={saveProfile} className="px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700">
            {t('common.save')}
          </button>
          {profileMsg && <span className="text-sm text-accent-600">{profileMsg}</span>}
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <MapPin size={20} className="text-primary-600" /> {t('account.addresses')}
          </h2>
          {!showForm && (
            <button onClick={openNew} className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:underline">
              <Plus size={16} /> {t('account.addAddress')}
            </button>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {addresses.length === 0 && !showForm && (
          <p className="text-gray-500 text-sm">{t('account.noAddresses')}</p>
        )}

        <div className="space-y-3 mb-4">
          {addresses.map(addr => (
            <div key={addr.id} className="flex items-start justify-between p-4 rounded-lg border border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">
                    {addr.label || `${addr.firstName} ${addr.lastName}`}
                  </p>
                  {addr.isDefault && (
                    <span className="text-xs bg-accent-100 text-accent-700 font-semibold px-2 py-0.5 rounded-full">
                      {t('account.default')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{addr.firstName} {addr.lastName}</p>
                <p className="text-sm text-gray-600">{addr.street}</p>
                <p className="text-sm text-gray-600">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                <p className="text-sm text-gray-600">{addr.country}</p>
              </div>
              <div className="flex items-center gap-1">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} title={t('account.setDefault')} className="p-1.5 text-gray-400 hover:text-accent-600">
                    <Star size={16} />
                  </button>
                )}
                <button onClick={() => openEdit(addr)} className="p-1.5 text-gray-400 hover:text-primary-600">
                  <Pencil size={16} />
                </button>
                <button onClick={() => removeAddress(addr.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Address form */}
        {showForm && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">{editingId ? t('account.editAddress') : t('account.newAddress')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder={t('account.label')} {...field('label')} className={inputCls} />
              <input placeholder={`${t('auth.phone')} (${t('checkout.optional')})`} {...field('phone')} className={inputCls} />
              <input required placeholder={t('auth.firstName')} {...field('firstName')} className={inputCls} />
              <input required placeholder={t('auth.lastName')} {...field('lastName')} className={inputCls} />
              <input required placeholder={t('checkout.street')} {...field('street')} className={`${inputCls} sm:col-span-2`} />
              <input required placeholder={t('checkout.city')} {...field('city')} className={inputCls} />
              <input placeholder={t('checkout.state')} {...field('state')} className={inputCls} />
              <input required placeholder={t('checkout.postalCode')} {...field('postalCode')} className={inputCls} />
              <select
                required
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                className={`${inputCls} ${form.country ? '' : 'text-gray-400'}`}
              >
                <option value="">{t('checkout.country')}</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 mt-4 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                className="rounded"
              />
              {t('account.setDefault')}
            </label>
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveAddress}
                disabled={saving}
                className="px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? t('common.loading') : t('common.save')}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setError(''); }}
                className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link to="/orders" className="text-sm text-primary-600 hover:underline">{t('nav.myOrders')} →</Link>
      </div>
    </div>
  );
}
