import { useLanguage } from '../i18n/LanguageContext';
import {
  EmergencyDestinationHub,
  GreenCorridorVehicle,
  RouteWaypoint,
} from '../types/traffic';
import {
  EMERGENCY_DESTINATION_HUBS,
  interpolateVehiclePosition,
} from '../utils/greenCorridorEngine';

interface GreenCorridorMapProps {
  vehicles: GreenCorridorVehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
}

const BOUNDS = {
  minLat: 12.79,
  maxLat: 13.11,
  minLng: 77.50,
  maxLng: 77.77,
};

const SVG_W = 860;
const SVG_H = 470;
const PAD_X = 46;
const PAD_Y = 38;

function project(lat: number, lng: number): { x: number; y: number } {
  const xRatio = (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng);
  const yRatio = (BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat);
  const x = PAD_X + Math.min(1, Math.max(0, xRatio)) * (SVG_W - PAD_X * 2);
  const y = PAD_Y + Math.min(1, Math.max(0, yRatio)) * (SVG_H - PAD_Y * 2);
  return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
}

function toPolylinePoints(waypoints: RouteWaypoint[]): string {
  return waypoints
    .map((wp) => {
      const p = project(wp.lat, wp.lng);
      return `${p.x},${p.y}`;
    })
    .join(' ');
}

