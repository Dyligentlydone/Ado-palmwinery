import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../services/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
    } catch {
      // API responds identically on success/failure; treat any error as sent too
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="ADO Palmwinery" className="h-24 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {t('auth.forgotTitle')}
          </h1>
          <p className="text-gray-500 mt-2">{t('auth.forgotSubtitle')}</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-700 mb-4">{t('auth.forgotSent')}</p>
            <Link to="/login" className="text-primary-600 font-medium hover:underline">{t('common.back')} &rarr;</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? t('common.loading') : t('auth.sendResetLink')}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-primary-600 hover:underline">&larr; {t('auth.login')}</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
