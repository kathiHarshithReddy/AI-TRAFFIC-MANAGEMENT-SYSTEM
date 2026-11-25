import { useMemo, useState } from 'react';
import {
  Activity,
  Ambulance,
  ArrowUpRight,
  Clock,
  Navigation,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import isoCityInsights from '../assets/images/iso_smart_city_insights_1795596941486.jpg';
import { DASHBOARD_UI } from '../i18n/dashboardTranslations';
import { localizeBengaluruPlaceName } from '../i18n/bengaluruTransliterator';
import { useLanguage } from '../i18n/LanguageContext';
import {
  AppView,
  GreenCorridorVehicle,
  Itinerary,
  Locality,
  SignalMode,
  TrafficScenario,
  WeatherCondition,
} from '../types/traffic';
import {
  buildLiveActivityFeed,
  computeDashboardKpis,
  computeMajorJunctionStatuses,
} from '../utils/dashboardEngine';
import {
  buildGoogleMapsDirectionsUrl,
  getItineraryWaypoints,
  mapItineraryToTravelMode,
} from '../utils/googleMapsNav';
import {
  IsoAmbulanceIcon,
  IsoClockIcon,
  IsoImageCard,
  IsoLocationPinIcon,
  IsoTrafficSignalIcon,
} from './IsometricIcons3D';
import { IsometricCityMap3D } from './IsometricCityMap3D';

interface DashboardBentoViewProps {
  fleet: GreenCorridorVehicle[];
  selectedVehicleId: string;
  onSelectVehicleId: (id: string) => void;
  isCorridorSimRunning: boolean;
  onToggleCorridorSim: () => void;
  onToggleRoadblock: (vehicleId: string) => void;
  signalMode: SignalMode;
  scenario: TrafficScenario;
  weatherCondition: WeatherCondition;
  tickSeconds: number;
  sosActive: boolean;
  origin: Locality;
  destination: Locality;
  fastestRoute?: Itinerary;
  saferRoute?: Itinerary;
  onSelectView: (view: AppView) => void;
}

export function DashboardBentoView({
  fleet,
  selectedVehicleId,
  onSelectVehicleId,
  isCorridorSimRunning,
  onToggleCorridorSim,
  onToggleRoadblock,
  signalMode,
  scenario,
  weatherCondition,
  tickSeconds,
  sosActive,
  origin,
  destination,
  fastestRoute,
  saferRoute,
  onSelectView,
}: DashboardBentoViewProps) {
  const { language } = useLanguage();
  const copy = DASHBOARD_UI[language];
  const [selectedRouteTab, setSelectedRouteTab] = useState<'safer' | 'fastest' | 'bypass'>('safer');

  const selectedVehicle = useMemo(
    () => fleet.find((v) => v.id === selectedVehicleId) || fleet[0],
    [fleet, selectedVehicleId]
  );

  const kpis = useMemo(
    () => computeDashboardKpis(fleet, signalMode, weatherCondition),
    [fleet, signalMode, weatherCondition]
  );

  const junctionStatuses = useMemo(
    () => computeMajorJunctionStatuses(tickSeconds, signalMode, scenario, language),
    [tickSeconds, signalMode, scenario, language]
  );

  const activityFeed = useMemo(
    () => buildLiveActivityFeed(weatherCondition, signalMode, sosActive, language),
    [weatherCondition, signalMode, sosActive, language]
  );

  const localizedOrigin = localizeBengaluruPlaceName(origin.name, language);
  const localizedDest = localizeBengaluruPlaceName(destination.name, language);

  const activeRouteUrl = useMemo(() => {
    if (selectedRouteTab === 'bypass') {
      return buildGoogleMapsDirectionsUrl({
        origin: 'Marathahalli Bridge',
        destination: destination.name,
        travelMode: 'driving',
        waypoints: ['Kundalahalli Gate', 'Brookefield Main Rd'],
      });
    }
    const target = selectedRouteTab === 'safer' ? saferRoute : fastestRoute;
    return buildGoogleMapsDirectionsUrl({
      origin: origin.name,
      destination: destination.name,
      travelMode: target ? mapItineraryToTravelMode(target) : 'transit',
      waypoints: target ? getItineraryWaypoints(target, origin, destination) : undefined,
    });
  }, [selectedRouteTab, saferRoute, fastestRoute, origin, destination]);

  const emergencyMapsUrl = useMemo(
    () =>
      buildGoogleMapsDirectionsUrl({
        origin: selectedVehicle.originName,
        destination: selectedVehicle.destination.name,
        travelMode: 'driving',
      }),
    [selectedVehicle]
  );

  const nextClearedJunction = useMemo(
    () =>
      selectedVehicle.signals.find((s) => s.currentPhase === 'GREEN')?.name ||
      selectedVehicle.originName,
    [selectedVehicle]
  );

  return (
    <div data-testid="dashboard-bento-view" className="space-y-6">
      {/* Row 1: Top 4 Pastel KPI Summary Cards with 3D Isometric Icons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Coral Red Tint — Active Emergencies */}
        <div
          data-testid="kpi-card-emergencies"
          className="bento-card-soft border border-rose-200/80 bg-gradient-to-br from-[#FFF1F2] via-[#FFF5F5] to-white p-5 flex items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-semibold text-rose-700">{copy.kpis.activeEmergencies}</div>
            <div className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
              {kpis.activeEmergencies}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{copy.kpis.activeEmergenciesSub}</span>
            </div>
          </div>
          <IsoAmbulanceIcon className="h-14 w-14 shrink-0" />
        </div>

        {/* Card 2: Mint Green Tint — Green Signals */}
        <div
          data-testid="kpi-card-green-signals"
          className="bento-card-soft border border-emerald-200/80 bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-white p-5 flex items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-semibold text-emerald-700">{copy.kpis.greenSignals}</div>
            <div className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
              {kpis.greenSignals}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{copy.kpis.greenSignalsSub}</span>
            </div>
          </div>
          <IsoTrafficSignalIcon className="h-14 w-14 shrink-0" />
        </div>

        {/* Card 3: Sky Blue Tint — Active Corridors */}
        <div
          data-testid="kpi-card-corridors"
          className="bento-card-soft border border-blue-200/80 bg-gradient-to-br from-[#EFF6FF] via-[#F0F9FF] to-white p-5 flex items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-semibold text-blue-700">{copy.kpis.activeCorridors}</div>
            <div className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
              {kpis.activeCorridors}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600">
              <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{copy.kpis.activeCorridorsSub}</span>
            </div>
          </div>
          <IsoLocationPinIcon className="h-14 w-14 shrink-0" />
        </div>

        {/* Card 4: Lavender Tint — Time Saved */}
        <div
          data-testid="kpi-card-time-saved"
          className="bento-card-soft border border-violet-200/80 bg-gradient-to-br from-[#F5F3FF] via-[#FAF5FF] to-white p-5 flex items-center justify-between gap-3"
        >
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-semibold text-violet-700">{copy.kpis.timeSaved}</div>
            <div className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
              {kpis.timeSavedMin}{' '}
              <span className="text-base font-bold text-violet-700">{copy.kpis.minUnit}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600">
              <TrendingDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{copy.kpis.timeSavedSub}</span>
            </div>
          </div>
          <IsoClockIcon className="h-14 w-14 shrink-0" />
        </div>
      </div>

      {/* Row 2: Main Asymmetric Split (8 Cols 3D Isometric Map + 4 Cols Right Telemetry & Signal Status) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <IsometricCityMap3D
            selectedVehicle={selectedVehicle}
            isSimRunning={isCorridorSimRunning}
            onToggleSim={onToggleCorridorSim}
            onToggleRoadblock={() => onToggleRoadblock(selectedVehicle.id)}
          />
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Right Panel Top Card: Active Emergency / Commute Vehicle Details */}
          <div
            data-testid="dashboard-vehicle-tracking-card"
            className="bento-card p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  {copy.rightPanel.vehicleTitle}
                </h2>
                <p className="text-xs text-slate-500">{copy.rightPanel.vehicleSub}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                <Ambulance className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            {/* Quick Vehicle Switcher Pills */}
            <div className="flex flex-wrap gap-1.5">
              {fleet.slice(0, 3).map((v) => {
                const active = v.id === selectedVehicle.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSelectVehicleId(v.id)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {v.callSign.split('(')[0].trim()}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">{copy.rightPanel.currentJunction}</span>
                <span className="font-semibold text-slate-900 text-right truncate">
                  {localizeBengaluruPlaceName(nextClearedJunction, language)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">{copy.rightPanel.destinationLabel}</span>
                <span className="font-semibold text-emerald-700 text-right truncate">
                  {selectedVehicle.destination.name.split('(')[0].trim()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">{copy.rightPanel.etaLabel}</span>
                <span className="font-mono font-extrabold text-blue-700 tabular-nums">
                  {selectedVehicle.optimizedEtaMin} {copy.kpis.minUnit} (-{selectedVehicle.timeSavedMin}m)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={emergencyMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="dashboard-track-live-btn"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{copy.rightPanel.trackLiveBtn}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => onSelectView('corridor')}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>{copy.rightPanel.openCorridorDispatch}</span>
              </button>
            </div>
          </div>

          {/* Right Panel Bottom Card: Live Traffic Signal Status */}
          <div
            data-testid="dashboard-signal-status-card"
            className="bento-card p-5 space-y-3.5 flex-1"
          >
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                {copy.rightPanel.signalStatusTitle}
              </h2>
              <p className="text-xs text-slate-500">{copy.rightPanel.signalStatusSub}</p>
            </div>

            <div className="divide-y divide-slate-100">
              {junctionStatuses.map((jx) => {
                const isGreen = jx.status === 'GREEN';
                return (
                  <div
                    key={jx.id}
                    className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-slate-900">
                        {jx.name}
                      </div>
                      <div className="truncate text-[11px] text-slate-500">
                        {jx.corridorHint} · <span className="font-mono tabular-nums">{jx.speedKmh} km/h</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold shrink-0 tabular-nums ${
                        isGreen
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isGreen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span>
                        {isGreen ? copy.rightPanel.statusGreen : copy.rightPanel.statusPreparing} · {jx.countdownSec}s
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Bottom 3-Column Equal White Bento Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card 1: AI Route Options & Side-Street Escape */}
        <div
          data-testid="dashboard-route-options-card"
          className="bento-card p-5 flex flex-col justify-between gap-4"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  {copy.bottomRow.routeOptionsTitle}
                </h2>
                <p className="text-xs text-slate-500">
                  {localizedOrigin} → {localizedDest}
                </p>
              </div>
              <Route className="h-5 w-5 text-blue-600 shrink-0" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1">
              {(
                [
                  { id: 'safer', label: copy.bottomRow.saferRoute },
                  { id: 'fastest', label: copy.bottomRow.fastestRoute },
                  { id: 'bypass', label: copy.bottomRow.sideStreetBypass },
                ] as const
              ).map((tab) => {
                const active = selectedRouteTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedRouteTab(tab.id)}
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all leading-tight ${
                      active
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  {selectedRouteTab === 'safer'
                    ? saferRoute?.title || 'Namma Metro + Safe Feeder'
                    : selectedRouteTab === 'fastest'
                      ? fastestRoute?.title || 'Direct Express Corridor'
                      : '14th Main Cross → Kundalahalli Bypass'}
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">
                  {selectedRouteTab === 'safer'
                    ? `${saferRoute?.totalDurationMin ?? 32}m`
                    : selectedRouteTab === 'fastest'
                      ? `${fastestRoute?.totalDurationMin ?? 27}m`
                      : '-9m saved'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="rounded-lg bg-white border border-slate-200/70 p-2">
                  <div className="text-[10px] text-slate-500">{copy.bottomRow.costLabel}</div>
                  <div className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                    {selectedRouteTab === 'safer'
                      ? `₹${saferRoute?.totalFareInr ?? 35}`
                      : selectedRouteTab === 'fastest'
                        ? `₹${fastestRoute?.totalFareInr ?? 140}`
                        : '₹0 bypass'}
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200/70 p-2">
                  <div className="text-[10px] text-slate-500">{copy.bottomRow.safetyLabel}</div>
                  <div className="font-mono text-xs font-bold text-emerald-700 tabular-nums">
                    {selectedRouteTab === 'safer'
                      ? `${saferRoute?.safetyRating ?? 96}/100`
                      : selectedRouteTab === 'fastest'
                        ? `${fastestRoute?.safetyRating ?? 78}/100`
                        : '92/100'}
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200/70 p-2">
                  <div className="text-[10px] text-slate-500">{copy.bottomRow.comfortLabel}</div>
                  <div className="font-mono text-xs font-bold text-blue-700 tabular-nums">
                    {selectedRouteTab === 'safer'
                      ? `${saferRoute?.comfortScore ?? 9}/10`
                      : selectedRouteTab === 'fastest'
                        ? `${fastestRoute?.comfortScore ?? 8}/10`
                        : '8.5/10'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <a
              href={activeRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="dashboard-use-route-btn"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{copy.bottomRow.useRouteBtn}</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() =>
                onSelectView(selectedRouteTab === 'bypass' ? 'escape' : 'planner')
              }
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {copy.bottomRow.openFullPlannerBtn}
            </button>
          </div>
        </div>

        {/* Card 2: Live Activity Feed */}
        <div
          data-testid="dashboard-activity-feed-card"
          className="bento-card p-5 flex flex-col justify-between gap-4"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  {copy.bottomRow.activityTitle}
                </h2>
                <p className="text-xs text-slate-500">{copy.bottomRow.activitySub}</p>
              </div>
              <Clock className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />
            </div>

            <div className="space-y-2.5">
              {activityFeed.map((evt) => {
                const badgeStyle =
                  evt.category === 'emergency'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : evt.category === 'safety'
                      ? 'bg-violet-50 text-violet-700 border-violet-200'
                      : evt.category === 'weather'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                return (
                  <div
                    key={evt.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeStyle}`}>
                        {evt.title}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">
                        {evt.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{evt.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Key Insights + 3D Smart City Visual Card */}
        <div
          data-testid="dashboard-key-insights-card"
          className="bento-card p-5 flex flex-col justify-between gap-4"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  {copy.bottomRow.insightsTitle}
                </h2>
                <p className="text-xs text-slate-500">{copy.bottomRow.insightsSub}</p>
              </div>
              <Sparkles className="h-5 w-5 text-violet-600 shrink-0" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
                <div className="font-mono text-2xl font-extrabold text-emerald-700 tabular-nums">
                  -35%
                </div>
                <div className="mt-0.5 text-[11px] font-semibold text-slate-700 leading-tight">
                  {copy.bottomRow.responseTimeDrop}
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                <div className="font-mono text-2xl font-extrabold text-blue-700 tabular-nums">
                  +40%
                </div>
                <div className="mt-0.5 text-[11px] font-semibold text-slate-700 leading-tight">
                  {copy.bottomRow.flowEfficiencyGain}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-2.5 space-y-2">
            <div className="h-32 w-full overflow-hidden rounded-xl border border-slate-200/70 bg-white">
              <IsoImageCard
                src={isoCityInsights}
                alt="3D Isometric Bengaluru Smart City Eco-Transit & Signal Grid"
                className="h-full w-full"
              />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 px-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{copy.bottomRow.insightsCaption}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
