import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';

export default function ChangePassword() {
  const { t } = useTranslation();
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPassword.length < 8) { setMsg({ ok: false, text: t('auth.passwordTooShort') }); return; }
    if (newPassword !== confirm) { setMsg({ ok: false, text: t('auth.passwordMismatch') }); return; }
    setSaving(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setMsg({ ok: true, text: t('auth.passwordChanged') });
      setCurrent(''); setNew(''); setConfirm('');
    } catch (err: any) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('auth.changePassword')}</h2>
      {msg && (
        <div className={`${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'} text-sm rounded-lg p-3 mb-4`}>{msg.text}</div>
      )}
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="password" required minLength={8}
          value={currentPassword} onChange={e => setCurrent(e.target.value)}
          placeholder={t('auth.currentPassword')}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <input
          type="password" required minLength={8}
          value={newPassword} onChange={e => setNew(e.target.value)}
          placeholder={t('auth.newPassword')}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <input
          type="password" required minLength={8}
          value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder={t('auth.confirmPassword')}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <div className="md:col-span-3">
          <button
            type="submit" disabled={saving}
            className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? t('common.loading') : t('auth.changePassword')}
          </button>
        </div>
      </form>
    </div>
  );
}
