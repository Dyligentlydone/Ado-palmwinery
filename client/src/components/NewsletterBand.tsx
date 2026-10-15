import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';

export default function NewsletterBand() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`);
  };

  return (
    <section className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 pb-10 -mt-2 text-center">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
        {t('newsletter.title')}
      </h2>
      <p className="mt-1.5 text-sm text-gray-600">{t('newsletter.subtitle')}</p>
      <form onSubmit={submit} className="mt-4 flex gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('newsletter.placeholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 bg-primary-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-700 transition-colors"
        >
          {t('newsletter.button')}
        </button>
      </form>
    </section>
  );
}
