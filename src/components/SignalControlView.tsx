import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Gauge,
  Pause,
  Play,
  Route,
  ShieldAlert,
} from 'lucide-react';
import { BENGALURU_CORRIDORS } from '../data/corridors';
import {
  localizeJunction,
  localizeReasoningEntry,
  localizeTrafficAlert,
} from '../i18n/domainLocalizers';
import { SIDE_STREET_UI } from '../i18n/sideStreetTranslations';
import { useLanguage } from '../i18n/LanguageContext';
import {
  BottleneckId,
  Corridor,
  SignalMode,
  TrafficAlertIncident,
  TrafficScenario,
  WeatherCondition,
} from '../types/traffic';
import {
  computeCorridorSnapshot,
  getSignalIndicatorPulseState,
  isGreenCorridorActive,
} from '../utils/signalEngine';
import { mapCorridorToBottleneckId } from '../utils/sideStreetEngine';
import {
  getCorridorTrafficAlerts,
  selectActiveTrafficAlert,
} from '../utils/trafficAlertsEngine';
import { CorridorFlowD3Chart } from './CorridorFlowD3Chart';
import { TrafficAlertBanner } from './TrafficAlertBanner';

interface SignalControlViewProps {
  corridorId: string;
  onSelectCorridor: (id: string) => void;
  signalMode: SignalMode;
  onChangeSignalMode: (mode: SignalMode) => void;
  scenario: TrafficScenario;
  onChangeScenario: (scenario: TrafficScenario) => void;
  weatherCondition: WeatherCondition;
  tickSeconds: number;
  isSimRunning: boolean;
  onToggleSimRunning: () => void;
  alertOffsetByCorridor?: Record<string, number>;
  onStepAlertOffset?: (corridorId: string, delta: number) => void;
  onSpeakIncidentAlert?: (
    incident: TrafficAlertIncident,
    corridor: Corridor
  ) => void;
  onOpenSideStreetScanner?: (bottleneckId: BottleneckId) => void;
}

const SCENARIO_ORDER: TrafficScenario[] = [
  'off_peak',
  'morning_rush',
  'evening_gridlock',
  'emergency_green_wave',
];

