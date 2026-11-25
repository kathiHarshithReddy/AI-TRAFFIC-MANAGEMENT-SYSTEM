import { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Bike,
  Bus,
  Car,
  Check,
  Clock,
  CloudFog,
  CloudLightning,
  CloudRain,
  Compass,
  Flame,
  Footprints,
  IndianRupee,
  Leaf,
  Navigation,
  PhoneCall,
  Route,
  Search,
  Share2,
  ShieldCheck,
  Sun,
  TrainFront,
  TramFront,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  BENGALURU_LOCALITIES,
  BENGALURU_ZONE_META,
  BENGALURU_ZONES,
  findLocalityByQuery,
  METRO_LINE_INFO,
} from '../data/bengaluruLocalities';
import {
  localizeBengaluruPlaceName,
  localizeMetroLineName,
} from '../i18n/bengaluruTransliterator';
import {
  formatItineraryVoiceReadout,
  localizeItinerary,
} from '../i18n/domainLocalizers';
import { SIDE_STREET_UI } from '../i18n/sideStreetTranslations';
import { useLanguage } from '../i18n/LanguageContext';
import {
  BengaluruZone,
  BottleneckId,
  DepartureWindow,
  Itinerary,
  Locality,
  LocalityMicroWeather,
  RouteLeg,
  RoutePriority,
  TimeOfDay,
  TravelerProfile,
  WeatherCondition,
} from '../types/traffic';
import {
  buildGoogleMapsDirectionsUrl,
  getItineraryWaypoints,
  mapItineraryToTravelMode,
} from '../utils/googleMapsNav';
import { groupLocalitiesByRegion } from '../utils/localityRegions';
import {
  computeMultiModalItineraries,
  DEPARTURE_WINDOWS,
} from '../utils/routingEngine';
import { mapLocalityToBottleneckId } from '../utils/sideStreetEngine';
import { getLocalityMicroWeather } from '../utils/weatherEngine';
import { LocalityPicker } from './LocalityPicker';
import { SideStreetEscapeScanner } from './SideStreetEscapeScanner';

interface RoutePlannerViewProps {
  origin: Locality;
  destination: Locality;
  onChangeOrigin: (loc: Locality) => void;
  onChangeDestination: (loc: Locality) => void;
  onSwapLocalities: () => void;
  priority: RoutePriority;
  onChangePriority: (p: RoutePriority) => void;
  departure: DepartureWindow;
  onChangeDeparture: (d: DepartureWindow) => void;
  weatherCondition: WeatherCondition;
  onSpeakItinerary?: (route: Itinerary, spokenText: string) => void;
  sideStreetScannerOpen?: boolean;
  onToggleSideStreetScanner?: (open: boolean) => void;
  selectedBottleneckId?: BottleneckId;
  onChangeBottleneckId?: (id: BottleneckId) => void;
}

const PRIORITY_ORDER: RoutePriority[] = [
  'lowest_co2',
  'fastest',
  'lowest_fare',
  'minimal_walking',
  'safest_women',
];

const HACKATHON_PRESETS: Array<{
  originQuery: string;
  destQuery: string;
}> = [
  { originQuery: 'Hennur', destQuery: 'Electronic City' },
  { originQuery: 'RR Nagar', destQuery: 'ITPL Road' },
  {
    originQuery: 'Koramangala 4th Block',
    destQuery: 'Yelahanka New Town',
  },
  { originQuery: 'Hoskote', destQuery: 'JP Nagar 7th Phase' },
];

function LegIcon({ mode }: { mode: RouteLeg['mode'] }) {
  switch (mode) {
    case 'solo_car':
    case 'ev_car':
      return <Car className="h-4 w-4 text-rose-400" aria-hidden="true" />;
    case 'bmtc_vajra':
    case 'bmtc_ordinary':
    case 'bmtc_feeder':
      return <Bus className="h-4 w-4 text-sky-400" aria-hidden="true" />;
    case 'namma_metro':
      return <TramFront className="h-4 w-4 text-emerald-400" aria-hidden="true" />;
    case 'memu_rail':
      return <TrainFront className="h-4 w-4 text-amber-400" aria-hidden="true" />;
    case 'yulu_ev':
      return <Bike className="h-4 w-4 text-emerald-400" aria-hidden="true" />;
    case 'e_auto':
    case 'auto_rickshaw':
      return <Zap className="h-4 w-4 text-teal-400" aria-hidden="true" />;
    default:
      return <Footprints className="h-4 w-4 text-slate-400" aria-hidden="true" />;
  }
}

