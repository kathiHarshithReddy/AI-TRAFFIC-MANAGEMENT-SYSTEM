import { useMemo, useState } from 'react';
import {
  Cross,
  Flame,
  HeartHandshake,
  Navigation,
  Pause,
  Pill,
  Play,
  Shield,
  TrafficCone,
  TrainFront,
} from 'lucide-react';
import { DASHBOARD_UI } from '../i18n/dashboardTranslations';
import { localizeBengaluruPlaceName } from '../i18n/bengaluruTransliterator';
import { useLanguage } from '../i18n/LanguageContext';
import { GreenCorridorVehicle } from '../types/traffic';
import {
  ISOMETRIC_SAFE_HAVEN_PINS,
  IsometricPinCategory,
  IsometricSafeHavenPin,
} from '../utils/dashboardEngine';
import { buildGoogleMapsDirectionsUrl } from '../utils/googleMapsNav';

interface IsometricCityMap3DProps {
  selectedVehicle: GreenCorridorVehicle;
  isSimRunning: boolean;
  onToggleSim: () => void;
  onToggleRoadblock: () => void;
}

const PIN_STYLES: Record<
  IsometricPinCategory,
  { bg: string; border: string; text: string; dot: string; labelKey: keyof typeof DASHBOARD_UI.en.map3d.legend }
> = {
  hospital: {
    bg: 'bg-rose-500',
    border: 'border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    labelKey: 'hospital',
  },
  police: {
    bg: 'bg-blue-600',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-600',
    labelKey: 'police',
  },
  fire: {
    bg: 'bg-orange-500',
    border: 'border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    labelKey: 'fire',
  },
  pharmacy: {
    bg: 'bg-teal-500',
    border: 'border-teal-200',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
    labelKey: 'pharmacy',
  },
  women_help: {
    bg: 'bg-purple-600',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-600',
    labelKey: 'womenHelp',
  },
  metro: {
    bg: 'bg-emerald-600',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    labelKey: 'metro',
  },
};

function PinCategoryIcon({ category }: { category: IsometricPinCategory }) {
  const cls = 'h-3.5 w-3.5 text-white';
  switch (category) {
    case 'hospital':
      return <Cross className={cls} aria-hidden="true" />;
    case 'police':
      return <Shield className={cls} aria-hidden="true" />;
    case 'fire':
      return <Flame className={cls} aria-hidden="true" />;
    case 'pharmacy':
      return <Pill className={cls} aria-hidden="true" />;
    case 'women_help':
      return <HeartHandshake className={cls} aria-hidden="true" />;
    case 'metro':
      return <TrainFront className={cls} aria-hidden="true" />;
  }
}

// Isometric corridor polyline points inside SVG viewBox (900 x 470)
const PRIMARY_CORRIDOR_PATH = 'M 140 315 L 315 245 L 510 185 L 705 135';
const ALTERNATE_CORRIDOR_PATH = 'M 140 315 Q 290 365 495 305 T 705 135';

function pointAlongPrimary(progressPct: number): { x: number; y: number } {
  const pts = [
    { x: 140, y: 315 },
    { x: 315, y: 245 },
    { x: 510, y: 185 },
    { x: 705, y: 135 },
  ];
  const t = Math.min(1, Math.max(0, progressPct / 100));
  const scaled = t * (pts.length - 1);
  const idx = Math.min(pts.length - 2, Math.floor(scaled));
  const localT = scaled - idx;
  const a = pts[idx];
  const b = pts[idx + 1];
  return {
    x: a.x + (b.x - a.x) * localT,
    y: a.y + (b.y - a.y) * localT,
  };
}