const CITY_LANDMARKS: Array<{ name: string; lat: number; lng: number }> = [
  { name: 'Hebbal', lat: 13.0358, lng: 77.597 },
  { name: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
  { name: 'Yeshwanthpur', lat: 13.025, lng: 77.549 },
  { name: 'Majestic / CBD', lat: 12.9756, lng: 77.5728 },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'KR Puram', lat: 13.0012, lng: 77.6961 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
  { name: 'Marathahalli', lat: 12.9562, lng: 77.7019 },
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Bellandur', lat: 12.9279, lng: 77.6762 },
  { name: 'Silk Board', lat: 12.9177, lng: 77.6238 },
  { name: 'Jayanagar', lat: 12.9279, lng: 77.5831 },
  { name: 'RR Nagar', lat: 12.9255, lng: 77.5177 },
  { name: 'Electronic City', lat: 12.8452, lng: 77.6602 },
];

const ARTERIAL_SPINES: Array<Array<[number, number]>> = [
  [
    [13.025, 77.549],
    [13.0358, 77.597],
    [13.045, 77.6203],
    [13.0012, 77.6961],
    [12.9562, 77.7019],
    [12.9279, 77.6762],
    [12.9177, 77.6238],
    [12.9167, 77.6001],
    [12.9255, 77.5468],
    [12.9255, 77.5177],
  ],
  [
    [13.1007, 77.5963],
    [13.0358, 77.597],
    [12.9784, 77.5937],
    [12.9352, 77.6245],
    [12.9177, 77.6238],
    [12.8452, 77.6602],
  ],
  [
    [12.9255, 77.5177],
    [12.9756, 77.5728],
    [12.9784, 77.6408],
    [12.9698, 77.7499],
  ],
];

function vehicleBadgeColor(type: GreenCorridorVehicle['type']): {
  fill: string;
  stroke: string;
  glyph: string;
} {
  if (type === 'ambulance') {
    return { fill: '#EF4444', stroke: '#FCA5A5', glyph: '108' };
  }
  if (type === 'fire_engine') {
    return { fill: '#F97316', stroke: '#FDBA74', glyph: '101' };
  }
  return { fill: '#3B82F6', stroke: '#93C5FD', glyph: '112' };
}

function hubShortTag(hub: EmergencyDestinationHub): string {
  if (hub.type === 'hospital') return 'H';
  if (hub.type === 'fire_command') return 'F';
  return 'P';
}

export function GreenCorridorMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: GreenCorridorMapProps) {
  const { t } = useLanguage();
  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const selectedPos = selectedVehicle
    ? interpolateVehiclePosition(selectedVehicle)
    : null;

  return (
    <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] overflow-hidden">
      {/* Map Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-4 py-3 bg-[#0B1120]/70">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            {t.corridor.mapTitle}
          </h2>
          {selectedVehicle && selectedPos && (
            <p className="text-xs font-mono text-emerald-400">
              {selectedVehicle.callSign} · GPS {selectedPos.lat.toFixed(4)}°N,{' '}
              {selectedPos.lng.toFixed(4)}°E · {selectedVehicle.speedKmh} km/h
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-emerald-400 inline-block" />
            {t.corridor.mapLegendPrimary}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-amber-400 inline-block" />
            {t.corridor.mapLegendAlternate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" />
            {t.corridor.mapLegendGreenSignal}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
            {t.corridor.mapLegendRedSignal}
          </span>
        </div>
      </div>

      {/* Interactive Geo-Projected SVG Map */}
      <div className="relative bg-[#070B14]">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          data-testid="green-corridor-map-svg"
          role="img"
          aria-label={t.corridor.mapTitle}
          className="w-full h-auto block select-none"
        >
          <defs>
            <pattern
              id="grid-blr"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1E293B"
                strokeWidth="0.6"
                strokeOpacity="0.6"
              />
            </pattern>
            <filter id="green-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={SVG_W} height={SVG_H} fill="url(#grid-blr)" />

          {/* Arterial city corridor base lines */}
          {ARTERIAL_SPINES.map((spine, idx) => (
            <polyline
              key={idx}
              fill="none"
              stroke="#1E293B"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={spine
                .map(([lat, lng]) => {
                  const p = project(lat, lng);
                  return `${p.x},${p.y}`;
                })
                .join(' ')}
            />
          ))}

          {/* Reference Bengaluru locality labels */}
          {CITY_LANDMARKS.map((lm) => {
            const nearActiveSignal = selectedVehicle?.signals.some(
              (sig) =>
                Math.abs(sig.lat - lm.lat) < 0.024 &&
                Math.abs(sig.lng - lm.lng) < 0.032
            );
            const nearTargetHub =
              selectedVehicle &&
              Math.abs(selectedVehicle.destination.lat - lm.lat) < 0.022 &&
              Math.abs(selectedVehicle.destination.lng - lm.lng) < 0.032;
            if (nearActiveSignal || nearTargetHub) return null;

            const p = project(lm.lat, lm.lng);
            return (
              <g key={lm.name} transform={`translate(${p.x}, ${p.y})`}>
                <circle r="2.2" fill="#475569" />
                <text
                  x="5"
                  y="3"
                  fill="#64748B"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {lm.name}
                </text>
              </g>
            );
          })}

          {/* Emergency Destination Hubs */}
          {EMERGENCY_DESTINATION_HUBS.map((hub) => {
            const p = project(hub.lat, hub.lng);
            const isTarget = selectedVehicle?.destination.id === hub.id;
            const shortHubName = hub.name.split('(')[0].trim();
            return (
              <g
                key={hub.id}
                transform={`translate(${p.x}, ${p.y})`}
                opacity={isTarget ? 1 : 0.72}
              >
                <rect
                  x="-9"
                  y="-9"
                  width="18"
                  height="18"
                  rx="4"
                  fill={isTarget ? '#0EA5E9' : '#0F172A'}
                  stroke={isTarget ? '#7DD3FC' : '#475569'}
                  strokeWidth={isTarget ? 2 : 1.2}
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={isTarget ? '#082F49' : '#CBD5E1'}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {hubShortTag(hub)}
                </text>
                {isTarget && (
                  <g transform="translate(12, -13)">
                    <rect
                      x="0"
                      y="-9"
                      width={shortHubName.length * 5.8 + 10}
                      height="15"
                      rx="4"
                      fill="#0B1120"
                      fillOpacity="0.92"
                      stroke="#0EA5E9"
                      strokeWidth="0.9"
                    />
                    <text
                      x="5"
                      y="2"
                      fill="#7DD3FC"
                      fontSize="9.5"
                      fontWeight="700"
                    >
                      {shortHubName}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Non-selected fleet subtle route paths */}
          {vehicles
            .filter((v) => v.id !== selectedVehicleId)
            .map((v) => (
              <polyline
                key={`route-bg-${v.id}`}
                fill="none"
                stroke="#334155"
                strokeWidth="2"
                strokeOpacity="0.55"
                points={toPolylinePoints(
                  v.roadblockActive ? v.alternateRoute : v.primaryRoute
                )}
              />
            ))}

          {/* Selected vehicle primary + AI bypass routes */}
          {selectedVehicle && (
            <g>
              <polyline
                fill="none"
                stroke={
                  selectedVehicle.roadblockActive ? '#EF4444' : '#10B981'
                }
                strokeWidth={selectedVehicle.roadblockActive ? 2.5 : 4.5}
                strokeDasharray={
                  selectedVehicle.roadblockActive ? '5 5' : undefined
                }
                strokeOpacity={selectedVehicle.roadblockActive ? 0.65 : 0.92}
                filter={
                  selectedVehicle.roadblockActive
                    ? undefined
                    : 'url(#green-glow)'
                }
                strokeLinecap="round"
                strokeLinejoin="round"
                points={toPolylinePoints(selectedVehicle.primaryRoute)}
              />

              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeWidth={selectedVehicle.roadblockActive ? 4 : 1.8}
                strokeDasharray="7 5"
                strokeOpacity={selectedVehicle.roadblockActive ? 0.95 : 0.45}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={toPolylinePoints(selectedVehicle.alternateRoute)}
              />

              {selectedVehicle.roadblockActive &&
                selectedVehicle.primaryRoute.length >= 3 &&
                (() => {
                  const midWp =
                    selectedVehicle.primaryRoute[
                      Math.floor(selectedVehicle.primaryRoute.length / 2)
                    ];
                  const mp = project(midWp.lat, midWp.lng);
                  return (
                    <g transform={`translate(${mp.x}, ${mp.y})`}>
                      <circle r="10" fill="#7F1D1D" stroke="#EF4444" strokeWidth="2" />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#FEE2E2"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        !
                      </text>
                    </g>
                  );
                })()}

              {/* Traffic signal nodes along selected corridor */}
              {selectedVehicle.signals.map((sig, idx) => {
                const sp = project(sig.lat, sig.lng);
                const isGreen = sig.currentPhase === 'GREEN';
                const isYellow = sig.currentPhase === 'YELLOW';
                const fill = isGreen
                  ? '#10B981'
                  : isYellow
                    ? '#F59E0B'
                    : '#EF4444';
                const shortSig = sig.name
                  .replace(' Signal', '')
                  .replace(' Junction', '');
                const labelY = idx % 2 === 0 ? -10 : 14;
                return (
                  <g
                    key={sig.id}
                    transform={`translate(${sp.x}, ${sp.y})`}
                    data-testid={`map-signal-${sig.id}`}
                  >
                    {isGreen && (
                      <circle r="13" fill="#10B981" fillOpacity="0.22" />
                    )}
                    <circle
                      r="6"
                      fill={fill}
                      stroke="#0F172A"
                      strokeWidth="2"
                    />
                    <g transform={`translate(9, ${labelY})`}>
                      <rect
                        x="-2"
                        y="-9.5"
                        width={shortSig.length * 5.4 + 8}
                        height="13"
                        rx="3"
                        fill="#0B1120"
                        fillOpacity="0.9"
                        stroke={isGreen ? '#10B981' : '#334155'}
                        strokeWidth="0.7"
                      />
                      <text
                        x="2"
                        y="0"
                        fill={isGreen ? '#A7F3D0' : '#CBD5E1'}
                        fontSize="9"
                        fontWeight={isGreen ? '700' : '600'}
                      >
                        {shortSig}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Live animated emergency vehicles */}
          {vehicles.map((v) => {
            const pos = interpolateVehiclePosition(v);
            const pt = project(pos.lat, pos.lng);
            const style = vehicleBadgeColor(v.type);
            const isSelected = v.id === selectedVehicleId;
            return (
              <g
                key={v.id}
                transform={`translate(${pt.x}, ${pt.y})`}
                onClick={() => onSelectVehicle(v.id)}
                className="cursor-pointer"
                data-testid={`map-vehicle-${v.id}`}
              >
                {isSelected && (
                  <circle
                    r="18"
                    fill={style.fill}
                    fillOpacity="0.18"
                    stroke={style.stroke}
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                )}
                <circle
                  r={isSelected ? 12 : 9.5}
                  fill={style.fill}
                  stroke="#0B1120"
                  strokeWidth={isSelected ? 2 : 1.4}
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={isSelected ? '8.5' : '7.5'}
                  fontWeight="800"
                >
                  {style.glyph}
                </text>
                {isSelected && (
                  <g transform="translate(0, -19)">
                    <rect
                      x="-58"
                      y="-13"
                      width="116"
                      height="16"
                      rx="4"
                      fill="#0B1120"
                      fillOpacity="0.92"
                      stroke={style.stroke}
                      strokeWidth="0.8"
                    />
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="8.5"
                      fontWeight="700"
                    >
                      {v.callSign.split('(')[0].trim()} · {v.progressPct.toFixed(0)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
