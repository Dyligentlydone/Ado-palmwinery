import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Tuning constants
const SUN_X = 50;             // sun center, % across image width
const SUN_Y = 62;             // sun center, % down image height
const SUN_COLOR = '#fdf3d8';  // sampled sun color — matches the page-top gradient
const MAX_SCALE = 16;         // final zoom level
const DIVE_MS = 2200;         // how long the dive into the sun takes

type Phase = 'gate' | 'diving' | 'denied' | 'done';

// Module-level: persists across client-side navigations but resets on a real page load,
// so the gate shows on every visit without kicking users back out mid-session.
let hasEntered = false;

export default function SunsetIntro() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>(hasEntered ? 'done' : 'gate');
  const [p, setP] = useState(0);
  const reducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Lock page scroll while the intro is on screen
  useEffect(() => {
    if (phase === 'done') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [phase]);

  const startDive = () => {
    setPhase('diving');
    const duration = reducedMotion.current ? 300 : DIVE_MS;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeInOutCubic — slow start, accelerating dive, soft landing
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setP(eased);
      if (t < 1) requestAnimationFrame(tick);
      else { hasEntered = true; setPhase('done'); }
    };
    requestAnimationFrame(tick);
  };

  if (phase === 'done') return null;

  // Animation curves driven by progress p (0 → 1)
  const scale = 1 + Math.min(1, p / 0.92) * (MAX_SCALE - 1);
  const wash = Math.min(1, Math.max(0, (p - 0.55) / 0.35));       // solid sun-color wash
  const fade = p >= 0.96 ? Math.max(0, 1 - (p - 0.96) / 0.04) : 1; // overlay exits
  const gateVisible = phase === 'gate' || phase === 'denied';
  const gateOpacity = gateVisible ? 1 : Math.max(0, 1 - p * 4);    // gate text fades fast

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ opacity: fade }}
    >
      <img
        src="/images/sunset-intro.jpg"
        alt=""
        className="w-full h-full object-cover will-change-transform"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${SUN_X}% ${SUN_Y}%`,
        }}
      />
      <div className="absolute inset-0" style={{ background: SUN_COLOR, opacity: wash }} />

      {/* Age gate over the scene */}
      <div
        className="absolute inset-0"
        style={{ opacity: gateOpacity, pointerEvents: gateVisible ? 'auto' : 'none' }}
      >
        <div className="absolute inset-x-0 top-[34%] flex justify-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg font-[family-name:var(--font-heading)] tracking-wide text-center">
            {t('intro.headline')}
          </h1>
        </div>

        {phase === 'gate' && (
          <div className="absolute inset-x-0 top-[57%] flex flex-col items-center px-4 text-center">
            <p className="text-black text-base md:text-lg font-semibold tracking-[0.2em] uppercase">
              {t('intro.legal')}
            </p>
            <p className="text-black/80 mt-1.5 text-base md:text-lg">{t('intro.question')}</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={startDive}
                className="px-8 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
              >
                {t('intro.yes')}
              </button>
              <button
                onClick={() => setPhase('denied')}
                className="px-8 py-2 border-2 border-black/70 text-black text-sm font-bold rounded-full hover:bg-black/10 transition-colors"
              >
                {t('intro.no')}
              </button>
            </div>
          </div>
        )}

        {phase === 'denied' && (
          <div className="absolute inset-x-0 top-[57%] flex flex-col items-center px-4 text-center">
            <p className="text-black font-semibold">
              {t('intro.denied')}
            </p>
            <button
              onClick={() => setPhase('gate')}
              className="mt-3 text-black/70 text-sm underline hover:text-black transition-colors"
            >
              {t('intro.goBack')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