function MicroWeatherIcon({
  condition,
}: {
  condition: LocalityMicroWeather['condition'];
}) {
  switch (condition) {
    case 'heavy_downpour':
      return (
        <CloudLightning
          className="h-4 w-4 text-blue-400 shrink-0"
          aria-hidden="true"
        />
      );
    case 'light_drizzle':
      return (
        <CloudRain
          className="h-4 w-4 text-sky-400 shrink-0"
          aria-hidden="true"
        />
      );
    case 'morning_fog':
      return (
        <CloudFog
          className="h-4 w-4 text-slate-300 shrink-0"
          aria-hidden="true"
        />
      );
    case 'high_heat_uv':
      return (
        <Flame
          className="h-4 w-4 text-amber-400 shrink-0"
          aria-hidden="true"
        />
      );
    default:
      return (
        <Sun
          className="h-4 w-4 text-emerald-400 shrink-0"
          aria-hidden="true"
        />
      );
  }
}

function MicroWeatherBadge({
  micro,
  testId,
}: {
  micro: LocalityMicroWeather;
  testId: string;
}) {
  const { t } = useLanguage();
  const isRainy =
    micro.condition === 'heavy_downpour' || micro.condition === 'light_drizzle';
  const borderClass =
    micro.condition === 'heavy_downpour'
      ? 'border-blue-500/40 bg-blue-950/40'
      : isRainy
        ? 'border-sky-500/40 bg-sky-950/35'
        : micro.condition === 'high_heat_uv'
          ? 'border-amber-500/40 bg-amber-950/30'
          : 'border-slate-800 bg-[#0B1120]';

  const labelClass =
    micro.condition === 'heavy_downpour'
      ? 'text-blue-300'
      : isRainy
        ? 'text-sky-300'
        : micro.condition === 'high_heat_uv'
          ? 'text-amber-300'
          : micro.condition === 'morning_fog'
            ? 'text-slate-200'
            : 'text-emerald-300';

  return (
    <div
      data-testid={testId}
      className={`mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${borderClass}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <MicroWeatherIcon condition={micro.condition} />
        <span className={`truncate font-semibold ${labelClass}`}>
          {t.weather.microLabels[micro.condition]}
        </span>
      </div>
      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300 tabular-nums shrink-0">
        <span>{micro.temperatureC}°C</span>
        <span className="text-slate-600" aria-hidden="true">
          ·
        </span>
        <span>
          {t.weather.rainPctLabel} {micro.rainProbabilityPct}%
        </span>
        <span className="text-slate-600" aria-hidden="true">
          ·
        </span>
        <span
          className={
            micro.roadGripFactor < 0.75
              ? 'text-amber-300 font-bold'
              : 'text-slate-300'
          }
        >
          {t.weather.grip} {micro.roadGripFactor.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export function RoutePlannerView({
  origin,
  destination,
  onChangeOrigin,
  onChangeDestination,
  onSwapLocalities,
  priority,
  onChangePriority,
  departure,
  onChangeDeparture,
  weatherCondition,
  onSpeakItinerary,
  sideStreetScannerOpen: externalScannerOpen,
  onToggleSideStreetScanner,
  selectedBottleneckId: externalBottleneckId,
  onChangeBottleneckId,
}: RoutePlannerViewProps) {
  const { language, t } = useLanguage();
  const sideStreetUi = SIDE_STREET_UI[language];
  const [localScannerOpen, setLocalScannerOpen] = useState<boolean>(false);
  const [localBottleneckId, setLocalBottleneckId] =
    useState<BottleneckId>('marathahalli');
  const scannerOpen = externalScannerOpen ?? localScannerOpen;
  const setScannerOpen = onToggleSideStreetScanner ?? setLocalScannerOpen;
  const bottleneckId = externalBottleneckId ?? localBottleneckId;
  const setBottleneckId = onChangeBottleneckId ?? setLocalBottleneckId;

  const [selectedZoneBlock, setSelectedZoneBlock] = useState<
    BengaluruZone | 'All' | null
  >('IT Hubs');
  const [blockQuery, setBlockQuery] = useState('');
  const [directoryTarget, setDirectoryTarget] = useState<
    'origin' | 'destination'
  >('destination');

  // Women's Safety & Commuter Profile state
  const [travelerProfile, setTravelerProfile] = useState<TravelerProfile>('standard');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('evening_rush');
  const [sosModalRoute, setSosModalRoute] = useState<Itinerary | null>(null);
  const [sosShared, setSosShared] = useState(false);

  const isSameLocality = origin.id === destination.id;

  const localizedOriginName = localizeBengaluruPlaceName(origin.name, language);
  const localizedDestName = localizeBengaluruPlaceName(
    destination.name,
    language
  );

  const categorizedRegions = useMemo(
    () => groupLocalitiesByRegion(BENGALURU_LOCALITIES),
    []
  );

  const originMicro = useMemo(
    () => getLocalityMicroWeather(origin, weatherCondition),
    [origin, weatherCondition]
  );

  const destMicro = useMemo(
    () => getLocalityMicroWeather(destination, weatherCondition),
    [destination, weatherCondition]
  );

  const zoneCounts = useMemo(() => {
    const map = new Map<BengaluruZone, Locality[]>();
    for (const z of BENGALURU_ZONES) {
      map.set(
        z,
        BENGALURU_LOCALITIES.filter((loc) => loc.zone === z)
      );
    }
    return map;
  }, []);

  const visibleZoneBlocks = useMemo(() => {
    if (!selectedZoneBlock) return [];
    const targetZones =
      selectedZoneBlock === 'All' ? BENGALURU_ZONES : [selectedZoneBlock];
    const trimmed = blockQuery.trim().toLowerCase();
    const queryMatches = trimmed
      ? new Set(
          findLocalityByQuery(trimmed)
            .concat(
              BENGALURU_LOCALITIES.filter((loc) =>
                localizeBengaluruPlaceName(loc.name, language)
                  .toLowerCase()
                  .includes(trimmed)
              )
            )
            .map((l) => l.id)
        )
      : null;

    return targetZones
      .map((zone) => {
        const allInZone = zoneCounts.get(zone) || [];
        const items = queryMatches
          ? allInZone.filter((loc) => queryMatches.has(loc.id))
          : allInZone;
        return { zone, items };
      })
      .filter((group) => group.items.length > 0 || selectedZoneBlock !== 'All');
  }, [selectedZoneBlock, blockQuery, zoneCounts, language]);

  const rawItineraries = useMemo<Itinerary[]>(() => {
    if (isSameLocality) return [];
    return computeMultiModalItineraries(
      origin,
      destination,
      priority,
      departure,
      weatherCondition,
      travelerProfile,
      timeOfDay
    );
  }, [
    origin,
    destination,
    priority,
    departure,
    weatherCondition,
    travelerProfile,
    timeOfDay,
    isSameLocality,
  ]);

  const itineraries = useMemo<Itinerary[]>(
    () =>
      rawItineraries.map((route) =>
        localizeItinerary(
          route,
          origin,
          destination,
          priority,
          weatherCondition,
          language
        )
      ),
    [rawItineraries, origin, destination, priority, weatherCondition, language]
  );

  const applyPreset = (originQuery: string, destQuery: string) => {
    const o = findLocalityByQuery(originQuery)[0];
    const d = findLocalityByQuery(destQuery)[0];
    if (o) onChangeOrigin(o);
    if (d) onChangeDestination(d);
  };

  const bestEcoRoute = useMemo(
    () => itineraries.find((r) => r.recommended) || itineraries[0],
    [itineraries]
  );

  const handleSpeakCard = (route: Itinerary) => {
    if (!onSpeakItinerary) return;
    const spoken = formatItineraryVoiceReadout(
      route,
      localizedOriginName,
      localizedDestName,
      language
    );
    onSpeakItinerary(route, spoken);
  };

  return (
    <section aria-label={t.planner.title} className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-5 sm:p-6 space-y-3">
        <div>
          <p className="text-xs font-semibold text-emerald-400">
            {BENGALURU_LOCALITIES.length} {t.planner.kickerSuffix}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t.planner.title}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm text-slate-400">
            {t.planner.subtitle}
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-slate-400">
            {t.planner.sampleTrips}
          </span>
          {HACKATHON_PRESETS.map((preset) => {
            const label = `${localizeBengaluruPlaceName(
              preset.originQuery,
              language
            )} → ${localizeBengaluruPlaceName(preset.destQuery, language)}`;
            return (
              <button
                key={`${preset.originQuery}-${preset.destQuery}`}
                type="button"
                onClick={() => applyPreset(preset.originQuery, preset.destQuery)}
                className="rounded-lg border border-slate-700/80 bg-[#0B1120] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500/60 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7 Directional & Hub Blocks */}
      <div
        aria-label={t.planner.zoneBlocksHeading}
        data-testid="directional-zone-blocks"
        className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 sm:p-5 space-y-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.planner.filterByZoneTitle}</span>
            </div>
            <h2 className="mt-0.5 font-display text-base font-bold text-white">
              {t.planner.zoneBlocksHeading} ({BENGALURU_LOCALITIES.length}{' '}
              {t.planner.areasWord})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedZoneBlock((prev) => (prev === 'All' ? null : 'All'))
              }
              aria-pressed={selectedZoneBlock === 'All'}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedZoneBlock === 'All'
                  ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700/80 bg-[#0B1120] text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
            >
              {t.planner.showAllBlocks} ({BENGALURU_LOCALITIES.length})
            </button>
            {selectedZoneBlock !== null && (
              <button
                type="button"
                onClick={() => setSelectedZoneBlock(null)}
                className="rounded-lg border border-slate-700/80 bg-[#0B1120] px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                {t.planner.collapseAreaList}
              </button>
            )}
          </div>
        </div>

        {/* 7 Zone Block Cards */}
        <div
          role="group"
          aria-label={t.planner.zoneBlocksHeading}
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7"
        >
          {BENGALURU_ZONES.map((zone) => {
            const count = zoneCounts.get(zone)?.length ?? 0;
            const meta = BENGALURU_ZONE_META[zone];
            const zoneCopy = t.planner.zones[zone];
            const isSelected = selectedZoneBlock === zone;
            const hasOrigin = origin.zone === zone;
            const hasDest = destination.zone === zone;

            return (
              <button
                key={zone}
                type="button"
                onClick={() =>
                  setSelectedZoneBlock((prev) => (prev === zone ? null : zone))
                }
                aria-pressed={isSelected}
                data-testid={`zone-block-${zone.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className={`rounded-lg border p-3 text-left transition-colors flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-emerald-500/70 bg-emerald-500/15 text-white'
                    : 'border-slate-800 bg-[#0B1120] text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white leading-tight">
                      {zoneCopy.name}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] font-semibold text-emerald-400 tabular-nums">
                    {count} {t.planner.areasWord}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {localizeBengaluruPlaceName(meta.highlightAreas, language)}
                  </p>
                </div>

                {(hasOrigin || hasDest) && (
                  <div className="border-t border-slate-800 pt-1.5 text-[10px] font-mono text-sky-300">
                    {hasOrigin && hasDest
                      ? t.planner.originDestLabel
                      : hasOrigin
                        ? t.planner.activeOrigin
                        : t.planner.activeDest}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Filtered Block Area Grid */}
        {selectedZoneBlock !== null && (
          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={blockQuery}
                  onChange={(e) => setBlockQuery(e.target.value)}
                  placeholder={
                    selectedZoneBlock === 'All'
                      ? t.planner.filterBlocksPlaceholder
                      : `${t.planner.filterZonePlaceholder} ${t.planner.zones[selectedZoneBlock].name}...`
                  }
                  aria-label={t.planner.filterBlocksPlaceholder}
                  className="w-full rounded-lg border border-slate-700/80 bg-[#0B1120] py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">
                  {t.planner.clickAreaToSet}
                </span>
                <div
                  role="group"
                  aria-label={t.planner.clickAreaToSet}
                  className="inline-flex rounded-lg border border-slate-800 bg-[#0B1120] p-0.5"
                >
                  <button
                    type="button"
                    onClick={() => setDirectoryTarget('origin')}
                    aria-pressed={directoryTarget === 'origin'}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      directoryTarget === 'origin'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.planner.setAsOrigin}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectoryTarget('destination')}
                    aria-pressed={directoryTarget === 'destination'}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      directoryTarget === 'destination'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.planner.setAsDestination}
                  </button>
                </div>
              </div>
            </div>

            {visibleZoneBlocks.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">
                {t.planner.noLocalitiesMatched} &ldquo;{blockQuery}&rdquo;.
              </p>
            ) : (
              <div
                className={`grid grid-cols-1 gap-4 ${
                  visibleZoneBlocks.length > 1 ? 'md:grid-cols-2 xl:grid-cols-3' : ''
                }`}
              >
                {visibleZoneBlocks.map(({ zone, items }) => (
                  <div
                    key={zone}
                    data-testid={`filtered-block-${zone.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="rounded-lg border border-slate-800 bg-[#0B1120] p-3.5 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-emerald-400">
                          {t.planner.zones[zone].name} · {items.length}{' '}
                          {t.planner.areasWord}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {t.planner.zones[zone].subtitle}
                        </p>
                      </div>
                    </div>

                    {items.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        {t.planner.noLocalitiesMatched} &ldquo;{blockQuery}&rdquo;.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((loc) => {
                          const isOrigin = loc.id === origin.id;
                          const isDest = loc.id === destination.id;
                          const isPicked = isOrigin || isDest;

                          return (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => {
                                if (directoryTarget === 'origin') {
                                  onChangeOrigin(loc);
                                } else {
                                  onChangeDestination(loc);
                                }
                              }}
                              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                                isPicked
                                  ? 'border-emerald-500/70 bg-emerald-500/20 text-emerald-200 font-semibold'
                                  : 'border-slate-800 bg-[#0F172A] text-slate-300 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              {localizeBengaluruPlaceName(loc.name, language)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Card with Traveler Profile & Time of Day */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-display text-sm font-bold text-white">
              {t.planner.pickersTitle}
            </h2>
            <p className="text-xs text-slate-400">
              {t.planner.pickersSubtitle} ({BENGALURU_LOCALITIES.length}{' '}
              {t.planner.areasWord})
            </p>
          </div>
          {(() => {
            const activeRecommended = itineraries.find((r) => r.recommended) || itineraries[0];
            const quickNavUrl = isSameLocality
              ? buildGoogleMapsDirectionsUrl({
                  destination: origin.name,
                  travelMode: 'driving',
                })
              : buildGoogleMapsDirectionsUrl({
                  origin: origin.name,
                  destination: destination.name,
                  travelMode: activeRecommended
                    ? mapItineraryToTravelMode(activeRecommended)
                    : 'transit',
                  waypoints: activeRecommended
                    ? getItineraryWaypoints(activeRecommended, origin, destination)
                    : undefined,
                });
            return (
              <a
                href={quickNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="planner-quick-navigate-btn"
                aria-label={`${t.googleMaps.navigateNow}: ${localizedOriginName} → ${localizedDestName}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
              >
                <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{t.googleMaps.navigateNow}</span>
              </a>
            );
          })()}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-11 lg:items-start">
          <div className="lg:col-span-5">
            <LocalityPicker
              id="origin-picker"
              label={t.planner.originLabel}
              selectedLocality={origin}
              onSelect={onChangeOrigin}
              categorizedRegions={categorizedRegions}
              weatherCondition={weatherCondition}
            />
            <MicroWeatherBadge
              micro={originMicro}
              testId="origin-weather-badge"
            />
          </div>

          <div className="flex justify-center lg:col-span-1 lg:pt-7">
            <button
              type="button"
              onClick={onSwapLocalities}
              aria-label={t.planner.swapAria}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-[#0B1120] text-slate-300 hover:border-emerald-500/60 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="lg:col-span-5">
            <LocalityPicker
              id="destination-picker"
              label={t.planner.destinationLabel}
              selectedLocality={destination}
              onSelect={onChangeDestination}
              categorizedRegions={categorizedRegions}
              weatherCondition={weatherCondition}
            />
            <MicroWeatherBadge
              micro={destMicro}
              testId="destination-weather-badge"
            />
          </div>
        </div>

        {/* Commuter Profile & Time of Day Options */}
        <div className="border-t border-slate-800/80 pt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
              Traveler Profile:
            </span>
            <div role="group" aria-label="Traveler Profile" className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTravelerProfile('standard')}
                aria-pressed={travelerProfile === 'standard'}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  travelerProfile === 'standard'
                    ? 'border-sky-500/70 bg-sky-500/15 text-sky-300'
                    : 'border-slate-700/80 bg-[#0B1120] text-slate-300 hover:text-white'
                }`}
              >
                Standard Commuter
              </button>
              <button
                type="button"
                onClick={() => {
                  setTravelerProfile('women_commuter');
                  onChangePriority('safest_women');
                }}
                aria-pressed={travelerProfile === 'women_commuter'}
                data-testid="traveler-profile-women"
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  travelerProfile === 'women_commuter'
                    ? 'border-rose-500/70 bg-rose-500/15 text-rose-300'
                    : 'border-slate-700/80 bg-[#0B1120] text-slate-300 hover:text-rose-300'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
                <span>Women Commuter (Shakti ₹0 + Safety)</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
              Time of Day:
            </span>
            <div role="group" aria-label="Time of Day" className="flex flex-wrap items-center gap-1.5">
              {(['daytime', 'evening_rush', 'late_night'] as TimeOfDay[]).map((tod) => {
                const active = timeOfDay === tod;
                const label =
                  tod === 'daytime'
                    ? 'Daytime'
                    : tod === 'evening_rush'
                      ? 'Evening Rush'
                      : 'Late Night / After 9 PM';
                return (
                  <button
                    key={tod}
                    type="button"
                    onClick={() => setTimeOfDay(tod)}
                    aria-pressed={active}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-300'
                        : 'border-slate-700/80 bg-[#0B1120] text-slate-300 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Departure Time & Priority */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <label
              htmlFor="departure-select"
              className="text-xs font-medium text-slate-400 whitespace-nowrap"
            >
              {t.planner.departureTime}
            </label>
            <select
              id="departure-select"
              value={departure}
              onChange={(e) =>
                onChangeDeparture(e.target.value as DepartureWindow)
              }
              className="rounded-lg border border-slate-700/80 bg-[#0B1120] px-3 py-2 text-xs font-medium text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              {(Object.keys(DEPARTURE_WINDOWS) as DepartureWindow[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {t.planner.departures[key]}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
              {t.planner.optimizePriority}
            </span>
            <div
              role="group"
              aria-label={t.planner.optimizePriority}
              className="flex flex-wrap items-center gap-1.5"
            >
              {PRIORITY_ORDER.map((prioId) => {
                const active = priority === prioId;
                const label =
                  prioId === 'safest_women'
                    ? '🛡️ Safest Women Route'
                    : t.planner.priorities[prioId];
                return (
                  <button
                    key={prioId}
                    type="button"
                    onClick={() => onChangePriority(prioId)}
                    aria-pressed={active}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-300 font-semibold'
                        : 'border-slate-700/80 bg-[#0B1120] text-slate-300 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side-Street Escape & Bottleneck Bypass Scanner Trigger Bar */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            {sideStreetUi.triggerHint}
          </p>
          <button
            type="button"
            data-testid="planner-scan-side-street-btn"
            aria-expanded={scannerOpen}
            onClick={() => {
              if (!scannerOpen) {
                setBottleneckId(mapLocalityToBottleneckId(origin));
                setScannerOpen(true);
              } else {
                setScannerOpen(false);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/60 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-cyan-500/20 px-4 py-2 text-xs font-semibold text-amber-200 hover:border-cyan-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Route className="h-4 w-4 text-cyan-400 shrink-0" aria-hidden="true" />
            <span>{sideStreetUi.triggerButton}</span>
          </button>
        </div>
      </div>

      {/* Interactive Side-Street & Parallel Bypass Evaluator */}
      {scannerOpen && (
        <SideStreetEscapeScanner
          selectedBottleneckId={bottleneckId}
          onChangeBottleneckId={setBottleneckId}
          destination={destination}
          travelerProfile={travelerProfile}
          timeOfDay={timeOfDay}
          weatherCondition={weatherCondition}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* Same Locality Guard */}
      {isSameLocality ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/25 p-6 text-center">
          <p className="text-sm font-semibold text-amber-200">
            {t.planner.sameLocalityTitle} {localizedOriginName}.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {t.planner.sameLocalityHint}
          </p>
        </div>
      ) : (
        <>
          {/* Transit Hub & Recommended Summary Strip */}
          {bestEcoRoute && (
            <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <Navigation
                    className="h-3.5 w-3.5 text-emerald-400"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-white">
                    {localizedOriginName} → {localizedDestName}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono tabular-nums text-slate-300">
                    {bestEcoRoute.totalDistanceKm} km
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">
                    {t.planner.nearestHubs}{' '}
                    {localizeBengaluruPlaceName(
                      origin.nearestMetro.station,
                      language
                    )}{' '}
                    ({localizeMetroLineName(origin.nearestMetro.line, language)}) &amp;{' '}
                    {localizeBengaluruPlaceName(
                      destination.nearestMetro.station,
                      language
                    )}{' '}
                    (
                    {localizeMetroLineName(
                      destination.nearestMetro.line,
                      language
                    )}
                    )
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-400">
                  {t.planner.recommended} {bestEcoRoute.title} —{' '}
                  {bestEcoRoute.recommendedReason}
                </p>
              </div>

              <div className="flex items-center gap-5 shrink-0 font-mono tabular-nums">
                <div>
                  <div className="text-[11px] text-slate-400">
                    {t.planner.co2Prevented}
                  </div>
                  <div className="text-base font-bold text-emerald-400">
                    {bestEcoRoute.co2PreventedKg} kg
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">
                    {t.planner.delayAvoided}
                  </div>
                  <div className="text-base font-bold text-sky-400">
                    {bestEcoRoute.delayAvoidedMin} min
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Itinerary Comparison Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {itineraries.map((route) => {
              const isCar = route.category === 'car_baseline';
              const borderStyle = route.recommended
                ? 'border-emerald-500/60 ring-1 ring-emerald-500/25'
                : isCar
                  ? 'border-rose-500/40'
                  : 'border-slate-800/90';

              const safetyColor =
                route.safetyRating >= 90
                  ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40'
                  : route.safetyRating >= 80
                    ? 'text-sky-300 bg-sky-500/15 border-sky-500/40'
                    : 'text-amber-300 bg-amber-500/15 border-amber-500/40';

              return (
                <article
                  key={route.id}
                  data-testid={`itinerary-card-${route.category}`}
                  className={`rounded-xl border ${borderStyle} bg-[#0F172A] p-4 flex flex-col justify-between gap-4`}
                >
                  <div>
                    {/* Card Header with Voice Readout & Safety Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
                          {route.recommended ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <Check
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              {t.planner.aiRecommended}
                            </span>
                          ) : isCar ? (
                            <span className="text-rose-400 font-semibold">
                              {t.planner.highEmissionBaseline}
                            </span>
                          ) : (
                            <span>{t.planner.alternativeTransit}</span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${safetyColor}`}
                          >
                            🛡️ Safety {route.safetyRating}/100
                          </span>
                        </div>
                        <h2 className="mt-1 font-display text-base font-bold text-white">
                          {route.title}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400 leading-snug">
                          {route.subtitle}
                        </p>
                      </div>

                      {onSpeakItinerary && (
                        <button
                          type="button"
                          onClick={() => handleSpeakCard(route)}
                          data-testid={`route-tts-btn-${route.category}`}
                          aria-label={`${t.planner.voiceReadout}: ${route.title}`}
                          title={t.planner.voiceReadout}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                            route.recommended
                              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                              : 'border-slate-700/80 bg-[#0B1120] text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300'
                          }`}
                        >
                          <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{t.planner.voiceReadout}</span>
                        </button>
                      )}
                    </div>

                    {/* Karnataka Shakti Scheme Free Travel Badge */}
                    {route.shaktiEligible && (
                      <div
                        data-testid={`shakti-badge-${route.category}`}
                        className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300"
                      >
                        <span>🏛️ Karnataka Shakti Scheme: Free Travel (₹0) for Women Commuters</span>
                      </div>
                    )}

                    {/* Weather Adaptation Banner */}
                    {route.weatherAdaptationBadge && (
                      <div
                        data-testid={`weather-adapted-badge-${route.category}`}
                        className="mt-2.5 flex items-start gap-2 rounded-lg border border-sky-500/40 bg-sky-950/35 px-2.5 py-2 text-[11px] font-medium text-sky-200 leading-snug"
                      >
                        <CloudRain
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400"
                          aria-hidden="true"
                        />
                        <span>{route.weatherAdaptationBadge}</span>
                      </div>
                    )}

                    {/* Key Metrics Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5 border-y border-slate-800/80 py-3">
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          <span>{t.planner.totalDuration}</span>
                        </div>
                        <div className="mt-0.5 font-mono text-lg font-bold text-white tabular-nums">
                          {route.totalDurationMin} min
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <IndianRupee
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          <span>{t.planner.estFare}</span>
                        </div>
                        <div className="mt-0.5 font-mono text-lg font-bold text-white tabular-nums">
                          ₹{route.totalFareInr}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Leaf className="h-3 w-3" aria-hidden="true" />
                          <span>{t.planner.co2Prevented}</span>
                        </div>
                        <div
                          className={`mt-0.5 font-mono text-sm font-bold tabular-nums ${
                            route.co2PreventedKg > 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {route.co2PreventedKg > 0
                            ? `${route.co2PreventedKg} kg ${t.planner.saved}`
                            : `${route.totalCo2Kg} kg ${t.planner.emitted}`}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] text-slate-400">
                          Comfort Score
                        </div>
                        <div className="mt-0.5 font-mono text-sm font-bold text-sky-400 tabular-nums">
                          ⭐ {route.comfortScore}/10
                        </div>
                      </div>
                    </div>

                    {/* Comfort Tags & Safe-Corridor Coverage */}
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {route.comfortTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded border border-slate-700/80 bg-[#0B1120] px-2 py-0.5 text-[10px] font-medium text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-2.5 text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Safe-Corridor Coverage:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {route.safeCorridorCoveragePct}%
                          </span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          📍 Patrol: <span className="font-semibold text-slate-200">{route.policePatrolZone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step Leg Breakdown */}
                    <div className="mt-3 space-y-2.5">
                      <div className="text-[11px] font-semibold text-slate-400">
                        {t.planner.stepByStepLegs} ({route.legs.length})
                      </div>
                      <ol className="space-y-2.5">
                        {route.legs.map((leg) => {
                          const metroStyle = leg.metroLine
                            ? METRO_LINE_INFO[leg.metroLine]
                            : null;
                          return (
                            <li
                              key={leg.id}
                              className="flex items-start gap-2.5 text-xs"
                            >
                              <div className="mt-0.5 shrink-0">
                                <LegIcon mode={leg.mode} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-slate-100 truncate">
                                    {leg.modeLabel}
                                  </span>
                                  <span className="font-mono text-[11px] text-slate-400 shrink-0 tabular-nums">
                                    {leg.durationMin}m · ₹{leg.fareInr}
                                  </span>
                                </div>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                                  {metroStyle && leg.metroLine ? (
                                    <span
                                      className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${metroStyle.badgeBg} ${metroStyle.badgeText}`}
                                    >
                                      {localizeMetroLineName(
                                        leg.metroLine,
                                        language
                                      )}
                                    </span>
                                  ) : null}
                                  <span className="truncate">
                                    {leg.lineOrRoute}
                                  </span>
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-400">
                                  {leg.from} → {leg.to}
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-500">
                                  {leg.notes}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>

                  {/* Card Footer: Google Maps Navigation + One-Tap SOS & Live Trip Share */}
                  <div className="border-t border-slate-800/80 pt-3 space-y-2.5">
                    {(() => {
                      const travelMode = mapItineraryToTravelMode(route);
                      const waypoints = getItineraryWaypoints(route, origin, destination);
                      const gmapsUrl = buildGoogleMapsDirectionsUrl({
                        origin: origin.name,
                        destination: destination.name,
                        travelMode,
                        waypoints,
                      });
                      return (
                        <a
                          href={gmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`route-gmaps-btn-${route.category}`}
                          aria-label={`${t.googleMaps.startNavigation} — ${route.title}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors text-center"
                        >
                          <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{t.googleMaps.startNavigation}</span>
                        </a>
                      );
                    })()}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSosModalRoute(route)}
                        data-testid={`sos-share-btn-${route.category}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition-colors"
                      >
                        <PhoneCall className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>SOS &amp; Live Share</span>
                      </button>
                      <span className="font-mono text-[11px] font-medium text-slate-400 tabular-nums shrink-0">
                        {route.totalCo2Kg} kg CO₂
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* One-Tap SOS & Live Trip Share Modal */}
      {sosModalRoute && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0F172A] p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-rose-400">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <span className="font-display text-base font-bold text-white">
                    Women’s Safe-Corridor SOS &amp; Live Trip Sharing
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {sosModalRoute.title} ({localizedOriginName} → {localizedDestName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSosModalRoute(null);
                  setSosShared(false);
                }}
                aria-label="Close SOS modal"
                className="rounded-lg border border-slate-700 bg-[#0B1120] px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-[#0B1120] p-4 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Safety Rating:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {sosModalRoute.safetyRating}/100 (Verified Safe Corridor)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Police Beat:</span>
                <span className="font-medium text-white">
                  {sosModalRoute.policePatrolZone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Safe Haven Hubs Enroute:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {sosModalRoute.safeHavenHubs.map((hub, idx) => (
                    <li key={idx}>{hub}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:112"
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/70 bg-rose-600 py-3 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                <span>Call Emergency 112</span>
              </a>
              <a
                href="tel:1091"
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/50 bg-purple-500/20 py-3 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Women Helpline 1091</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setSosShared(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              <span>{sosShared ? '✓ Live GPS Trip Link Shared with Emergency Contacts' : 'Share Live GPS Trip with Trusted Contacts'}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
