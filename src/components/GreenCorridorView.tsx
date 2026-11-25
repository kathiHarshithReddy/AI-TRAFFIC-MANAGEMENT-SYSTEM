import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  Clock,
  Flame,
  Navigation,
  Pause,
  Play,
  PlusCircle,
  RotateCcw,
  Shield,
  Siren,
  TrafficCone,
  Zap,
} from 'lucide-react';
import { BENGALURU_LOCALITIES } from '../data/bengaluruLocalities';
import { useLanguage } from '../i18n/LanguageContext';
import {
  EmergencyVehicleType,
  GreenCorridorVehicle,
  WeatherCondition,
} from '../types/traffic';
import {
  advanceEmergencyVehicle,
  buildEmergencyRoutePlan,
  createInitialEmergencyFleet,
  EMERGENCY_DESTINATION_HUBS,
  generateGiveWayAlerts,
  synchronizeCorridorSignals,
} from '../utils/greenCorridorEngine';
import { GreenCorridorMap } from './GreenCorridorMap';

interface GreenCorridorViewProps {
  weatherCondition: WeatherCondition;
  onEmergencyDispatch?: () => void;
  fleet?: GreenCorridorVehicle[];
  selectedVehicleId?: string;
  onSelectVehicleId?: (id: string) => void;
  isSimRunning?: boolean;
  onToggleSimRunning?: () => void;
  simSpeed?: 1 | 2 | 3;
  onChangeSimSpeed?: (spd: 1 | 2 | 3) => void;
  onToggleRoadblock?: (vehicleId: string) => void;
  onResetFleet?: () => void;
  onDispatchVehicle?: (vehicle: GreenCorridorVehicle) => void;
}

