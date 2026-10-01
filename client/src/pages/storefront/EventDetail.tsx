import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { eventsAPI } from '../../services/api';

interface EventFull {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  imageUrl: string | null;
  publishedAt: string;
  isPromotion: boolean;
}

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [event, setEvent] = useState<EventFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    eventsAPI.getBySlug(slug)
      .then(r => setEvent(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">{t('common.loading')}</div>;
  }
  if (notFound || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">{t('events.empty')}</p>
        <Link to="/events" className="text-primary-600 hover:underline">{t('events.backToEvents')}</Link>
      </div>
    );
  }

  return (
    <article>
      {event.imageUrl && (
        <div className="relative h-56 sm:h-80 md:h-96 overflow-hidden">
          <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
          <ArrowLeft size={16} /> {t('events.backToEvents')}
        </Link>

        <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-primary-600/10 text-primary-700 px-3 py-1 rounded-full">
          {event.isPromotion ? t('events.upcomingKicker') : t('events.pastKicker')}
        </div>

        <h1 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)] leading-tight">
          {event.title}
        </h1>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
          <CalendarDays size={14} /> {new Date(event.publishedAt).toLocaleDateString()}
        </div>

        {event.excerpt && (
          <p className="mt-6 text-lg text-gray-700 leading-relaxed font-medium">{event.excerpt}</p>
        )}

        <div className="mt-6 prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
          {event.body}
        </div>
      </div>
    </article>
  );
}
