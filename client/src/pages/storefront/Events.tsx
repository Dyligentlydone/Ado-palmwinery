import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CalendarDays, Mail } from 'lucide-react';
import { eventsAPI } from '../../services/api';

interface EventItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: string;
  isPromotion: boolean;
}

export default function Events() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsAPI.list()
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#fdf3d8] via-[#fbe8c5] to-white py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {t('events.title')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('events.subtitle')}</p>
        </div>
      </section>

      {/* List */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-56 animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500">{t('events.empty')}</p>
        ) : (
          <div className="space-y-8">
            {events.map(ev => (
              <Link
                key={ev.id}
                to={`/events/${ev.slug}`}
                className="group block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow sm:flex"
              >
                {ev.imageUrl && (
                  <div className="sm:w-2/5 h-56 sm:h-auto overflow-hidden">
                    <img
                      src={ev.imageUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 sm:p-8 sm:w-3/5 flex flex-col">
                  <span className="self-start text-xs font-semibold uppercase tracking-wider bg-primary-600/10 text-primary-700 px-3 py-1 rounded-full">
                    {ev.isPromotion ? t('events.upcomingKicker') : t('events.pastKicker')}
                  </span>
                  <h2 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors font-[family-name:var(--font-heading)] leading-snug">
                    {ev.title}
                  </h2>
                  {ev.excerpt && <p className="mt-3 text-gray-600 text-sm leading-relaxed flex-1">{ev.excerpt}</p>}
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <CalendarDays size={14} /> {new Date(ev.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary-600">
                      {t('events.readMore')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Marketing contact */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#fdf3d8] rounded-2xl p-8 text-center">
          <p className="text-gray-700">
            {t('events.marketingLine')}{' '}
            <a
              href={`mailto:${t('events.marketingEmail')}?subject=Advertising%20%2F%20Promotional%20Inquiry`}
              className="inline-flex items-center gap-1.5 font-semibold text-primary-700 hover:text-primary-800"
            >
              <Mail size={16} /> {t('events.marketingEmail')}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
