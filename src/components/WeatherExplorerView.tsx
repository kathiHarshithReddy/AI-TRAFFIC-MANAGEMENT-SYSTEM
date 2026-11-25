import { useMemo, useState } from 'react';
import { CloudRain, Droplets, Gauge, MapPin, ShieldAlert, Sun } from 'lucide-react';
import { BENGALURU_LOCALITIES, BENGALURU_ZONES } from '../data/bengaluruLocalities';
import { localizeBengaluruPlaceName } from '../i18n/bengaluruTransliterator';
import { DASHBOARD_UI } from '../i18n/dashboardTranslations';
import { useLanguage } from '../i18n/LanguageContext';
import { BengaluruZone, WeatherCondition } from '../types/traffic';
import { getLocalityMicroWeather } from '../utils/weatherEngine';

interface WeatherExplorerViewProps {
  weatherCondition: WeatherCondition;
}

export function WeatherExplorerView({ weatherCondition }: WeatherExplorerViewProps) {
  const { language, t } = useLanguage();
  const copy = DASHBOARD_UI[language];
  const [selectedZone, setSelectedZone] = useState<BengaluruZone | 'All'>('All');

  const localitiesWithMicro = useMemo(() => {
    const filtered =
      selectedZone === 'All'
        ? BENGALURU_LOCALITIES.slice(0, 24)
        : BENGALURU_LOCALITIES.filter((l) => l.zone === selectedZone);
    return filtered.map((loc) => ({
      loc,
      micro: getLocalityMicroWeather(loc, weatherCondition),
    }));
  }, [selectedZone, weatherCondition]);

  return (
    <section
      aria-label={copy.weatherPage.title}
      data-testid="weather-explorer-view"
      className="space-y-6"
    >
      <div className="bento-card p-6 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {copy.weatherPage.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{copy.weatherPage.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedZone('All')}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                selectedZone === 'All'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.planner.allRegions} (24)
            </button>
            {BENGALURU_ZONES.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setSelectedZone(z)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedZone === z
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t.planner.zones[z].name}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="font-display text-sm font-bold text-slate-900">
            {copy.weatherPage.localityMatrixTitle}
          </h2>
          <p className="text-xs text-slate-500">{copy.weatherPage.localityMatrixSub}</p>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {localitiesWithMicro.map(({ loc, micro }) => {
            const isRisk = micro.waterloggingRisk || micro.roadGripFactor < 0.72;
            return (
              <article
                key={loc.id}
                className={`rounded-2xl border p-4 space-y-2.5 transition-shadow hover:shadow-sm ${
                  isRisk
                    ? 'border-sky-200 bg-gradient-to-br from-sky-50/70 to-white'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {localizeBengaluruPlaceName(loc.name, language)}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="h-3 w-3 text-blue-600 shrink-0" aria-hidden="true" />
                      <span className="truncate">{t.planner.zones[loc.zone].name}</span>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-slate-900 tabular-nums shrink-0">
                    {micro.temperatureC}°C
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
                    {micro.rainProbabilityPct >= 45 ? (
                      <CloudRain className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Sun className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    )}
                    <span>{t.weather.microLabels[micro.condition]}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums text-slate-600">
                  <div className="inline-flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-sky-600" aria-hidden="true" />
                    <span>{micro.rainProbabilityPct}%</span>
                  </div>
                  <div className="inline-flex items-center justify-end gap-1">
                    <Gauge className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                    <span>
                      {t.weather.grip} {micro.roadGripFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

                {micro.waterloggingRisk && (
                  <div className="inline-flex w-full items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>Waterlogging Risk · Metro Recommended</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