export function SignalControlView({
  corridorId,
  onSelectCorridor,
  signalMode,
  onChangeSignalMode,
  scenario,
  onChangeScenario,
  weatherCondition,
  tickSeconds,
  isSimRunning,
  onToggleSimRunning,
  alertOffsetByCorridor: externalAlertOffsetByCorridor,
  onStepAlertOffset,
  onSpeakIncidentAlert,
  onOpenSideStreetScanner,
}: SignalControlViewProps) {
  const { language, t } = useLanguage();
  const sideStreetUi = SIDE_STREET_UI[language];
  const [localAlertOffsetByCorridor, setLocalAlertOffsetByCorridor] = useState<
    Record<string, number>
  >({});
  const [dismissedByCorridor, setDismissedByCorridor] = useState<
    Record<string, boolean>
  >({});
  const alertOffsetByCorridor =
    externalAlertOffsetByCorridor ?? localAlertOffsetByCorridor;

  const activeCorridor = useMemo(
    () =>
      BENGALURU_CORRIDORS.find((c) => c.id === corridorId) ||
      BENGALURU_CORRIDORS[0],
    [corridorId]
  );

  const snapshot = useMemo(
    () =>
      computeCorridorSnapshot(
        activeCorridor,
        signalMode,
        scenario,
        tickSeconds,
        weatherCondition
      ),
    [activeCorridor, signalMode, scenario, tickSeconds, weatherCondition]
  );

  const localizedIntersections = useMemo(
    () =>
      snapshot.intersections.map((jx) =>
        localizeJunction(jx, signalMode, scenario, weatherCondition, language)
      ),
    [snapshot.intersections, signalMode, scenario, weatherCondition, language]
  );

  const localizedReasoningLog = useMemo(
    () =>
      snapshot.reasoningLog.map((entry, idx) =>
        localizeReasoningEntry(
          entry,
          snapshot.intersections[idx],
          signalMode,
          scenario,
          weatherCondition,
          language
        )
      ),
    [
      snapshot.reasoningLog,
      snapshot.intersections,
      signalMode,
      scenario,
      weatherCondition,
      language,
    ]
  );

  const corridorAlerts = useMemo(
    () =>
      getCorridorTrafficAlerts(
        activeCorridor,
        scenario,
        weatherCondition,
        tickSeconds,
        signalMode
      ),
    [activeCorridor, scenario, weatherCondition, tickSeconds, signalMode]
  );

  const activeAlertState = useMemo(
    () =>
      selectActiveTrafficAlert(
        corridorAlerts,
        tickSeconds,
        alertOffsetByCorridor[activeCorridor.id] ?? 0
      ),
    [corridorAlerts, tickSeconds, alertOffsetByCorridor, activeCorridor.id]
  );

  const localizedActiveAlert = useMemo(
    () =>
      localizeTrafficAlert(
        activeAlertState.activeAlert,
        activeCorridor,
        signalMode,
        language
      ),
    [activeAlertState.activeAlert, activeCorridor, signalMode, language]
  );

  const activeCorridorCopy = t.signals.corridors[activeCorridor.id] ?? {
    shortName: activeCorridor.shortName,
    name: activeCorridor.name,
    zoneFocus: activeCorridor.zoneFocus,
  };
  const scenarioCopy = t.signals.scenarios[scenario];
  const greenCorridorActive = isGreenCorridorActive(scenario);

  return (
    <section
      aria-label={t.signals.title}
      data-green-corridor-active={greenCorridorActive ? 'true' : 'false'}
      className="space-y-6"
    >
      {/* Page Intro & Primary Mode Switch */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-400">
            {t.signals.networkKicker} · {activeCorridor.lengthKm}{' '}
            {t.signals.corridorUnit}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            {t.signals.title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
            {t.signals.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label={t.signals.title}
            className="inline-flex rounded-xl border border-slate-800 bg-[#0F172A] p-1"
          >
            <button
              type="button"
              onClick={() => onChangeSignalMode('static')}
              aria-pressed={signalMode === 'static'}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                signalMode === 'static'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-100 border border-transparent'
              }`}
            >
              {t.signals.staticMode}
            </button>
            <button
              type="button"
              onClick={() => onChangeSignalMode('adaptive')}
              aria-pressed={signalMode === 'adaptive'}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                signalMode === 'adaptive'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-100 border border-transparent'
              }`}
            >
              {t.signals.adaptiveMode}
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleSimRunning}
            aria-label={
              isSimRunning ? t.signals.pauseClock : t.signals.resumeClock
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0F172A] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-700 hover:text-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {isSimRunning ? (
              <>
                <Pause className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>{t.signals.pauseClock}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <span>{t.signals.resumeClock}</span>
              </>
            )}
          </button>

          {onOpenSideStreetScanner && (
            <button
              type="button"
              data-testid="signals-scan-side-street-btn"
              onClick={() =>
                onOpenSideStreetScanner(mapCorridorToBottleneckId(corridorId))
              }
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/15 to-cyan-500/15 px-3.5 py-2 text-xs font-bold text-amber-200 hover:border-cyan-400/70 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Route className="h-3.5 w-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
              <span>{sideStreetUi.triggerButton}</span>
            </button>
          )}
        </div>
      </div>

      {/* Corridor Selector & Scenario Controls */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-2 text-xs font-medium text-slate-400">
              {t.signals.selectCorridor}
            </div>
            <div
              role="tablist"
              aria-label={t.signals.selectCorridor}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
            >
              {BENGALURU_CORRIDORS.map((corridor) => {
                const isSelected = corridor.id === activeCorridor.id;
                const copy = t.signals.corridors[corridor.id] ?? {
                  shortName: corridor.shortName,
                  zoneFocus: corridor.zoneFocus,
                };
                return (
                  <button
                    key={corridor.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => onSelectCorridor(corridor.id)}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-slate-50'
                        : 'border-slate-800 bg-[#0B1120]/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate text-xs font-semibold">
                      {copy.shortName}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-slate-400">
                      {copy.zoneFocus} · {corridor.intersections.length}{' '}
                      {t.signals.junctionsWord}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">
              {t.signals.demandScenario}
            </div>
            <p className="mt-0.5 text-xs text-slate-300">
              {scenarioCopy.description}
            </p>
          </div>
          <div
            role="group"
            aria-label={t.signals.demandScenario}
            className="flex flex-wrap items-center gap-2"
          >
            {SCENARIO_ORDER.map((sc) => {
              const active = scenario === sc;
              const isEmergency = sc === 'emergency_green_wave';
              return (
                <button
                  key={sc}
                  type="button"
                  onClick={() => onChangeScenario(sc)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? isEmergency
                        ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                        : 'border-sky-500/50 bg-sky-500/15 text-sky-300'
                      : 'border-slate-800 bg-[#0B1120] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {isEmergency && (
                    <ShieldAlert
                      className="h-3.5 w-3.5 text-rose-400"
                      aria-hidden="true"
                    />
                  )}
                  <span>{t.signals.scenarios[sc].label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Corridor Traffic Alert Banner */}
      <TrafficAlertBanner
        corridorName={activeCorridorCopy.shortName}
        activeAlert={localizedActiveAlert}
        activeIndex={activeAlertState.activeIndex}
        totalCount={activeAlertState.totalCount}
        signalMode={signalMode}
        scenario={scenario}
        weatherCondition={weatherCondition}
        isDismissed={Boolean(dismissedByCorridor[activeCorridor.id])}
        onPrevAlert={() => {
          if (onStepAlertOffset) {
            onStepAlertOffset(activeCorridor.id, -1);
          } else {
            setLocalAlertOffsetByCorridor((prev) => ({
              ...prev,
              [activeCorridor.id]: (prev[activeCorridor.id] ?? 0) - 1,
            }));
          }
        }}
        onNextAlert={() => {
          if (onStepAlertOffset) {
            onStepAlertOffset(activeCorridor.id, 1);
          } else {
            setLocalAlertOffsetByCorridor((prev) => ({
              ...prev,
              [activeCorridor.id]: (prev[activeCorridor.id] ?? 0) + 1,
            }));
          }
        }}
        onDismiss={() =>
          setDismissedByCorridor((prev) => ({
            ...prev,
            [activeCorridor.id]: true,
          }))
        }
        onRestore={() =>
          setDismissedByCorridor((prev) => ({
            ...prev,
            [activeCorridor.id]: false,
          }))
        }
        onSpeakAlert={
          onSpeakIncidentAlert
            ? () =>
                onSpeakIncidentAlert(
                  activeAlertState.activeAlert,
                  activeCorridor
                )
            : undefined
        }
      />

      {/* Corridor Summary Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.signals.corridorAvgSpeed}</span>
            <Gauge className="h-4 w-4 text-sky-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-50 tabular-nums">
            {snapshot.corridorSpeedKmh}{' '}
            <span className="text-sm font-normal text-slate-400">km/h</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {signalMode === 'adaptive'
              ? t.signals.aiGreenWaveActive
              : t.signals.unoptimizedFixed}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.signals.waitTimeReduced}</span>
            <Clock className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          </div>
          <div
            className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
              snapshot.avgWaitReductionPct > 0
                ? 'text-emerald-400'
                : 'text-amber-300'
            }`}
          >
            {snapshot.avgWaitReductionPct > 0
              ? `-${snapshot.avgWaitReductionPct}%`
              : '0%'}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {signalMode === 'adaptive'
              ? t.signals.comparedToStatic
              : t.signals.baselineFixedTiming}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.signals.combinedQueueLength}</span>
            <Activity className="h-4 w-4 text-purple-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-50 tabular-nums">
            {snapshot.totalQueueMeters.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">m</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {snapshot.intersections.length} {t.signals.acrossJunctions}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.signals.roadGripYellow}</span>
            <Cpu className="h-4 w-4 text-sky-400" aria-hidden="true" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-50 tabular-nums">
            {snapshot.avgRoadFrictionCoeff.toFixed(2)}{' '}
            <span className="text-sm font-normal text-slate-400">
              · {4 + snapshot.yellowSafetyBufferSec}s {t.signals.yellowShort}
            </span>
          </div>
          <div className="mt-1 truncate text-xs text-slate-400">
            {snapshot.yellowSafetyBufferSec > 0
              ? `+${snapshot.yellowSafetyBufferSec}s ${t.signals.wetBrakingBuffer} · ${activeCorridorCopy.shortName}`
              : `${t.signals.nominalDryGrip} · ${activeCorridorCopy.shortName}`}
          </div>
        </div>
      </div>

      {/* D3.js Animated Vehicle Density & Wait-Time Flow Visualization */}
      <CorridorFlowD3Chart
        corridorId={activeCorridor.id}
        corridorName={activeCorridorCopy.name}
        intersections={snapshot.intersections}
        corridorSpeedKmh={snapshot.corridorSpeedKmh}
        signalMode={signalMode}
        scenario={scenario}
        isSimRunning={isSimRunning}
      />

      {/* Main Split: Live Junction Cards + AI Reasoning Log */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-base font-semibold text-slate-100">
                {t.signals.liveTelemetryTitle} ({localizedIntersections.length})
              </h2>
              {greenCorridorActive && (
                <span
                  data-testid="green-corridor-signal-beacon"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300"
                >
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    {isSimRunning && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span>{t.signals.scenarios.emergency_green_wave.label}</span>
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {signalMode === 'adaptive'
                ? t.signals.aiAdaptiveCycle
                : t.signals.fixedCycle}{' '}
              · {t.signals.friction} {snapshot.avgRoadFrictionCoeff.toFixed(2)}{' '}
              · {t.signals.yellow} {4 + snapshot.yellowSafetyBufferSec}s
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {localizedIntersections.map((jx) => {
              const pulseState = getSignalIndicatorPulseState(
                jx.currentPhase,
                scenario,
                isSimRunning
              );

              const phaseBadge =
                jx.currentPhase === 'GREEN'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : jx.currentPhase === 'YELLOW'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/40';

              const dotColor =
                jx.currentPhase === 'GREEN'
                  ? 'bg-emerald-400'
                  : jx.currentPhase === 'YELLOW'
                    ? 'bg-amber-400'
                    : 'bg-rose-400';

              const pulseClass =
                pulseState.pulseVariant === 'green_corridor'
                  ? 'signal-badge-pulse-green border-emerald-400/80'
                  : pulseState.pulseVariant === 'preempt_prep'
                    ? 'signal-badge-pulse-preempt'
                    : '';

              const densityBarColor =
                jx.densityPct >= 85
                  ? 'bg-rose-500'
                  : jx.densityPct >= 65
                    ? 'bg-amber-500'
                    : 'bg-emerald-500';

              return (
                <article
                  key={jx.id}
                  data-testid={`junction-card-${jx.id}`}
                  className={`rounded-xl border bg-[#0F172A] p-4 flex flex-col justify-between gap-3 transition-colors ${
                    pulseState.shouldPulse && jx.currentPhase === 'GREEN'
                      ? 'border-emerald-500/50'
                      : 'border-slate-800/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-100">
                        {jx.name}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {jx.landmark}
                      </p>
                    </div>

                    <div
                      data-testid={`signal-status-indicator-${jx.id}`}
                      data-phase={jx.currentPhase}
                      data-pulsing={pulseState.shouldPulse ? 'true' : 'false'}
                      className={`inline-flex items-center gap-1.5 shrink-0 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${phaseBadge} ${pulseClass}`}
                    >
                      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                        {pulseState.shouldPulse && (
                          <span
                            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-80 ${dotColor}`}
                          />
                        )}
                        <span
                          className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`}
                        />
                      </span>
                      <span>
                        {t.signals.phases[jx.currentPhase]} · {jx.countdownSec}s
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {t.signals.vehicleDensity}
                      </span>
                      <span className="font-mono font-semibold text-slate-200 tabular-nums">
                        {jx.densityPct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${densityBarColor}`}
                        style={{ width: `${jx.densityPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1.5 text-xs">
                      <div>
                        <div className="text-slate-400">{t.signals.queue}</div>
                        <div className="font-mono font-semibold text-slate-100 tabular-nums">
                          {jx.queueMeters} m
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">
                          {t.signals.greenRed}
                        </div>
                        <div className="font-mono font-semibold text-slate-100 tabular-nums">
                          {jx.assignedGreenSec}s / {jx.assignedRedSec}s
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">
                          {t.signals.avgWait}
                        </div>
                        <div className="font-mono font-semibold text-slate-100 tabular-nums">
                          {jx.avgWaitSec}s
                          {jx.waitReductionPct > 0 && (
                            <span className="ml-1 text-emerald-400">
                              (-{jx.waitReductionPct}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono tabular-nums text-slate-400">
                      <span>
                        {t.signals.friction} {jx.roadFrictionCoeff.toFixed(2)} (
                        {jx.dischargeRatePct}% {t.signals.discharge})
                      </span>
                      <span
                        className={
                          jx.yellowBufferAddedSec > 0
                            ? 'text-amber-300 font-semibold'
                            : 'text-slate-400'
                        }
                      >
                        {t.signals.yellow} {jx.yellowSec}s
                        {jx.yellowBufferAddedSec > 0
                          ? ` (+${jx.yellowBufferAddedSec}s)`
                          : ''}
                      </span>
                    </div>
                  </div>

                  <p className="border-t border-slate-800/80 pt-2.5 text-xs text-slate-300">
                    {jx.aiActionNote}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        {/* Real-time AI Reasoning Log */}
        <aside
          aria-label={t.signals.reasoningTitle}
          className="xl:col-span-4 rounded-xl border border-slate-800/90 bg-[#0F172A] p-4 sm:p-5 flex flex-col"
        >
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-100">
                {t.signals.reasoningTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.signals.reasoningSubtitle}
              </p>
            </div>
            <Cpu
              className="h-4 w-4 text-emerald-400 shrink-0"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 divide-y divide-slate-800/70">
            {localizedReasoningLog.map((entry) => {
              const Icon =
                entry.severity === 'critical'
                  ? AlertTriangle
                  : entry.severity === 'priority'
                    ? ShieldAlert
                    : entry.severity === 'warning'
                      ? Clock
                      : CheckCircle2;
              const iconColor =
                entry.severity === 'critical'
                  ? 'text-rose-400'
                  : entry.severity === 'priority'
                    ? 'text-rose-400'
                    : entry.severity === 'warning'
                      ? 'text-amber-400'
                      : 'text-emerald-400';

              return (
                <div key={entry.id} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${iconColor}`}
                        aria-hidden="true"
                      />
                      <span className="truncate text-xs font-semibold text-slate-100">
                        {entry.junctionName}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 shrink-0">
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {entry.action}
                  </p>
                  <div className="mt-1 font-mono text-[11px] font-medium text-emerald-400 tabular-nums">
                    {entry.impact}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
