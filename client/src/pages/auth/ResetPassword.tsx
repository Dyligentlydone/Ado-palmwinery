import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../services/api';

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError(t('auth.passwordTooShort')); return; }
    if (newPassword !== confirm) { setError(t('auth.passwordMismatch')); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, newPassword);
      navigate('/login?reset=1');
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-gray-700 mb-4">{t('auth.resetInvalid')}</p>
          <Link to="/forgot-password" className="text-primary-600 font-medium hover:underline">{t('auth.forgotPassword')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="ADO Palmwinery" className="h-24 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {t('auth.resetTitle')}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="********"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? t('common.loading') : t('auth.resetPassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