export function IsometricCityMap3D({
  selectedVehicle,
  isSimRunning,
  onToggleSim,
  onToggleRoadblock,
}: IsometricCityMap3DProps) {
  const { language } = useLanguage();
  const copy = DASHBOARD_UI[language];
  const [selectedPin, setSelectedPin] = useState<IsometricSafeHavenPin>(
    ISOMETRIC_SAFE_HAVEN_PINS[0]
  );

  const vehiclePos = useMemo(
    () => pointAlongPrimary(selectedVehicle.progressPct),
    [selectedVehicle.progressPct]
  );

  const signalNodes = useMemo(() => {
    const coords = [
      { x: 245, y: 273 },
      { x: 390, y: 222 },
      { x: 545, y: 176 },
      { x: 645, y: 150 },
    ];
    return selectedVehicle.signals.slice(0, 4).map((sig, i) => ({
      ...sig,
      x: coords[i]?.x ?? 450,
      y: coords[i]?.y ?? 200,
    }));
  }, [selectedVehicle.signals]);

  const distanceRemainingKm = useMemo(
    () =>
      Number(
        (Math.max(0.8, (100 - selectedVehicle.progressPct) * 0.12)).toFixed(1)
      ),
    [selectedVehicle.progressPct]
  );

  return (
    <section
      aria-label={copy.map3d.title}
      data-testid="isometric-3d-map-card"
      className="bento-card overflow-hidden flex flex-col"
    >
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 bg-white">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base font-bold text-slate-900">
              {copy.map3d.title}
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              {copy.map3d.corridorBadge}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{copy.map3d.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleSim}
            data-testid="map3d-play-pause-btn"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            {isSimRunning ? (
              <>
                <Pause className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                <span>{copy.map3d.liveMotion}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                <span>{copy.map3d.pausedMotion}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleRoadblock}
            data-testid="map3d-roadblock-btn"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              selectedVehicle.roadblockActive
                ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            <TrafficCone className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            <span>
              {selectedVehicle.roadblockActive
                ? copy.map3d.bypassActive
                : copy.map3d.simulateBypass}
            </span>
          </button>
        </div>
      </div>

      {/* 3D Isometric City Canvas */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#ECFDF5] px-3 pt-3 pb-4 sm:px-5">
        {/* Pin Category Legend Strip */}
        <div className="relative z-10 mb-2 flex flex-wrap items-center gap-2">
          {(Object.keys(PIN_STYLES) as IsometricPinCategory[]).map((cat) => {
            const st = PIN_STYLES[cat];
            return (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs backdrop-blur-xs"
              >
                <span className={`h-2 w-2 rounded-full ${st.dot}`} aria-hidden="true" />
                <span>{copy.map3d.legend[st.labelKey]}</span>
              </span>
            );
          })}
        </div>

        {/* Layered 2.5D Isometric Vector Cityscape + Live Green Corridor */}
        <div className="relative rounded-2xl border border-slate-200/80 bg-gradient-to-b from-sky-50/70 via-white to-emerald-50/40 overflow-hidden shadow-inner">
          <svg
            viewBox="0 0 900 430"
            role="img"
            aria-label={copy.map3d.title}
            data-testid="isometric-3d-svg"
            className="w-full h-auto block select-none"
          >
            <defs>
              <pattern id="isoGridPattern" width="48" height="28" patternUnits="userSpaceOnUse">
                <path
                  d="M 24 0 L 48 14 L 24 28 L 0 14 Z"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="0.65"
                  strokeOpacity="0.55"
                />
              </pattern>
              <linearGradient id="emeraldWaveGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <filter id="softIsoShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.12" />
              </filter>
              <filter id="greenCorridorGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Isometric Diamond Ground Grid */}
            <rect width="900" height="430" fill="url(#isoGridPattern)" />

            {/* Soft Park / Cubbon & Ulsoor Lake Green Zones */}
            <polygon points="95,120 220,75 310,125 185,175" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1" />
            <polygon points="560,295 700,245 795,295 660,348" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1" />

            {/* Isometric Secondary Streets */}
            <g stroke="#E2E8F0" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <polyline points="60,210 380,105 780,260" />
              <polyline points="190,385 480,275 820,165" />
              <polyline points="110,130 430,360" />
              <polyline points="350,60 640,340" />
            </g>
            <g stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <polyline points="60,210 380,105 780,260" />
              <polyline points="190,385 480,275 820,165" />
              <polyline points="110,130 430,360" />
              <polyline points="350,60 640,340" />
            </g>

            {/* Elevated Namma Metro Isometric Viaduct */}
            <g opacity="0.9">
              <path d="M 90 190 L 420 88 L 800 220" stroke="#94A3B8" strokeWidth="9" fill="none" strokeLinecap="round" />
              <path d="M 90 186 L 420 84 L 800 216" stroke="#A855F7" strokeWidth="3.5" fill="none" strokeDasharray="10 6" />
            </g>

            {/* 3D Isometric Bengaluru Tech Towers & Civic Buildings */}
            {[
              { x: 135, y: 185, w: 36, h: 48, top: '#E0F2FE', left: '#BAE6FD', right: '#7DD3FC' },
              { x: 280, y: 120, w: 42, h: 64, top: '#DBEAFE', left: '#93C5FD', right: '#60A5FA' },
              { x: 435, y: 112, w: 46, h: 58, top: '#ECFDF5', left: '#A7F3D0', right: '#6EE7B7' },
              { x: 610, y: 88, w: 44, h: 72, top: '#E0E7FF', left: '#A5B4FC', right: '#818CF8' },
              { x: 755, y: 180, w: 38, h: 54, top: '#F1F5F9', left: '#CBD5E1', right: '#94A3B8' },
              { x: 485, y: 270, w: 40, h: 46, top: '#E0F2FE', left: '#BAE6FD', right: '#7DD3FC' },
              { x: 225, y: 318, w: 34, h: 42, top: '#F8FAFC', left: '#CBD5E1', right: '#94A3B8' },
            ].map((b, i) => (
              <g key={i} filter="url(#softIsoShadow)">
                {/* Left Wall */}
                <polygon
                  points={`${b.x},${b.y} ${b.x + b.w / 2},${b.y + 12} ${b.x + b.w / 2},${b.y + 12 - b.h} ${b.x},${b.y - b.h}`}
                  fill={b.left}
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                />
                {/* Right Wall */}
                <polygon
                  points={`${b.x + b.w / 2},${b.y + 12} ${b.x + b.w},${b.y} ${b.x + b.w},${b.y - b.h} ${b.x + b.w / 2},${b.y + 12 - b.h}`}
                  fill={b.right}
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                />
                {/* Roof */}
                <polygon
                  points={`${b.x},${b.y - b.h} ${b.x + b.w / 2},${b.y - 12 - b.h} ${b.x + b.w},${b.y - b.h} ${b.x + b.w / 2},${b.y + 12 - b.h}`}
                  fill={b.top}
                  stroke="#FFFFFF"
                  strokeWidth="0.9"
                />
              </g>
            ))}

            {/* 3D Isometric Trees */}
            {[
              [145, 132],
              [185, 148],
              [220, 118],
              [345, 290],
              [555, 222],
              [650, 280],
              [720, 298],
            ].map(([tx, ty], idx) => (
              <g key={idx}>
                <ellipse cx={tx} cy={ty + 7} rx="8" ry="4" fill="#10B981" fillOpacity="0.2" />
                <rect x={tx - 1.5} y={ty - 1} width="3" height="8" fill="#78350F" />
                <circle cx={tx} cy={ty - 5} r="8" fill="#34D399" />
                <circle cx={tx - 2} cy={ty - 7} r="5.5" fill="#6EE7B7" />
              </g>
            ))}

            {/* Main Arterial Roadbed Beneath Green Corridor */}
            <path
              d={PRIMARY_CORRIDOR_PATH}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={PRIMARY_CORRIDOR_PATH}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Alternate Bypass Dashed Arc (highlighted when roadblock active) */}
            <path
              d={ALTERNATE_CORRIDOR_PATH}
              fill="none"
              stroke="#F59E0B"
              strokeWidth={selectedVehicle.roadblockActive ? 6 : 2.5}
              strokeDasharray="8 6"
              strokeOpacity={selectedVehicle.roadblockActive ? 0.95 : 0.45}
              strokeLinecap="round"
            />

            {/* Glowing Emerald Green Corridor Line */}
            <path
              d={PRIMARY_CORRIDOR_PATH}
              fill="none"
              stroke={selectedVehicle.roadblockActive ? '#EF4444' : 'url(#emeraldWaveGrad)'}
              strokeWidth={selectedVehicle.roadblockActive ? 4 : 8}
              strokeDasharray={selectedVehicle.roadblockActive ? '7 6' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={selectedVehicle.roadblockActive ? undefined : 'url(#greenCorridorGlow)'}
            />

            {/* Real-time 3D Traffic Signals Along Corridor */}
            {signalNodes.map((sig, idx) => {
              const isGreen = sig.currentPhase === 'GREEN';
              const badgeColor = isGreen ? '#10B981' : '#F59E0B';
              const shortName = sig.name
                .replace(' Signal', '')
                .replace(' Junction', '')
                .replace(' Flyover', '');
              const statusText = isGreen
                ? copy.rightPanel.statusGreen
                : copy.rightPanel.statusPreparing;
              const pillWidth = Math.max(108, shortName.length * 5.6 + statusText.length * 5.2 + 28);
              const placeBelow = idx % 2 === 0;
              const pillTransform = placeBelow
                ? 'translate(10, 14)'
                : `translate(${-pillWidth - 10}, -28)`;
              return (
                <g
                  key={sig.id}
                  transform={`translate(${sig.x}, ${sig.y})`}
                  data-testid={`iso-signal-${sig.id}`}
                >
                  {isGreen && (
                    <circle
                      r="17"
                      fill="#10B981"
                      fillOpacity="0.2"
                      className="svg-corridor-ripple-active"
                    />
                  )}
                  <rect x="-2" y="-22" width="4" height="22" rx="1.5" fill="#334155" />
                  <rect x="-8" y="-34" width="16" height="16" rx="4" fill="#0F172A" />
                  <circle cx="0" cy="-26" r="5" fill={badgeColor} stroke="#FFFFFF" strokeWidth="1.2" />
                  <g transform={pillTransform}>
                    <rect
                      x="0"
                      y="-9"
                      width={pillWidth}
                      height="18"
                      rx="9"
                      fill="#FFFFFF"
                      fillOpacity="0.96"
                      stroke={isGreen ? '#10B981' : '#F59E0B'}
                      strokeWidth="1.2"
                    />
                    <text x="9" y="3" fill="#0F172A" fontSize="9.2" fontWeight="700">
                      {shortName} · {statusText}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Moving 3D Transit / Commuter Cars */}
            <g transform="translate(215, 285)">
              <polygon points="-10,0 0,-6 12,0 2,6" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1" />
            </g>
            <g transform="translate(595, 162)">
              <polygon points="-11,0 0,-6 13,0 2,6" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1" />
            </g>

            {/* Animated 3D Ambulance Moving Along Emerald Green Corridor */}
            <g
              transform={`translate(${vehiclePos.x}, ${vehiclePos.y})`}
              data-testid="iso-3d-ambulance"
            >
              <circle r="24" fill="#EF4444" fillOpacity="0.16" className="svg-corridor-ripple-active" />
              <ellipse cx="0" cy="8" rx="18" ry="7" fill="#0F172A" fillOpacity="0.18" />
              {/* 3D Isometric Ambulance Box */}
              <polygon points="-18,-2 0,-11 18,-2 0,7" fill="#FFFFFF" stroke="#EF4444" strokeWidth="1.6" />
              <polygon points="-18,-2 0,7 0,14 -18,5" fill="#FFE4E6" stroke="#E11D48" strokeWidth="1" />
              <polygon points="0,7 18,-2 18,5 0,14" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
              {/* Red Cross & Roof Beacon */}
              <circle cx="0" cy="-10" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.2" />
              <g transform="translate(0, -35)">
                <rect x="-56" y="-11" width="112" height="19" rx="9.5" fill="#0F172A" />
                <text x="0" y="2" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
                  {selectedVehicle.callSign.split('(')[0].trim()} · {selectedVehicle.speedKmh} km/h
                </text>
              </g>
            </g>

            {/* Corridor Origin & Hospital Destination Labels */}
            <g transform="translate(115, 360)">
              <rect x="-54" y="-10" width="108" height="20" rx="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
              <text x="0" y="3.5" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700">
                {localizeBengaluruPlaceName(selectedVehicle.originName, language).slice(0, 16)}
              </text>
            </g>
            <g transform="translate(690, 165)">
              <rect x="-76" y="-11" width="152" height="22" rx="11" fill="#059669" />
              <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                {selectedVehicle.destination.name.split('(')[0].trim().slice(0, 22)}
              </text>
            </g>
          </svg>

          {/* Interactive Floating 3D Safe Haven & Transit Pins */}
          {ISOMETRIC_SAFE_HAVEN_PINS.map((pin) => {
            const st = PIN_STYLES[pin.category];
            const isSelected = selectedPin.id === pin.id;
            return (
              <button
                key={pin.id}
                type="button"
                onClick={() => setSelectedPin(pin)}
                data-testid={`iso-pin-${pin.category}-${pin.id}`}
                aria-label={`${pin.name} (${copy.map3d.legend[st.labelKey]})`}
                style={{ left: `${pin.xPct}%`, top: `${pin.yPct}%` }}
                className="group absolute -translate-x-1/2 -translate-y-full focus-visible:outline-none"
              >
                <div
                  className={`iso-pin-float flex flex-col items-center transition-transform ${
                    isSelected ? 'scale-110' : 'hover:scale-110'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 border-white shadow-md ${st.bg} ${
                      isSelected ? 'ring-3 ring-blue-400/50' : ''
                    }`}
                  >
                    <PinCategoryIcon category={pin.category} />
                  </span>
                  <span className="h-1.5 sm:h-2 w-0.5 bg-slate-700/70" aria-hidden="true" />
                  <span className="h-1 w-2.5 sm:h-1.5 sm:w-3 rounded-full bg-slate-900/20" aria-hidden="true" />
                </div>
              </button>
            );
          })}

          {/* Selected Pin Floating Info Chip */}
          <div
            data-testid="iso-selected-pin-card"
            className="hidden sm:flex items-center justify-between gap-3 absolute top-3 left-3 z-10 max-w-xs rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm"
          >
            <div className="min-w-0">
              <div className={`text-[10px] font-bold uppercase tracking-wider ${PIN_STYLES[selectedPin.category].text}`}>
                {copy.map3d.legend[PIN_STYLES[selectedPin.category].labelKey]} · 24/7
              </div>
              <div className="truncate text-xs font-bold text-slate-900">
                {selectedPin.name}
              </div>
              <div className="text-[11px] font-mono text-slate-500">{selectedPin.phone}</div>
            </div>
            <a
              href={buildGoogleMapsDirectionsUrl({
                destination: selectedPin.name,
                travelMode: 'driving',
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              title={copy.rightPanel.trackLiveBtn}
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Bottom Overlay Telemetry Bar inside Map Card */}
        <div
          data-testid="iso-map-telemetry-bar"
          className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <div className="text-[11px] font-medium text-slate-500">{copy.map3d.etaLabel}</div>
              <div className="font-mono text-base font-extrabold text-emerald-600 tabular-nums">
                {selectedVehicle.optimizedEtaMin} {copy.kpis.minUnit}
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />
            <div>
              <div className="text-[11px] font-medium text-slate-500">{copy.map3d.distanceLabel}</div>
              <div className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
                {distanceRemainingKm} km
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />
            <div>
              <div className="text-[11px] font-medium text-slate-500">
                {copy.map3d.selectedPinLabel}
              </div>
              <div className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                {selectedPin.name}
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xs w-full space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">{copy.map3d.routeProgressLabel}</span>
              <span className="font-mono font-bold text-emerald-600 tabular-nums">
                {selectedVehicle.progressPct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${selectedVehicle.progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
