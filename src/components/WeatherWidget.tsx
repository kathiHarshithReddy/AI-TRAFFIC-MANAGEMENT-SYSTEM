import {
  CloudFog,
  CloudLightning,
  CloudRain,
  Flame,
  RefreshCw,
  Sun,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { WeatherCondition, WeatherTelemetry } from '../types/traffic';
import { WEATHER_IMPACT_CONFIG } from '../utils/weatherEngine';

interface WeatherWidgetProps {
  weather: WeatherTelemetry;
  isLoading: boolean;
  mode: 'live' | 'simulated';
  onRefreshLive: () => void;
  onSelectCondition: (condition: WeatherCondition | 'live') => void;
}

const CONDITION_ORDER: WeatherCondition[] = [
  'clear',
  'light_rain',
  'heavy_rain',
  'morning_fog',
  'extreme_heat',
];

function WeatherIcon({ condition }: { condition: WeatherCondition }) {
  switch (condition) {
    case 'heavy_rain':
      return <CloudLightning className="h-5 w-5 text-sky-400 shrink-0" aria-hidden="true" />;
    case 'light_rain':
      return <CloudRain className="h-5 w-5 text-cyan-400 shrink-0" aria-hidden="true" />;
    case 'morning_fog':
      return <CloudFog className="h-5 w-5 text-slate-300 shrink-0" aria-hidden="true" />;
    case 'extreme_heat':
      return <Flame className="h-5 w-5 text-amber-400 shrink-0" aria-hidden="true" />;
    default:
      return <Sun className="h-5 w-5 text-emerald-400 shrink-0" aria-hidden="true" />;
  }
}

export function WeatherWidget({
  weather,
  isLoading,
  mode,
  onRefreshLive,
  onSelectCondition,
}: WeatherWidgetProps) {
  const { t } = useLanguage();
  const impact = WEATHER_IMPACT_CONFIG[weather.condition];
  const isSevere =
    weather.condition === 'heavy_rain' ||
    weather.condition === 'extreme_heat' ||
    weather.condition === 'morning_fog';

  const localizedConditionLabel = t.weather.conditions[weather.condition];
  const localizedImpactNote = t.weather.impactNotes[weather.condition];

  return (
    <section
      aria-label={t.weather.bengaluruWeather}
      data-testid="weather-widget"
      className={`rounded-xl border px-4 py-3.5 space-y-3 ${
        isSevere
          ? 'border-amber-500/40 bg-gradient-to-r from-[#0F172A] via-[#131726] to-[#0F172A]'
          : 'border-slate-800/90 bg-[#0F172A]'
      }`}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Left: Live Meteorological Readout */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 rounded-lg border border-slate-700/80 bg-[#0B1120] p-2">
            <WeatherIcon condition={weather.condition} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
              <span className="font-semibold text-slate-100">
                {t.weather.bengaluruWeather} · {localizedConditionLabel}
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono font-bold text-slate-50 tabular-nums">
                {weather.temperatureC}°C
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {t.weather.rainLabel} {weather.precipitationMm} mm
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono text-slate-400 tabular-nums">
                {t.weather.rhLabel} {weather.humidityPct}% · {t.weather.windLabel}{' '}
                {weather.windKmh} km/h
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">
                {weather.source === 'live'
                  ? `${t.weather.liveOpenMeteo} (${weather.updatedAt})`
                  : weather.source === 'simulated'
                    ? `${t.weather.globalOverride} (${weather.updatedAt})`
                    : `${t.weather.cachedFeed} (${weather.updatedAt})`}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-300">
              <span
                className={`font-semibold ${
                  weather.condition === 'heavy_rain' || weather.condition === 'light_rain'
                    ? 'text-sky-400'
                    : weather.condition === 'extreme_heat'
                      ? 'text-amber-400'
                      : weather.condition === 'morning_fog'
                        ? 'text-slate-200'
                        : 'text-emerald-400'
                }`}
              >
                {t.weather.scenarioImpact} ({localizedConditionLabel}):
              </span>{' '}
              <span className="font-mono font-semibold tabular-nums text-slate-100">
                {t.weather.grip} {impact.roadFrictionCoeff.toFixed(2)} ·{' '}
                {t.weather.speed} ×{impact.speedMultiplier.toFixed(2)}
                {impact.yellowSafetyBufferSec > 0
                  ? ` · ${t.weather.yellowPlus} +${impact.yellowSafetyBufferSec}s`
                  : ''}
              </span>{' '}
              — {localizedImpactNote}
            </p>
          </div>
        </div>

        {/* Right: Global Weather Scenario Override Switcher */}
        <div
          role="group"
          aria-label={t.weather.globalOverride}
          className="flex flex-wrap items-center gap-1.5 shrink-0"
        >
          <button
            type="button"
            onClick={() => {
              onSelectCondition('live');
              onRefreshLive();
            }}
            aria-pressed={mode === 'live'}
            aria-label={t.weather.liveButton}
            data-testid="weather-override-live"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              mode === 'live'
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700/80 bg-[#0B1120] text-slate-400 hover:border-slate-600 hover:text-slate-100'
            }`}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{t.weather.liveButton}</span>
          </button>

          {CONDITION_ORDER.map((condId) => {
            const isSelected = mode === 'simulated' && weather.condition === condId;
            return (
              <button
                key={condId}
                type="button"
                onClick={() => onSelectCondition(condId)}
                aria-pressed={isSelected}
                data-testid={`weather-override-${condId}`}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? condId === 'heavy_rain' || condId === 'light_rain'
                      ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                      : condId === 'extreme_heat'
                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                        : condId === 'morning_fog'
                          ? 'border-slate-500/60 bg-slate-700/60 text-slate-100'
                          : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-700/80 bg-[#0B1120] text-slate-400 hover:border-slate-600 hover:text-slate-100'
                }`}
              >
                {t.weather.conditions[condId]}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
