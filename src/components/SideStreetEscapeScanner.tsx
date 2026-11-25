import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Compass,
  LocateFixed,
  Navigation,
  Route,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  X,
  XCircle,
} from 'lucide-react';
import { localizeBengaluruPlaceName } from '../i18n/bengaluruTransliterator';
import { useLanguage } from '../i18n/LanguageContext';
import {
  BOTTLENECK_TRANSLATIONS,
  localizeWarningOrCue,
  SIDE_STREET_UI,
} from '../i18n/sideStreetTranslations';
import {
  BottleneckId,
  EvaluatedSideStreet,
  Locality,
  SideStreetVerdict,
  TimeOfDay,
  TravelerProfile,
  WeatherCondition,
} from '../types/traffic';
import {
  BENGALURU_BOTTLENECKS,
  evaluateSideStreetEscape,
  getBottleneckById,
} from '../utils/sideStreetEngine';

interface SideStreetEscapeScannerProps {
  selectedBottleneckId: BottleneckId;
  onChangeBottleneckId: (id: BottleneckId) => void;
  destination: Locality;
  travelerProfile: TravelerProfile;
  timeOfDay: TimeOfDay;
  weatherCondition: WeatherCondition;
  onClose?: () => void;
}

function VerdictBadgeIcon({ verdict }: { verdict: SideStreetVerdict }) {
  switch (verdict) {
    case 'verified_bypass':
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-hidden="true" />;
    case 'two_wheeler_only':
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />;
    case 'dead_end':
      return <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" aria-hidden="true" />;
  }
}

