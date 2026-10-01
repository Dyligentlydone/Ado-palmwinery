import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Tab = 'login' | 'register';

export default function Login() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [tab, setTab] = useState<Tab>(pathname === '/register' ? 'register' : 'login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwLogin, setShowPwLogin] = useState(false);

  // register state
  const [reg, setReg] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPwReg, setShowPwReg] = useState(false);
  const [showPwRegConfirm, setShowPwRegConfirm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (reg.password.length < 8) { setError(t('auth.passwordTooShort')); return; }
    if (reg.password !== reg.confirmPassword) { setError(t('auth.passwordMismatch')); return; }
    setLoading(true);
    try {
      await register({ email: reg.email, password: reg.password, firstName: reg.firstName, lastName: reg.lastName });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0] || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const pwInputCls = 'w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500';
  const eyeBtnCls = 'absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="ADO Palmwinery" className="h-24 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {tab === 'login' ? t('auth.login') : t('auth.register')}
          </h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-gray-100 text-sm font-semibold">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); }}
              className={`py-3 transition-colors ${tab === 'login' ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/40' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('auth.signInTab')}
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); }}
              className={`py-3 transition-colors ${tab === 'register' ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/40' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('auth.registerTab')}
            </button>
          </div>

          <div className="p-8">
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

            {tab === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                  <div className="relative">
                    <input
                      type={showPwLogin ? 'text' : 'password'}
                      required value={password} onChange={e => setPassword(e.target.value)}
                      className={pwInputCls}
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwLogin(v => !v)}
                      aria-label={showPwLogin ? t('auth.hidePassword') : t('auth.showPassword')}
                      className={eyeBtnCls}
                    >
                      {showPwLogin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? t('common.loading') : t('auth.signIn')}
                </button>
                <p className="text-center text-sm mt-4">
                  <Link to="/forgot-password" className="text-primary-600 hover:underline">{t('auth.forgotPassword')}</Link>
                </p>
                <p className="text-center text-sm text-gray-500 mt-3">
                  {t('auth.notMember')}{' '}
                  <button type="button" onClick={() => { setTab('register'); setError(''); }} className="text-primary-600 font-medium hover:underline">
                    {t('auth.signUp')}
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.firstName')}</label>
                    <input
                      type="text" required value={reg.firstName} onChange={e => setReg({ ...reg, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.lastName')}</label>
                    <input
                      type="text" required value={reg.lastName} onChange={e => setReg({ ...reg, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                  <input
                    type="email" required value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                  <div className="relative">
                    <input
                      type={showPwReg ? 'text' : 'password'}
                      required minLength={8}
                      value={reg.password} onChange={e => setReg({ ...reg, password: e.target.value })}
                      className={pwInputCls}
                      placeholder={t('auth.passwordTooShort')}
                    />
                    <button
                      type="button" onClick={() => setShowPwReg(v => !v)}
                      aria-label={showPwReg ? t('auth.hidePassword') : t('auth.showPassword')}
                      className={eyeBtnCls}
                    >
                      {showPwReg ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPasswordLabel')}</label>
                  <div className="relative">
                    <input
                      type={showPwRegConfirm ? 'text' : 'password'}
                      required minLength={8}
                      value={reg.confirmPassword} onChange={e => setReg({ ...reg, confirmPassword: e.target.value })}
                      className={pwInputCls}
                    />
                    <button
                      type="button" onClick={() => setShowPwRegConfirm(v => !v)}
                      aria-label={showPwRegConfirm ? t('auth.hidePassword') : t('auth.showPassword')}
                      className={eyeBtnCls}
                    >
                      {showPwRegConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? t('common.loading') : t('auth.signUp')}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  {t('auth.hasAccount')}{' '}
                  <button type="button" onClick={() => { setTab('login'); setError(''); }} className="text-primary-600 font-medium hover:underline">
                    {t('auth.signIn')}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
