import { Globe, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { AppLanguage, LANGUAGE_OPTIONS } from '../i18n/types';
import { AppView } from '../types/traffic';

interface NavbarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onTriggerEcoRoute: () => void;
  voiceAlertsEnabled: boolean;
  onToggleVoiceAlerts: () => void;
  sosActive: boolean;
  onToggleSos: () => void;
}

export function Navbar({
  activeView,
  onSelectView,
  onTriggerEcoRoute,
  voiceAlertsEnabled,
  onToggleVoiceAlerts,
  sosActive,
  onToggleSos,
}: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();

  const navItems: Array<{ id: AppView; label: string }> = [
    { id: 'signals', label: t.nav.signals },
    { id: 'planner', label: t.nav.planner },
    { id: 'analytics', label: t.nav.analytics },
    { id: 'corridor', label: t.nav.corridor },
    { id: 'safety', label: t.nav.safety },
  ];

  return (
    <header className="border-b border-slate-800/90 bg-[#0B1120]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] flex-wrap lg:flex-nowrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('signals')}
          className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-md px-1"
        >
          {t.brandName}
        </button>

        {/* Zone 2: Navigation links (wraps cleanly on mobile so all 5 tabs remain visible, single-line on sm+) */}
        <nav
          aria-label="Primary sections"
          className="order-last w-full lg:order-none lg:w-auto flex flex-wrap sm:flex-nowrap items-center gap-x-3.5 gap-y-1 sm:gap-4 xl:gap-5 sm:overflow-x-auto border-t border-slate-800/70 pt-2 lg:border-t-0 lg:pt-0"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                data-testid={`nav-tab-${item.id}`}
                className={`relative py-1 text-[11px] sm:text-xs xl:text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 lg:-bottom-[11px] h-[2px] bg-emerald-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Switcher + Voice Alerts + Persistent Crimson SOS Toggle + Eco CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop 7-Language Pill Switcher */}
          <div
            role="group"
            aria-label={t.nav.selectLanguage}
            data-testid="language-switcher-pills"
            className="hidden xl:inline-flex items-center rounded-full border border-slate-700/80 bg-[#0F172A] p-0.5"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code)}
                  aria-pressed={active}
                  data-testid={`lang-btn-${opt.code}`}
                  title={opt.englishName}
                  className={`rounded-full px-1.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 border border-transparent'
                  }`}
                >
                  {opt.nativeLabel}
                </button>
              );
            })}
          </div>

          {/* Compact Dropdown for Tablet/Mobile Viewports */}
          <div className="relative xl:hidden inline-flex items-center">
            <Globe
              className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-emerald-400"
              aria-hidden="true"
            />
            <select
              aria-label={t.nav.selectLanguage}
              data-testid="language-switcher-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="rounded-full border border-slate-700/80 bg-[#0F172A] py-1.5 pl-7 pr-2 text-xs font-medium text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.nativeLabel}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onToggleVoiceAlerts}
            aria-pressed={voiceAlertsEnabled}
            data-testid="tts-toggle-btn"
            aria-label={
              voiceAlertsEnabled ? t.nav.voiceAlertsOn : t.nav.voiceAlerts
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              voiceAlertsEnabled
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-slate-700/80 bg-[#0F172A] text-slate-300 hover:border-slate-600 hover:text-slate-100'
            }`}
          >
            {voiceAlertsEnabled ? (
              <Volume2
                className="h-3.5 w-3.5 text-emerald-400 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <VolumeX
                className="h-3.5 w-3.5 text-slate-400 shrink-0"
                aria-hidden="true"
              />
            )}
            <span className="hidden 2xl:inline">
              {voiceAlertsEnabled ? t.nav.voiceAlertsOn : t.nav.voiceAlerts}
            </span>
          </button>

          {/* Persistent High-Visibility Crimson Red SOS Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={sosActive}
            aria-label={`${t.sos.toggleLabel}: ${
              sosActive ? t.sos.activeTag : t.sos.offTag
            }`}
            data-testid="header-sos-toggle"
            onClick={onToggleSos}
            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold tracking-wide transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              sosActive
                ? 'border-rose-400 bg-rose-600 text-white shadow-sm shadow-rose-900/60'
                : 'border-rose-500/70 bg-rose-950/70 text-rose-200 hover:bg-rose-900/80 hover:text-white'
            }`}
          >
            <span className="font-extrabold">{t.sos.toggleLabel}</span>
            <span
              aria-hidden="true"
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                sosActive ? 'bg-rose-950' : 'bg-rose-800/70'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full transition-transform ${
                  sosActive
                    ? 'translate-x-3.5 bg-white'
                    : 'translate-x-0.5 bg-rose-200'
                }`}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={onTriggerEcoRoute}
            className="hidden sm:inline-flex rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            {t.nav.planEcoRoute}
          </button>
        </div>
      </div>
    </header>
  );
}