export function GreenCorridorView({
  weatherCondition,
  onEmergencyDispatch,
  fleet: externalFleet,
  selectedVehicleId: externalSelectedId,
  onSelectVehicleId: externalOnSelectId,
  isSimRunning: externalIsSimRunning,
  onToggleSimRunning: externalOnToggleSim,
  simSpeed: externalSimSpeed,
  onChangeSimSpeed: externalOnChangeSpeed,
  onToggleRoadblock: externalOnToggleRoadblock,
  onResetFleet: externalOnResetFleet,
  onDispatchVehicle: externalOnDispatchVehicle,
}: GreenCorridorViewProps) {
  const { t } = useLanguage();

  const [localFleet, setLocalFleet] = useState<GreenCorridorVehicle[]>(() =>
    createInitialEmergencyFleet(BENGALURU_LOCALITIES, weatherCondition)
  );
  const [localSelectedId, setLocalSelectedId] = useState<string>(
    () => localFleet[0]?.id || 'ev-amb-108'
  );
  const [localIsSimRunning, setLocalIsSimRunning] = useState<boolean>(true);
  const [localSimSpeed, setLocalSimSpeed] = useState<1 | 2 | 3>(1);

  const fleet = externalFleet ?? localFleet;
  const selectedVehicleId = externalSelectedId ?? localSelectedId;
  const setSelectedVehicleId = externalOnSelectId ?? setLocalSelectedId;
  const isSimRunning = externalIsSimRunning ?? localIsSimRunning;
  const setIsSimRunning = externalOnToggleSim
    ? () => externalOnToggleSim()
    : () => setLocalIsSimRunning((prev) => !prev);
  const simSpeed = externalSimSpeed ?? localSimSpeed;
  const setSimSpeed = externalOnChangeSpeed ?? setLocalSimSpeed;

  const [newType, setNewType] = useState<EmergencyVehicleType>('ambulance');
  const [newCallSign, setNewCallSign] = useState<string>('KA-01-G-409 (Trauma ICU)');
  const [newOriginId, setNewOriginId] = useState<string>(
    () =>
      BENGALURU_LOCALITIES.find((l) => l.name.toLowerCase().includes('whitefield'))
        ?.id || BENGALURU_LOCALITIES[0].id
  );
  const [newHubId, setNewHubId] = useState<string>(
    EMERGENCY_DESTINATION_HUBS[0].id
  );

  useEffect(() => {
    if (externalFleet) return;
    if (!isSimRunning) return;
    const timer = window.setInterval(() => {
      setLocalFleet((prev) =>
        prev.map((vehicle) => advanceEmergencyVehicle(vehicle, 1.8 * simSpeed))
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [externalFleet, isSimRunning, simSpeed]);

  const selectedVehicle = useMemo(
    () => fleet.find((v) => v.id === selectedVehicleId) || fleet[0],
    [fleet, selectedVehicleId]
  );

  const giveWayAlerts = useMemo(() => generateGiveWayAlerts(fleet), [fleet]);

  const handleToggleRoadblock = (vehicleId: string) => {
    if (externalOnToggleRoadblock) {
      externalOnToggleRoadblock(vehicleId);
      return;
    }
    setLocalFleet((prev) =>
      prev.map((v) => {
        if (v.id !== vehicleId) return v;
        const nextBlocked = !v.roadblockActive;
        const updated = synchronizeCorridorSignals({
          ...v,
          roadblockActive: nextBlocked,
          speedKmh: nextBlocked ? 44 : 52,
          congestionScorePct: nextBlocked ? 89 : 76,
          optimizedEtaMin: nextBlocked
            ? Math.max(5, Math.round(v.optimizedEtaMin * 1.15))
            : Math.max(4, Math.round(v.optimizedEtaMin * 0.87)),
        });
        return {
          ...updated,
          timeSavedMin: Math.max(3, updated.baselineEtaMin - updated.optimizedEtaMin),
        };
      })
    );
  };

  const handleResetFleet = () => {
    if (externalOnResetFleet) {
      externalOnResetFleet();
      return;
    }
    const fresh = createInitialEmergencyFleet(
      BENGALURU_LOCALITIES,
      weatherCondition
    );
    setLocalFleet(fresh);
    setLocalSelectedId(fresh[0].id);
  };

  const handleDispatchNew = (e: React.FormEvent) => {
    e.preventDefault();
    const originLoc =
      BENGALURU_LOCALITIES.find((l) => l.id === newOriginId) ||
      BENGALURU_LOCALITIES[0];
    const destHub =
      EMERGENCY_DESTINATION_HUBS.find((h) => h.id === newHubId) ||
      EMERGENCY_DESTINATION_HUBS[0];

    const id = `ev-custom-${Date.now()}`;
    const trimmedSign =
      newCallSign.trim() ||
      (newType === 'ambulance'
        ? 'KA-01-G-999 (ICU)'
        : newType === 'fire_engine'
          ? 'KA-01-F-999 (Tender)'
          : 'KA-01-P-999 (Hoysala)');

    const created = buildEmergencyRoutePlan(
      id,
      trimmedSign,
      newType,
      'Code 1 Critical',
      originLoc.name,
      originLoc.lat,
      originLoc.lng,
      destHub,
      12,
      false,
      weatherCondition
    );

    if (externalOnDispatchVehicle) {
      externalOnDispatchVehicle(created);
    } else {
      setLocalFleet((prev) => [created, ...prev]);
      setLocalSelectedId(created.id);
    }
    onEmergencyDispatch?.();
  };

  const renderVehicleIcon = (type: EmergencyVehicleType) => {
    if (type === 'ambulance') {
      return <Ambulance className="h-4 w-4 text-rose-400" aria-hidden="true" />;
    }
    if (type === 'fire_engine') {
      return <Flame className="h-4 w-4 text-orange-400" aria-hidden="true" />;
    }
    return <Shield className="h-4 w-4 text-sky-400" aria-hidden="true" />;
  };

  const preClearedCount = selectedVehicle
    ? selectedVehicle.signals.filter((s) => s.preClearedForEmergency).length
    : 0;

  return (
    <section
      aria-label={t.corridor.title}
      data-testid="green-corridor-view"
      className="space-y-6 pb-8"
    >
      {/* Header + Simulation Guardrail + Playback Controls */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Siren className="h-4 w-4" aria-hidden="true" />
              <span>{t.corridor.kicker}</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              {t.corridor.title}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              {t.corridor.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="corridor-play-pause-btn"
              onClick={setIsSimRunning}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                isSimRunning
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                  : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
              }`}
            >
              {isSimRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.corridor.pauseSim}
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.corridor.playSim}
                </>
              )}
            </button>

            <div className="inline-flex items-center rounded-lg border border-slate-700/80 bg-[#0B1120] p-0.5 text-xs">
              <span className="px-2 text-slate-400">{t.corridor.speedLabel}:</span>
              {([1, 2, 3] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSimSpeed(spd)}
                  className={`rounded-md px-2 py-1 font-mono font-semibold transition-colors ${
                    simSpeed === spd
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleResetFleet}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#0B1120] px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t.corridor.resetSim}
            </button>
          </div>
        </div>

        {/* Explicit Simulation Guardrail Disclaimer */}
        <div
          data-testid="corridor-simulation-disclaimer"
          className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200"
        >
          <span className="inline-flex items-center gap-1.5 font-bold text-amber-300 shrink-0">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            {t.corridor.simBadge}
          </span>
          <span>{t.corridor.simDisclaimer}</span>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 Cols: Interactive Live Map + Automatic Signal Coordination */}
        <div className="lg:col-span-7 space-y-6">
          <GreenCorridorMap
            vehicles={fleet}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
          />

          {selectedVehicle && (
            <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    {t.corridor.signalCoordTitle}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedVehicle.callSign} · {preClearedCount}/
                    {selectedVehicle.signals.length} {t.corridor.preClearedLabel}
                  </p>
                </div>

                <button
                  type="button"
                  data-testid="corridor-roadblock-btn"
                  onClick={() => handleToggleRoadblock(selectedVehicle.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    selectedVehicle.roadblockActive
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                      : 'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                  }`}
                >
                  <TrafficCone className="h-3.5 w-3.5" aria-hidden="true" />
                  {selectedVehicle.roadblockActive
                    ? t.corridor.roadblockActiveBtn
                    : t.corridor.simulateRoadblockBtn}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {selectedVehicle.signals.map((sig) => {
                  const isGreen = sig.currentPhase === 'GREEN';
                  const isYellow = sig.currentPhase === 'YELLOW';
                  return (
                    <div
                      key={sig.id}
                      data-testid={`corridor-signal-card-${sig.id}`}
                      className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 ${
                        isGreen
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-slate-800 bg-[#0B1120]/70'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-xs font-semibold text-slate-100">
                          {sig.name}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {sig.distanceFromVehicleKm} km · -{sig.waitSavedSec}s
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 border ${
                          isGreen
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isYellow
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isGreen
                              ? 'bg-emerald-400'
                              : isYellow
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                          }`}
                        />
                        {t.signals.phases[sig.currentPhase]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          {selectedVehicle && (
            <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <Zap className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  {t.corridor.aiOptTitle}
                </h2>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {selectedVehicle.priorityLevel}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-3">
                  <div className="text-[11px] text-slate-400">
                    {t.corridor.baselineEtaLabel}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-400 line-through decoration-rose-500/80">
                    {selectedVehicle.baselineEtaMin} {t.corridor.minUnit}
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
                  <div className="text-[11px] font-medium text-emerald-300">
                    {t.corridor.optimizedEtaLabel}
                  </div>
                  <div
                    data-testid="corridor-optimized-eta"
                    className="mt-1 font-mono text-lg font-bold text-emerald-400"
                  >
                    {selectedVehicle.optimizedEtaMin} {t.corridor.minUnit}
                  </div>
                </div>
                <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-3">
                  <div className="text-[11px] font-medium text-sky-300">
                    {t.corridor.timeSavedLabel}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-sky-400">
                    {selectedVehicle.timeSavedMin} {t.corridor.minUnit}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>{t.corridor.congestionScoreLabel}</span>
                  <span className="font-mono font-semibold text-amber-300">
                    {selectedVehicle.congestionScorePct}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>{t.corridor.progressLabel}</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {selectedVehicle.progressPct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/60">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${selectedVehicle.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Emergency Dashboard */}
          <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                {t.corridor.activeFleetTitle} ({fleet.length})
              </h2>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {fleet.map((v) => {
                const isSelected = v.id === selectedVehicleId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    data-testid={`fleet-card-${v.id}`}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-slate-800 bg-[#0B1120]/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {renderVehicleIcon(v.type)}
                        <span className="truncate text-xs font-semibold text-slate-100">
                          {v.callSign}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                          v.roadblockActive
                            ? 'bg-amber-500/20 text-amber-300'
                            : v.status === 'arriving'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {t.corridor.statuses[v.status]}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span className="truncate">
                        {v.originName} → {v.destination.name}
                      </span>
                      <span className="font-mono font-semibold text-slate-200 shrink-0">
                        {t.corridor.etaUnit} {v.optimizedEtaMin}
                        {t.corridor.minUnit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Give-Way Feed */}
          <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Navigation className="h-4 w-4 text-amber-400" aria-hidden="true" />
              {t.corridor.giveWayTitle}
            </h2>

            <div className="space-y-2">
              {giveWayAlerts.map((alert) => (
                <div
                  key={alert.id}
                  data-testid={`giveway-alert-${alert.id}`}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-amber-200">
                      {alert.junctionName}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-300">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {alert.distanceAheadKm} {t.corridor.kmAwayUnit} · {alert.etaSec}
                      {t.corridor.secUnit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{alert.instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Dispatch Form */}
          <form
            onSubmit={handleDispatchNew}
            className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-5 space-y-3"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <PlusCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              {t.corridor.dispatchFormTitle}
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs">
                <span className="text-slate-400 font-medium">{t.corridor.vehicleTypeLabel}</span>
                <select
                  value={newType}
                  onChange={(e) => {
                    const next = e.target.value as EmergencyVehicleType;
                    setNewType(next);
                    setNewCallSign(
                      next === 'ambulance'
                        ? 'KA-01-G-409 (Trauma ICU)'
                        : next === 'fire_engine'
                          ? 'KA-01-F-205 (Fire Tender)'
                          : 'KA-01-P-704 (Hoysala Patrol)'
                    );
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-2.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ambulance">{t.corridor.vehicles.ambulance}</option>
                  <option value="fire_engine">{t.corridor.vehicles.fire_engine}</option>
                  <option value="police">{t.corridor.vehicles.police}</option>
                </select>
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-slate-400 font-medium">{t.corridor.callSignLabel}</span>
                <input
                  type="text"
                  value={newCallSign}
                  onChange={(e) => setNewCallSign(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-2.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-slate-400 font-medium">{t.corridor.originLabel}</span>
                <select
                  value={newOriginId}
                  onChange={(e) => setNewOriginId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-2.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  {BENGALURU_LOCALITIES.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs">
                <span className="text-slate-400 font-medium">{t.corridor.destHubLabel}</span>
                <select
                  value={newHubId}
                  onChange={(e) => setNewHubId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-2.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  {EMERGENCY_DESTINATION_HUBS.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              data-testid="corridor-dispatch-submit-btn"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {t.corridor.dispatchBtn}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
