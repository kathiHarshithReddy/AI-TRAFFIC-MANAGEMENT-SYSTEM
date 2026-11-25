import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Clock, Fuel, Leaf, Users } from 'lucide-react';
import { localizeBengaluruPlaceName } from '../i18n/bengaluruTransliterator';
import {
  localizeModeEmissionData,
  localizeZoneDelayData,
} from '../i18n/domainLocalizers';
import { useLanguage } from '../i18n/LanguageContext';
import { SignalMode, TrafficScenario, WeatherCondition } from '../types/traffic';
import {
  computeModeEmissionComparison,
  computeSustainabilityKpis,
  computeZoneDelayComparison,
} from '../utils/analyticsEngine';
import { SCENARIO_CONFIG } from '../utils/signalEngine';

interface SustainabilityAnalyticsViewProps {
  scenario: TrafficScenario;
  onChangeScenario: (s: TrafficScenario) => void;
  signalMode: SignalMode;
  onChangeSignalMode: (m: SignalMode) => void;
  weatherCondition: WeatherCondition;
  plannedTripDistanceKm: number;
  originName: string;
  destinationName: string;
}

const DISTANCE_OPTIONS = [{ km: 8 }, { km: 18 }, { km: 28 }];

export function SustainabilityAnalyticsView({
  scenario,
  onChangeScenario,
  signalMode,
  onChangeSignalMode,
  weatherCondition,
  plannedTripDistanceKm,
  originName,
  destinationName,
}: SustainabilityAnalyticsViewProps) {
  const { language, t } = useLanguage();
  const [selectedDistMode, setSelectedDistMode] = useState<'planned' | number>(
    'planned'
  );

  const activeDistanceKm =
    selectedDistMode === 'planned'
      ? Math.max(4, Math.round(plannedTripDistanceKm))
      : selectedDistMode;

  const kpis = useMemo(
    () => computeSustainabilityKpis(scenario, signalMode, weatherCondition),
    [scenario, signalMode, weatherCondition]
  );

  const rawZoneData = useMemo(
    () => computeZoneDelayComparison(scenario, weatherCondition),
    [scenario, weatherCondition]
  );

  const zoneData = useMemo(
    () => localizeZoneDelayData(rawZoneData, language),
    [rawZoneData, language]
  );

  const rawModeData = useMemo(
    () => computeModeEmissionComparison(activeDistanceKm),
    [activeDistanceKm]
  );

  const modeData = useMemo(
    () => localizeModeEmissionData(rawModeData, language),
    [rawModeData, language]
  );

  const localizedOrigin = localizeBengaluruPlaceName(originName, language);
  const localizedDestination = localizeBengaluruPlaceName(
    destinationName,
    language
  );

  return (
    <section aria-label={t.analytics.title} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-400">
            {t.analytics.kickerPrefix} · {t.signals.scenarios[scenario].label}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            {t.analytics.title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
            {t.analytics.subtitle}
          </p>
        </div>

        {/* Signal Mode & Scenario Filter */}
        <div className="flex flex-col items-start gap-2.5 lg:items-end">
          <div
            role="group"
            aria-label={t.analytics.title}
            className="inline-flex rounded-xl border border-slate-800 bg-[#0F172A] p-1"
          >
            <button
              type="button"
              onClick={() => onChangeSignalMode('static')}
              aria-pressed={signalMode === 'static'}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                signalMode === 'static'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {t.analytics.staticSignals}
            </button>
            <button
              type="button"
              onClick={() => onChangeSignalMode('adaptive')}
              aria-pressed={signalMode === 'adaptive'}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                signalMode === 'adaptive'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {t.analytics.aiAdaptiveSignals}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(SCENARIO_CONFIG) as TrafficScenario[]).map((sc) => {
              const active = scenario === sc;
              return (
                <button
                  key={sc}
                  type="button"
                  onClick={() => onChangeScenario(sc)}
                  aria-pressed={active}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-800 bg-[#0F172A] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {t.signals.scenarios[sc].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live KPI Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          data-testid="kpi-co2-prevented"
          className="rounded-xl border border-emerald-500/30 bg-[#0F172A] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.analytics.co2PreventedDay}</span>
            <Leaf className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums sm:text-3xl">
            {kpis.totalCo2PreventedKg.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {t.analytics.co2Subtext}
          </div>
        </div>

        <div
          data-testid="kpi-wait-reduced"
          className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.analytics.waitReducedTitle}</span>
            <Clock className="h-4 w-4 text-sky-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-50 tabular-nums sm:text-3xl">
            {kpis.signalWaitReducedPct}%
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {signalMode === 'adaptive'
              ? t.analytics.adaptiveOptActive
              : t.analytics.staticZeroGain}
          </div>
        </div>

        <div
          data-testid="kpi-fuel-saved"
          className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.analytics.fuelSavedDay}</span>
            <Fuel className="h-4 w-4 text-amber-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-50 tabular-nums sm:text-3xl">
            {kpis.fuelSavedLiters.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">L</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {t.analytics.fuelSubtext}
          </div>
        </div>

        <div
          data-testid="kpi-commuters-shifted"
          className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.analytics.commutersShiftedTitle}</span>
            <Users className="h-4 w-4 text-purple-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-50 tabular-nums sm:text-3xl">
            {kpis.commutersShifted.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {t.analytics.commutersSubtext}
          </div>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Chart 1: Zone-by-Zone Congestion Delay Comparison */}
        <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 sm:p-5 flex flex-col">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-slate-100">
              {t.analytics.zoneDelayChartTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {t.analytics.zoneDelayChartSubtitle}
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={zoneData}
                margin={{ top: 8, right: 12, left: -12, bottom: 24 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1E293B"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortZone"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={48}
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  unit="m"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1120',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                  formatter={(value, name) => [`${value} min`, String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar
                  dataKey="staticDelayMin"
                  name={t.analytics.staticLegend}
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="adaptiveDelayMin"
                  name={t.analytics.adaptiveLegend}
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Tabular Breakdown */}
          <div className="mt-4 border-t border-slate-800 pt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="py-1.5 font-medium">{t.analytics.tableZone}</th>
                  <th className="py-1.5 text-right font-medium">
                    {t.analytics.tableStatic}
                  </th>
                  <th className="py-1.5 text-right font-medium">
                    {t.analytics.tableAdaptive}
                  </th>
                  <th className="py-1.5 text-right font-medium">
                    {t.analytics.tableSaved}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {zoneData.map((row) => (
                  <tr key={row.zone} className="hover:bg-slate-800/30">
                    <td className="py-1.5 font-sans text-slate-200">
                      {row.zone}
                    </td>
                    <td className="py-1.5 text-right text-amber-300">
                      {row.staticDelayMin}m
                    </td>
                    <td className="py-1.5 text-right text-emerald-400">
                      {row.adaptiveDelayMin}m
                    </td>
                    <td className="py-1.5 text-right text-sky-400">
                      -{row.reductionPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart 2: Per-Commuter CO2 Footprint Across All Modes */}
        <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 sm:p-5 flex flex-col">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-100">
                {t.analytics.modeChartTitle}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {t.analytics.modeChartSubtitlePrefix} {activeDistanceKm}{' '}
                {t.analytics.kmCommuteSuffix}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedDistMode('planned')}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                  selectedDistMode === 'planned'
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-700 bg-[#0B1120] text-slate-400 hover:text-slate-100'
                }`}
              >
                {t.analytics.currentTrip} (
                {Math.max(4, Math.round(plannedTripDistanceKm))} km)
              </button>
              {DISTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.km}
                  type="button"
                  onClick={() => setSelectedDistMode(opt.km)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                    selectedDistMode === opt.km
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-700 bg-[#0B1120] text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {opt.km} km
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modeData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1E293B"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  unit=" kg"
                />
                <YAxis
                  type="category"
                  dataKey="shortMode"
                  width={122}
                  tick={{ fill: '#E2E8F0', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1120',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                  formatter={(value) => [
                    `${value} kg CO₂`,
                    t.analytics.tripEmissionsLabel,
                  ]}
                />
                <Bar dataKey="tripCo2Kg" radius={[0, 4, 4, 0]}>
                  {modeData.map((entry) => {
                    const fill =
                      entry.category === 'private'
                        ? '#F43F5E'
                        : entry.category === 'shared'
                          ? '#F59E0B'
                          : '#10B981';
                    return <Cell key={entry.mode} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mode Emission Intensity Reference */}
          <div className="mt-4 border-t border-slate-800 pt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="py-1.5 font-medium">{t.analytics.tableMode}</th>
                  <th className="py-1.5 text-right font-medium">
                    {t.analytics.tableIntensity}
                  </th>
                  <th className="py-1.5 text-right font-medium">
                    {t.analytics.tableEstFare}
                  </th>
                  <th className="py-1.5 text-right font-medium">
                    {t.analytics.tableTripCo2}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {modeData.map((row) => (
                  <tr key={row.mode} className="hover:bg-slate-800/30">
                    <td className="py-1.5 font-sans text-slate-200">
                      {row.mode}
                    </td>
                    <td className="py-1.5 text-right text-slate-400">
                      {row.co2PerKmGrams} g/km
                    </td>
                    <td className="py-1.5 text-right text-slate-300">
                      ₹{row.fareEstimateInr}
                    </td>
                    <td
                      className={`py-1.5 text-right font-semibold ${
                        row.category === 'private'
                          ? 'text-rose-400'
                          : row.category === 'shared'
                            ? 'text-amber-300'
                            : 'text-emerald-400'
                      }`}
                    >
                      {row.tripCo2Kg} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2.5 text-[11px] text-slate-400">
              {t.analytics.activeRouteRef}: {localizedOrigin} →{' '}
              {localizedDestination} (
              {Math.max(4, Math.round(plannedTripDistanceKm))}{' '}
              {t.analytics.roadDistanceSuffix}).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