export function SideStreetEscapeScanner({
  selectedBottleneckId,
  onChangeBottleneckId,
  destination,
  travelerProfile,
  timeOfDay,
  weatherCondition,
  onClose,
}: SideStreetEscapeScannerProps) {
  const { language } = useLanguage();
  const ui = SIDE_STREET_UI[language];

  const activeBottleneckMeta = useMemo(
    () => getBottleneckById(selectedBottleneckId),
    [selectedBottleneckId]
  );

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);
  const [saturationPct, setSaturationPct] = useState<number>(
    activeBottleneckMeta.defaultSideStreetSaturationPct
  );
  const [manualSafetySync, setManualSafetySync] = useState<boolean>(false);
  const [focusedStreetId, setFocusedStreetId] = useState<string | null>(null);

  useEffect(() => {
    setSaturationPct(activeBottleneckMeta.defaultSideStreetSaturationPct);
    setFocusedStreetId(null);
  }, [activeBottleneckMeta]);

  const womenSafetyActive =
    travelerProfile === 'women_commuter' || manualSafetySync;

  const scanResult = useMemo(
    () =>
      evaluateSideStreetEscape({
        bottleneckId: selectedBottleneckId,
        destinationName: destination.name,
        gpsCoords,
        sideStreetSaturationPct: saturationPct,
        womenSafetyMode: womenSafetyActive,
        timeOfDay,
        weatherCondition,
      }),
    [
      selectedBottleneckId,
      destination.name,
      gpsCoords,
      saturationPct,
      womenSafetyActive,
      timeOfDay,
      weatherCondition,
    ]
  );

  const localizedDestName = localizeBengaluruPlaceName(destination.name, language);
  const localizedBottleneck = BOTTLENECK_TRANSLATIONS[scanResult.bottleneck.id][language];

  const handleRequestGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsCoords(null);
      setGpsStatusMsg(ui.gpsUnavailableFallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setGpsCoords(coords);
        const evaluated = evaluateSideStreetEscape({
          bottleneckId: selectedBottleneckId,
          destinationName: destination.name,
          gpsCoords: coords,
          sideStreetSaturationPct: saturationPct,
          womenSafetyMode: womenSafetyActive,
          timeOfDay,
          weatherCondition,
        });
        onChangeBottleneckId(evaluated.bottleneck.id);
        setGpsStatusMsg(`${ui.gpsActiveLabel}: ${evaluated.originLabel}`);
      },
      () => {
        setGpsCoords(null);
        setGpsStatusMsg(ui.gpsUnavailableFallback);
      },
      { timeout: 3500 }
    );
  };

  const schematicCandidates = useMemo(() => {
    const all = [...scanResult.activeCandidates, ...scanResult.filteredCandidates];
    const verified = all.find((c) => c.verdict === 'verified_bypass' && !c.filteredOut)
      || all.find((c) => c.verdict === 'verified_bypass');
    const twoW = all.find((c) => c.verdict === 'two_wheeler_only');
    const dead = all.find((c) => c.verdict === 'dead_end');
    return { verified, twoW, dead };
  }, [scanResult]);

  const effectiveFocusId =
    focusedStreetId ||
    scanResult.activeCandidates[0]?.id ||
    null;

  return (
    <div
      data-testid="side-street-escape-scanner"
      className="rounded-2xl border border-amber-500/40 bg-[#0F172A] p-4 sm:p-5 space-y-5 shadow-xl shadow-black/30"
    >
      {/* Header Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Route className="h-4 w-4 text-cyan-400 shrink-0" aria-hidden="true" />
            <span>{localizedBottleneck.name}</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-cyan-300">{localizedDestName}</span>
          </div>
          <h2 className="font-display text-lg font-bold text-slate-50">
            {ui.title}
          </h2>
          <p className="max-w-3xl text-xs text-slate-400 leading-relaxed">
            {ui.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRequestGps}
            data-testid="side-street-gps-btn"
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/25 transition-colors whitespace-nowrap shrink-0"
          >
            <LocateFixed className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{ui.useLiveGps}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={ui.closeScanner}
              data-testid="side-street-close-btn"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0B1120] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{ui.closeScanner}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottleneck Picker + Guardrail Controls */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-2 rounded-xl border border-slate-800 bg-[#0B1120]/80 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="bottleneck-select"
              className="text-xs font-semibold text-slate-300"
            >
              {ui.selectBottleneck}
            </label>
            {gpsStatusMsg && (
              <span
                data-testid="side-street-gps-status"
                className="text-[11px] font-medium text-cyan-300 truncate max-w-[210px]"
              >
                {gpsStatusMsg}
              </span>
            )}
          </div>

          <select
            id="bottleneck-select"
            data-testid="side-street-bottleneck-select"
            value={scanResult.bottleneck.id}
            onChange={(e) => {
              setGpsCoords(null);
              setGpsStatusMsg(null);
              onChangeBottleneckId(e.target.value as BottleneckId);
            }}
            className="w-full rounded-lg border border-slate-700/80 bg-[#0F172A] px-3 py-2 text-xs font-medium text-slate-100 focus:border-cyan-500 focus:outline-none"
          >
            {BENGALURU_BOTTLENECKS.map((bn) => (
              <option key={bn.id} value={bn.id}>
                {BOTTLENECK_TRANSLATIONS[bn.id][language].name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
            <span className="truncate">
              <strong className="text-rose-400 font-semibold">{ui.blockedArterialLabel}:</strong>{' '}
              {localizedBottleneck.blockedRoadName}
            </span>
            <span className="font-mono font-bold text-rose-400 tabular-nums shrink-0">
              +{scanResult.bottleneck.avgGridlockDelayMin} min
            </span>
          </div>
        </div>

        {/* Residential Spillover Cap Control */}
        <div className="lg:col-span-4 space-y-2 rounded-xl border border-slate-800 bg-[#0B1120]/80 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="side-street-saturation-slider"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              <span>{ui.saturationLabel}</span>
            </label>
            <span
              data-testid="side-street-saturation-value"
              className={`font-mono text-xs font-bold tabular-nums ${
                scanResult.spilloverCapActive ? 'text-amber-300' : 'text-emerald-400'
              }`}
            >
              {saturationPct}%
            </span>
          </div>

          <input
            id="side-street-saturation-slider"
            data-testid="side-street-saturation-slider"
            type="range"
            min={30}
            max={95}
            step={1}
            value={saturationPct}
            onChange={(e) => setSaturationPct(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              {ui.destinationLabel}: <strong className="text-slate-200">{localizedDestName}</strong>
            </span>
            <button
              type="button"
              data-testid="side-street-spillover-toggle"
              onClick={() =>
                setSaturationPct((prev) =>
                  prev > 70
                    ? activeBottleneckMeta.defaultSideStreetSaturationPct
                    : 82
                )
              }
              className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                scanResult.spilloverCapActive
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                  : 'border-slate-700 bg-[#0F172A] text-slate-300 hover:border-amber-500/40'
              }`}
            >
              {scanResult.spilloverCapActive ? ui.resetSatBtn : ui.simulateHighSatBtn}
            </button>
          </div>
        </div>

        {/* Women's Safety & Monsoon Guardrail Sync */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-2 rounded-xl border border-slate-800 bg-[#0B1120]/80 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>{ui.womenSafetySyncLabel}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={womenSafetyActive}
              data-testid="side-street-safety-toggle"
              onClick={() => setManualSafetySync((prev) => !prev)}
              className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                womenSafetyActive
                  ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                  : 'border-slate-700 bg-[#0F172A] text-slate-400 hover:text-slate-200'
              }`}
            >
              {womenSafetyActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 space-y-1">
            {scanResult.safetyFilterActive || weatherCondition === 'heavy_rain' ? (
              <p className="text-emerald-300 font-medium leading-snug">
                {ui.safetyMonsoonActiveTitle} — {ui.safetyMonsoonActiveDesc}
              </p>
            ) : (
              <p className="leading-snug">{ui.safetyMonsoonActiveDesc}</p>
            )}
          </div>
        </div>
      </div>

      {/* Spillover Cap Active Warning */}
      {scanResult.spilloverCapActive && (
        <div
          data-testid="side-street-spillover-banner"
          className="flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200"
        >
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold">{ui.spilloverCapTitle}:</span>{' '}
            <span>{ui.spilloverCapDesc}</span>
          </div>
        </div>
      )}

      {/* Visual Mini-Map Corridor Schematic */}
      <div
        data-testid="side-street-schematic"
        className="rounded-xl border border-slate-800 bg-[#0B1120] p-3.5 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="inline-flex items-center gap-2 font-semibold text-slate-200">
            <Compass className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <span>{ui.schematicHeading}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-rose-500" aria-hidden="true" />
              <span>{ui.blockedArterialLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-emerald-400" aria-hidden="true" />
              <span>{ui.verdicts.verified_bypass}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-amber-400" aria-hidden="true" />
              <span>{ui.verdicts.two_wheeler_only}</span>
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 820 220"
          role="img"
          aria-label={`${ui.schematicHeading}: ${localizedBottleneck.name}`}
          className="w-full h-auto max-h-[240px] select-none rounded-lg bg-[#070B14] border border-slate-800/80"
        >
          <defs>
            <marker
              id="arrow-emerald"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
            </marker>
            <marker
              id="arrow-amber"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
            </marker>
          </defs>

          <g stroke="#1E293B" strokeWidth="1" strokeDasharray="3 5">
            <line x1="80" y1="20" x2="80" y2="200" />
            <line x1="250" y1="20" x2="250" y2="200" />
            <line x1="410" y1="20" x2="410" y2="200" />
            <line x1="570" y1="20" x2="570" y2="200" />
            <line x1="730" y1="20" x2="730" y2="200" />
          </g>

          {schematicCandidates.verified && (
            <g
              onClick={() => setFocusedStreetId(schematicCandidates.verified!.id)}
              className="cursor-pointer"
              opacity={schematicCandidates.verified.filteredOut ? 0.35 : 1}
            >
              <path
                d="M 115 110 C 175 34, 620 34, 695 110"
                fill="none"
                stroke="#10B981"
                strokeWidth={
                  effectiveFocusId === schematicCandidates.verified.id ? 6 : 4
                }
                markerEnd="url(#arrow-emerald)"
              />
              <rect
                x="255"
                y="22"
                width="310"
                height="26"
                rx="6"
                fill="#064E3B"
                stroke="#10B981"
                strokeWidth="1.2"
              />
              <text
                x="410"
                y="39"
                textAnchor="middle"
                fill="#A7F3D0"
                fontSize="11.5"
                fontWeight="700"
              >
                {localizeWarningOrCue(
                  schematicCandidates.verified.id,
                  'verified_bypass',
                  schematicCandidates.verified.name,
                  'name',
                  language
                ).slice(0, 40)}{' '}
                (-{schematicCandidates.verified.timeSavedMin}m)
              </text>
            </g>
          )}

          {/* Main Blocked Arterial Road (Red) */}
          <line
            x1="75"
            y1="110"
            x2="745"
            y2="110"
            stroke="#EF4444"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.88"
          />
          <line
            x1="230"
            y1="110"
            x2="585"
            y2="110"
            stroke="#FCA5A5"
            strokeWidth="2"
            strokeDasharray="10 8"
          />

          {/* Bottleneck Center Chokepoint */}
          <g transform="translate(410, 110)">
            <rect
              x="-72"
              y="-14"
              width="144"
              height="28"
              rx="6"
              fill="#7F1D1D"
              stroke="#EF4444"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#FEE2E2"
              fontSize="11"
              fontWeight="700"
            >
              {ui.gridlockLabel} · +{scanResult.bottleneck.avgGridlockDelayMin}m
            </text>
          </g>

          {schematicCandidates.twoW && (
            <g
              onClick={() => setFocusedStreetId(schematicCandidates.twoW!.id)}
              className="cursor-pointer"
              opacity={schematicCandidates.twoW.filteredOut ? 0.28 : 1}
            >
              <path
                d="M 150 110 C 215 162, 575 162, 650 110"
                fill="none"
                stroke="#F59E0B"
                strokeWidth={
                  effectiveFocusId === schematicCandidates.twoW.id ? 4.5 : 3
                }
                strokeDasharray="7 5"
                markerEnd="url(#arrow-amber)"
              />
              <rect
                x="180"
                y="155"
                width="230"
                height="24"
                rx="5"
                fill="#451A03"
                stroke="#F59E0B"
                strokeWidth="1"
              />
              <text
                x="295"
                y="171"
                textAnchor="middle"
                fill="#FDE68A"
                fontSize="11"
                fontWeight="700"
              >
                {schematicCandidates.twoW.roadWidthMeters}m · {ui.verdicts.two_wheeler_only}
              </text>
            </g>
          )}

          {schematicCandidates.dead && (
            <g
              onClick={() => setFocusedStreetId(schematicCandidates.dead!.id)}
              className="cursor-pointer"
            >
              <path
                d="M 465 110 L 520 190 L 585 190"
                fill="none"
                stroke="#F43F5E"
                strokeWidth="3.5"
                strokeDasharray="4 4"
              />
              <circle cx="592" cy="190" r="9" fill="#4C0519" stroke="#F43F5E" strokeWidth="1.5" />
              <text
                x="592"
                y="194"
                textAnchor="middle"
                fill="#FDA4AF"
                fontSize="11"
                fontWeight="700"
              >
                ✕
              </text>
              <text
                x="610"
                y="194"
                textAnchor="start"
                fill="#FDA4AF"
                fontSize="10.5"
                fontWeight="700"
              >
                {ui.verdicts.dead_end}
              </text>
            </g>
          )}

          {/* Origin "YOU" Marker */}
          <g transform="translate(88, 110)">
            <circle r="11" fill="#06B6D4" stroke="#0F172A" strokeWidth="2.5" />
            <text
              x="0"
              y="-18"
              textAnchor="middle"
              fill="#67E8F9"
              fontSize="11"
              fontWeight="700"
            >
              {ui.youAreHere}
            </text>
          </g>

          {/* Rejoin Ahead Destination Marker */}
          <g transform="translate(725, 110)">
            <circle r="11" fill="#10B981" stroke="#0F172A" strokeWidth="2.5" />
            <text
              x="0"
              y="-18"
              textAnchor="middle"
              fill="#6EE7B7"
              fontSize="11"
              fontWeight="700"
            >
              {ui.rejoinAheadLabel}
            </text>
          </g>
        </svg>
      </div>

      {/* Evaluated Side-Street Verdict Cards */}
      <div
        className={`grid grid-cols-1 gap-3.5 ${
          scanResult.activeCandidates.length >= 4
            ? 'md:grid-cols-2 xl:grid-cols-4'
            : scanResult.activeCandidates.length === 3
              ? 'md:grid-cols-3'
              : 'md:grid-cols-2'
        }`}
      >
        {scanResult.activeCandidates.map((cand: EvaluatedSideStreet) => {
          const isFocused = effectiveFocusId === cand.id;
          const borderClass =
            cand.verdict === 'verified_bypass'
              ? cand.carDiversionCapped
                ? 'border-amber-500/40'
                : 'border-emerald-500/45'
              : cand.verdict === 'two_wheeler_only'
                ? 'border-amber-500/45'
                : 'border-rose-500/45';

          const verdictTextColor =
            cand.verdict === 'verified_bypass'
              ? cand.carDiversionCapped
                ? 'text-amber-300'
                : 'text-emerald-300'
              : cand.verdict === 'two_wheeler_only'
                ? 'text-amber-300'
                : 'text-rose-300';

          const localizedName = localizeWarningOrCue(
            cand.id,
            cand.verdict,
            cand.name,
            'name',
            language
          );
          const localizedCue = localizeWarningOrCue(
            cand.id,
            cand.verdict,
            cand.turnCue,
            'turnCue',
            language
          );
          const localizedRejoin = localizeWarningOrCue(
            cand.id,
            cand.verdict,
            cand.rejoinLandmark,
            'rejoinLandmark',
            language
          );
          const localizedWarn = cand.warningNote
            ? localizeWarningOrCue(
                cand.id,
                cand.verdict,
                cand.warningNote,
                'warningNote',
                language
              )
            : '';

          return (
            <article
              key={cand.id}
              data-testid={`side-street-card-${cand.verdict}`}
              data-candidate-id={cand.id}
              className={`rounded-xl border ${borderClass} ${
                isFocused
                  ? 'bg-[#111C33] ring-2 ring-cyan-500/40'
                  : 'bg-[#0B1120]/70'
              } p-4 flex flex-col justify-between gap-3`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setFocusedStreetId(cand.id)}
                    aria-pressed={isFocused}
                    className={`inline-flex items-center gap-1.5 text-left text-[11px] font-bold tracking-wide ${verdictTextColor}`}
                  >
                    <VerdictBadgeIcon verdict={cand.verdict} />
                    <span>{ui.verdicts[cand.verdict]}</span>
                  </button>

                  {cand.timeSavedMin > 0 && (
                    <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums shrink-0">
                      -{cand.timeSavedMin} {ui.timeSavedSuffix}
                    </span>
                  )}
                </div>

                <h3 className="font-display text-sm font-bold text-slate-100 leading-snug">
                  {localizedName}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {localizedCue}
                </p>

                {cand.verdict !== 'dead_end' && (
                  <p className="text-[11px] text-cyan-300 font-medium">
                    {ui.rejoinsPrefix} {localizedRejoin} ({cand.rejoinDistanceKm} km)
                  </p>
                )}

                {localizedWarn && (
                  <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-[11px] text-rose-200 leading-snug">
                    {localizedWarn}
                  </p>
                )}

                {cand.carDiversionCapped && (
                  <p
                    data-testid={`spillover-capped-note-${cand.id}`}
                    className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-200 leading-snug"
                  >
                    {ui.carCappedNotice}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 border-t border-slate-800/80 pt-2.5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200">
                    {ui.suitabilityLabels[cand.effectiveSuitability]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {ui.roadWidthLabel}: {cand.roadWidthMeters}m
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {cand.wellLit && cand.policePatrolled
                      ? ui.litPatrolledTag
                      : ui.unlitTag}
                  </span>
                </div>

                {cand.googleMapsUrl && (
                  <a
                    href={cand.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`escape-gmaps-btn-${cand.id}`}
                    aria-label={`${ui.escapeGoogleMapsBtn} — ${localizedName}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap"
                  >
                    <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{ui.escapeGoogleMapsBtn}</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Filtered by Safety & Monsoon Guardrails */}
      {scanResult.filteredCandidates.length > 0 && (
        <div
          data-testid="side-street-filtered-list"
          className="rounded-xl border border-slate-800 bg-[#0B1120]/70 p-3.5 space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <CloudRain className="h-3.5 w-3.5 text-sky-400 shrink-0" aria-hidden="true" />
            <span>
              {ui.filteredHeader} ({scanResult.filteredCandidates.length})
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {scanResult.filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                data-testid={`filtered-street-${cand.id}`}
                className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-[#0F172A] px-3 py-2 text-xs text-slate-400"
              >
                <span className="font-medium text-slate-300 line-through">
                  {localizeWarningOrCue(cand.id, cand.verdict, cand.name, 'name', language)}
                </span>
                <span className="text-[11px] font-medium text-rose-300">
                  {cand.filterReasons
                    .map((r) => ui.filterReasonLabels[r])
                    .join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
