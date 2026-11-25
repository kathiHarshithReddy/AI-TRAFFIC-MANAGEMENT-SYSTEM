import { useEffect, useState } from 'react';
import {
  CloudFog,
  CloudLightning,
  CloudRain,
  Flame,
  Globe,
  Menu,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DASHBOARD_UI } from '../i18n/dashboardTranslations';
import { useLanguage } from '../i18n/LanguageContext';
import { AppLanguage, LANGUAGE_OPTIONS } from '../i18n/types';
import { AppView, WeatherCondition, WeatherTelemetry } from '../types/traffic';

interface TopUtilityHeaderProps {
  onOpenMobileMenu: () => void;
  onSelectView: (view: AppView) => void;
  weather: WeatherTelemetry;
  voiceAlertsEnabled: boolean;
  onToggleVoiceAlerts: () => void;
  sosActive: boolean;
  onToggleSos: () => void;
}

function HeaderWeatherIcon({ condition }: { condition: WeatherCondition }) {
  switch (condition) {
    case 'heavy_rain':
      return <CloudLightning className="h-3.5 w-3.5 text-blue-600 shrink-0" aria-hidden="true" />;
    case 'light_rain':
      return <CloudRain className="h-3.5 w-3.5 text-sky-600 shrink-0" aria-hidden="true" />;
    case 'morning_fog':
      return <CloudFog className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden="true" />;
    case 'extreme_heat':
      return <Flame className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />;
    default:
      return <Sun className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />;
  }
}

export function TopUtilityHeader({
  onOpenMobileMenu,
  onSelectView,
  weather,
  voiceAlertsEnabled,
  onToggleVoiceAlerts,
  sosActive,
  onToggleSos,
}: TopUtilityHeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const copy = DASHBOARD_UI[language];
  const [clockLabel, setClockLabel] = useState<string>(() =>
    new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockLabel(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 px-4 py-3 sm:px-6">
        {/* Left: Mobile Menu Button + Command Centre Title + System Online Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            data-testid="mobile-menu-open-btn"
            className="lg:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-sm sm:text-base font-bold tracking-tight text-slate-900 truncate max-w-[230px] sm:max-w-[440px] xl:max-w-none">
                {copy.headerTitle}
              </h1>
              <span
                data-testid="system-online-badge"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 whitespace-nowrap shrink-0"
              >
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{copy.systemOnline}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Weather Badge + Live Digital Clock + 7-Language Switcher + Voice + SOS Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Weather Pill (jumps to Hyper-Local Weather view) */}
          <button
            type="button"
            onClick={() => onSelectView('weather')}
            data-testid="header-weather-badge"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-sky-100/80 transition-colors whitespace-nowrap shrink-0"
            title={t.weather.bengaluruWeather}
          >
            <HeaderWeatherIcon condition={weather.condition} />
            <span className="font-mono tabular-nums text-slate-900">{weather.temperatureC}°C</span>
            <span className="hidden md:inline text-slate-600">
              {t.weather.conditions[weather.condition]}
            </span>
          </button>

          {/* Live Digital Clock */}
          <div
            data-testid="header-live-clock"
            className="hidden md:inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 tabular-nums whitespace-nowrap shrink-0"
          >
            {clockLabel}
          </div>

          {/* Desktop 7-Language Pill Switcher */}
          <div
            role="group"
            aria-label={t.nav.selectLanguage}
            data-testid="language-switcher-pills"
            className="hidden xl:inline-flex items-center rounded-full border border-slate-200 bg-slate-100/80 p-0.5"
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
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  {opt.nativeLabel}
                </button>
              );
            })}
          </div>

          {/* Tablet / Mobile Compact Language Selector (visible below xl) */}
          <div className="relative xl:hidden inline-flex items-center">
            <Globe
              className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-blue-600"
              aria-hidden="true"
            />
            <select
              aria-label={t.nav.selectLanguage}
              data-testid="language-switcher-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.nativeLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Alerts Toggle */}
          <button
            type="button"
            onClick={onToggleVoiceAlerts}
            aria-pressed={voiceAlertsEnabled}
            data-testid="tts-toggle-btn"
            aria-label={
              voiceAlertsEnabled ? t.nav.voiceAlertsOn : t.nav.voiceAlerts
            }
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              voiceAlertsEnabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {voiceAlertsEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-500 shrink-0" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {voiceAlertsEnabled ? t.nav.voiceAlertsOn : t.nav.voiceAlerts}
            </span>
          </button>

          {/* Persistent High-Visibility Crimson Red SOS Auto-Dial Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={sosActive}
            aria-label={`${t.sos.toggleLabel}: ${
              sosActive ? t.sos.activeTag : t.sos.offTag
            }`}
            data-testid="header-sos-toggle"
            onClick={onToggleSos}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-xs ${
              sosActive
                ? 'border-rose-600 bg-rose-600 text-white shadow-rose-500/30'
                : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300'
            }`}
          >
            <span className="font-extrabold">{t.sos.toggleLabel}</span>
            <span
              aria-hidden="true"
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                sosActive ? 'bg-rose-900' : 'bg-rose-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full transition-transform ${
                  sosActive ? 'translate-x-3.5 bg-white' : 'translate-x-0.5 bg-rose-600'
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
