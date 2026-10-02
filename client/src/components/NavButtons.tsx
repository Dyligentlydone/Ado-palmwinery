import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function NavButtons() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Never leave the site — furthest back is the entry (verify/home) screen
  const handleBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="relative z-10 flex justify-center gap-3 py-5">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-white hover:shadow transition"
        aria-label={t('navButtons.back')}
      >
        <ArrowLeft size={16} />
        {t('navButtons.back')}
      </button>
      <button
        onClick={() => navigate(1)}
        className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-white hover:shadow transition"
        aria-label={t('navButtons.forward')}
      >
        {t('navButtons.forward')}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
