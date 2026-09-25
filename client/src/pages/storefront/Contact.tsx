import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Store, CheckCircle, MessageCircle } from 'lucide-react';
import { contactAPI } from '../../services/api';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await contactAPI.submit(form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || t('contact.error'));
    } finally {
      setSending(false);
    }
  };

  const infoCards = [
    { icon: Mail, label: t('contact.emailLabel'), value: 'info@adopalmwinery.com' },
    { icon: MapPin, label: t('contact.locationLabel'), value: t('contact.locationValue') },
    { icon: Store, label: t('contact.wholesaleLabel'), value: t('contact.wholesaleValue') },
    { icon: MessageCircle, label: 'WhatsApp', value: '+506 7157 7049', href: 'https://wa.me/50671577049', sub: t('contact.directLine') },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#fdf3d8] to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {t('contact.title')}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {infoCards.map(({ icon: Icon, label, value, href, sub }) => {
            const card = (
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center h-full">
                <div className="w-10 h-10 mx-auto rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
                  <Icon size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="mt-1 text-sm text-gray-800">{value}</p>
                {sub && <p className="text-xs text-gray-500">{sub}</p>}
              </div>
            );
            return href ? (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="block hover:shadow-md transition-shadow rounded-xl">
                {card}
              </a>
            ) : (
              <div key={label}>{card}</div>
            );
          })}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">{t('contact.formTitle')}</h2>

          {sent ? (
            <div className="flex items-center gap-3 bg-green-50 text-green-800 rounded-lg px-4 py-4">
              <CheckCircle size={20} />
              <p className="text-sm font-medium">{t('contact.success')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('contact.name')}</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('contact.email')}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('contact.subject')}</label>
                <input
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('contact.message')}</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {sending ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
