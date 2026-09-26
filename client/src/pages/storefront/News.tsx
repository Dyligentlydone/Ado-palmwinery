import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper, ArrowRight, Mail, CalendarDays } from 'lucide-react';

// Press items — newest first. To add coverage, drop a new entry here.
const PRESS_ITEMS = [
  {
    title: 'Ado Palm Winery Names Francis N. Onochie as Managing Director, Driving Global Expansion Across Three Generations of Heritage',
    subtitle: 'Tropical craft beverage pioneer expands lineup of natural Vino de Coyol, distilled palm gin, and signature beach cocktails from its Costa Rica headquarters.',
    date: '2025',
    location: 'Liberia, Costa Rica',
    image: '/images/products/palmwine.jpg',
    link: '/experience',
    tag: 'Press Release',
  },
];

export default function News() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#fdf3d8] via-[#fbe8c5] to-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-600/10 text-primary-700 font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            <Newspaper size={16} /> {t('news.kicker')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {t('news.title')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('news.subtitle')}</p>
        </div>
      </section>

      {/* Press items */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {PRESS_ITEMS.map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className="group block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow sm:flex"
            >
              <div className="sm:w-2/5 h-56 sm:h-auto overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 sm:p-8 sm:w-3/5 flex flex-col">
                <span className="self-start text-xs font-semibold uppercase tracking-wider bg-primary-600/10 text-primary-700 px-3 py-1 rounded-full">
                  {item.tag}
                </span>
                <h2 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors font-[family-name:var(--font-heading)] leading-snug">
                  {item.title}
                </h2>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed flex-1">{item.subtitle}</p>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <CalendarDays size={14} /> {item.location} — {item.date}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-primary-600">
                    {t('news.readMore')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Media inquiries */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#fdf3d8] rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {t('news.mediaTitle')}
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">{t('news.mediaText')}</p>
          <a
            href="mailto:info@adopalmwinery.com?subject=Media%20Inquiry"
            className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Mail size={18} /> info@adopalmwinery.com
          </a>
        </div>
      </section>
    </div>
  );
}
