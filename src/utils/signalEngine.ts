import {
  AIReasoningEntry,
  BaseIntersection,
  Corridor,
  SignalMode,
  SignalPhase,
  SimulatedIntersection,
  TrafficScenario,
  WeatherCondition,
} from '../types/traffic';
import { WEATHER_IMPACT_CONFIG } from './weatherEngine';

export const SCENARIO_CONFIG: Record<
  TrafficScenario,
  {
    label: string;
    densityMultiplier: number;
    queueMultiplier: number;
    description: string;
  }
> = {
  off_peak: {
    label: 'Off-Peak',
    densityMultiplier: 0.58,
    queueMultiplier: 0.45,
    description: 'Midday / late-evening free-flow baseline across arterial lanes.',
  },
  morning_rush: {
    label: 'Morning Rush',
    densityMultiplier: 1.0,
    queueMultiplier: 1.0,
    description: '08:30–10:45 IST inbound commuter surge toward CBD and IT parks.',
  },
  evening_gridlock: {
    label: 'Evening Gridlock',
    densityMultiplier: 1.14,
    queueMultiplier: 1.28,
    description: '17:45–20:30 IST outbound saturation at ORR, Silk Board & Hebbal.',
  },
  emergency_green_wave: {
    label: 'Emergency Green Wave',
    densityMultiplier: 0.96,
    queueMultiplier: 0.85,
    description: 'Synchronized ambulance & BMTC priority corridor clearance.',
  },
};

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

const WATERLOGGING_JUNCTION_KEYWORDS = [
  'silk board',
  'bellandur',
  'hebbal',
  'kr market',
  'panathur',
  'marathahalli',
  'kr puram',
  'nayandahalli',
  'nagavara',
];

export function isWaterloggingProneJunction(jx: BaseIntersection): boolean {
  const hay = `${jx.name} ${jx.landmark}`.toLowerCase();
  return WATERLOGGING_JUNCTION_KEYWORDS.some((kw) => hay.includes(kw));
}

export type SignalPulseVariant = 'none' | 'green_corridor' | 'preempt_prep';

export interface SignalIndicatorPulseState {
  isGreenCorridorActive: boolean;
  shouldPulse: boolean;
  pulseVariant: SignalPulseVariant;
}

export function isGreenCorridorActive(scenario: TrafficScenario): boolean {
  return scenario === 'emergency_green_wave';
}

export function getSignalIndicatorPulseState(
  phase: SignalPhase,
  scenario: TrafficScenario,
  isSimRunning: boolean
): SignalIndicatorPulseState {
  const active = isGreenCorridorActive(scenario);
  if (!active || !isSimRunning) {
    return {
      isGreenCorridorActive: active,
      shouldPulse: false,
      pulseVariant: 'none',
    };
  }

  return {
    isGreenCorridorActive: true,
    shouldPulse: true,
    pulseVariant: phase === 'GREEN' ? 'green_corridor' : 'preempt_prep',
  };
}

export function computeCorridorSnapshot(
  corridor: Corridor,
  mode: SignalMode,
  scenario: TrafficScenario,
  tickSeconds: number,
  weatherCondition: WeatherCondition = 'clear'
): {
  intersections: SimulatedIntersection[];
  reasoningLog: AIReasoningEntry[];
  corridorSpeedKmh: number;
  avgWaitReductionPct: number;
  totalQueueMeters: number;
  avgRoadFrictionCoeff: number;
  yellowSafetyBufferSec: number;
} {
  const cfg = SCENARIO_CONFIG[scenario];
  const weather = WEATHER_IMPACT_CONFIG[weatherCondition];
  const isAdaptive = mode === 'adaptive';
  const yellowBufferAddedSec = weather.yellowSafetyBufferSec;
  const yellowSec = 4 + yellowBufferAddedSec;

  const intersections: SimulatedIntersection[] = corridor.intersections.map((jx, index) => {
    const waterloggingProne = isWaterloggingProneJunction(jx);

    // Road friction & safe discharge rate reduction (25-35% lower in heavy rain)
    const junctionFrictionAdjust =
      weatherCondition === 'heavy_rain' && waterloggingProne
        ? -0.02
        : weatherCondition === 'heavy_rain'
          ? 0.02
          : 0;
    const roadFrictionCoeff = Number(
      clamp(weather.roadFrictionCoeff + junctionFrictionAdjust, 0.65, 1.0).toFixed(2)
    );
    const dischargeRatePct = Math.round(roadFrictionCoeff * 100);

    const rawDensity = Math.round(
      jx.baseDensityPct * cfg.densityMultiplier +
        weather.densityDeltaPct +
        (weatherCondition === 'heavy_rain' && waterloggingProne ? 4 : 0)
    );
    const adaptiveRelief = isAdaptive
      ? scenario === 'emergency_green_wave'
        ? 22
        : 16
      : 0;
    const densityPct = clamp(rawDensity - adaptiveRelief, 18, 99);

    const rawQueue = Math.round(
      jx.baseQueueMeters *
        cfg.queueMultiplier *
        weather.queueMultiplier *
        (weatherCondition === 'heavy_rain' && waterloggingProne ? 1.08 : 1.0)
    );
    const queueReliefFactor = isAdaptive
      ? scenario === 'emergency_green_wave'
        ? 0.52
        : 0.61
      : 1.0;
    const queueMeters = Math.max(25, Math.round(rawQueue * queueReliefFactor));

    // Phase timing calculation
    let assignedGreenSec = jx.staticGreenSec;
    let assignedRedSec = jx.staticRedSec;

    if (isAdaptive) {
      const drainageCorridorBoost =
        weatherCondition === 'heavy_rain'
          ? waterloggingProne
            ? 10
            : 6
          : weatherCondition === 'light_rain'
            ? waterloggingProne
              ? 6
              : 3
            : weatherCondition === 'morning_fog'
              ? 4
              : weatherCondition === 'extreme_heat'
                ? 2
                : 0;

      if (scenario === 'emergency_green_wave') {
        assignedGreenSec = Math.min(80, jx.staticGreenSec + 28 + drainageCorridorBoost);
        assignedRedSec = Math.max(30, jx.staticRedSec - 38);
      } else {
        const densityBoost =
          Math.round(((rawDensity - 55) / 45) * 20) + drainageCorridorBoost;
        assignedGreenSec = clamp(
          jx.staticGreenSec + Math.max(6, densityBoost),
          28,
          76
        );
        assignedRedSec = clamp(
          Math.round(jx.staticRedSec * (scenario === 'off_peak' ? 0.65 : 0.72)),
          34,
          76
        );
      }
    }

    const totalCycle = assignedGreenSec + yellowSec + assignedRedSec;
    const offset = isAdaptive
      ? scenario === 'emergency_green_wave'
        ? index * 4
        : index * 11
      : index * 29;
    const pos = (tickSeconds + offset) % totalCycle;

    let currentPhase: SignalPhase;
    let countdownSec: number;

    if (pos < assignedGreenSec) {
      currentPhase = 'GREEN';
      countdownSec = assignedGreenSec - pos;
    } else if (pos < assignedGreenSec + yellowSec) {
      currentPhase = 'YELLOW';
      countdownSec = assignedGreenSec + yellowSec - pos;
    } else {
      currentPhase = 'RED';
      countdownSec = totalCycle - pos;
    }

    const staticWait = Math.round(
      jx.staticRedSec *
        0.58 *
        (rawDensity / 78) *
        (1 + (weather.queueMultiplier - 1) * 0.65)
    );
    const adaptiveWait = Math.max(
      12,
      Math.round(assignedRedSec * 0.44 * (densityPct / 82))
    );
    const avgWaitSec = isAdaptive ? adaptiveWait : staticWait;
    const waitReductionPct = isAdaptive
      ? clamp(
          Math.round(((staticWait - adaptiveWait) / Math.max(1, staticWait)) * 100),
          14,
          68
        )
      : 0;

    let aiActionNote = 'Fixed 120s-cycle timer active; no dynamic queue feedback.';
    if (isAdaptive) {
      if (scenario === 'emergency_green_wave') {
        aiActionNote = `Green wave corridor lock (+${assignedGreenSec - jx.staticGreenSec}s phase) clearing emergency & BMTC lane.`;
      } else if (weatherCondition === 'heavy_rain') {
        const rainMm = waterloggingProne ? 22 : 16;
        aiActionNote = `Heavy Rain at ${jx.name} (${rainMm}mm/hr) -> Reduced road friction factor to ${roadFrictionCoeff.toFixed(2)}; extended Yellow safety buffer +${yellowBufferAddedSec}s & prioritized ${waterloggingProne ? 'drainage corridor' : 'arterial clearance'}.`;
      } else if (weatherCondition === 'light_rain') {
        aiActionNote = `Evening Rainstorm at ${jx.name} -> Road friction ${roadFrictionCoeff.toFixed(2)} (${dischargeRatePct}% discharge); added +${yellowBufferAddedSec}s Yellow wet-braking buffer & +${assignedGreenSec - jx.staticGreenSec}s green.`;
      } else if (weatherCondition === 'morning_fog') {
        aiActionNote = `Morning Fog at ${jx.name} -> Visibility friction factor ${roadFrictionCoeff.toFixed(2)}; extended Yellow clearance +${yellowBufferAddedSec}s & smoothed green wave.`;
      } else if (weatherCondition === 'extreme_heat') {
        aiActionNote = `Heatwave AC-load surge compensation (+${assignedGreenSec - jx.staticGreenSec}s green); trimmed red by ${jx.staticRedSec - assignedRedSec}s.`;
      } else if (rawDensity >= 85) {
        aiActionNote = `Extended main arterial green by +${assignedGreenSec - jx.staticGreenSec}s; trimmed cross-street red by ${jx.staticRedSec - assignedRedSec}s.`;
      } else if (jx.hasMetroCross) {
        aiActionNote = `Synced pedestrian & feeder burst with Metro arrival; saved ${staticWait - adaptiveWait}s avg wait.`;
      } else {
        aiActionNote = `Balanced 4-phase split based on ${queueMeters}m loop queue telemetry.`;
      }
    } else if (weatherCondition !== 'clear') {
      aiActionNote = `Static timer ignores ${weather.label.toLowerCase()} (friction ${roadFrictionCoeff.toFixed(2)}, no +${yellowBufferAddedSec}s buffer); queue expanded to ${queueMeters}m.`;
    }

    return {
      ...jx,
      densityPct,
      queueMeters,
      currentPhase,
      countdownSec,
      assignedGreenSec,
      assignedRedSec,
      yellowSec,
      yellowBufferAddedSec,
      roadFrictionCoeff,
      dischargeRatePct,
      waterloggingProne,
      avgWaitSec,
      waitReductionPct,
      aiActionNote,
    };
  });

  const baseSpeed = isAdaptive ? corridor.avgSpeedAdaptiveKmh : corridor.avgSpeedStaticKmh;
  const speedMultiplier =
    scenario === 'off_peak'
      ? 1.32
      : scenario === 'evening_gridlock'
        ? 0.84
        : scenario === 'emergency_green_wave'
          ? isAdaptive
            ? 1.24
            : 0.9
          : 1.0;
  const effectiveWeatherSpeed = isAdaptive
    ? 1 - (1 - weather.speedMultiplier) * 0.65
    : weather.speedMultiplier;
  const corridorSpeedKmh = Number(
    (baseSpeed * speedMultiplier * effectiveWeatherSpeed).toFixed(1)
  );

  const avgWaitReductionPct = isAdaptive
    ? Math.round(
        intersections.reduce((sum, item) => sum + item.waitReductionPct, 0) /
          intersections.length
      )
    : 0;

  const totalQueueMeters = intersections.reduce((sum, item) => sum + item.queueMeters, 0);
  const avgRoadFrictionCoeff = Number(
    (
      intersections.reduce((sum, item) => sum + item.roadFrictionCoeff, 0) /
      intersections.length
    ).toFixed(2)
  );

  const reasoningLog: AIReasoningEntry[] = intersections.map((jx, idx) => {
    const minutesAgo = idx * 2;
    const timestamp = minutesAgo === 0 ? 'Just now' : `${minutesAgo}m ago`;

    if (!isAdaptive) {
      return {
        id: `${jx.id}-log`,
        timestamp,
        junctionName: jx.name,
        action:
          weatherCondition !== 'clear'
            ? `Static timer holding ${jx.staticGreenSec}s Green / ${jx.staticRedSec}s Red despite ${weather.label.toLowerCase()} (grip ${jx.roadFrictionCoeff.toFixed(2)}).`
            : `Static timer holding ${jx.staticGreenSec}s Green / ${jx.staticRedSec}s Red regardless of ${jx.densityPct}% load.`,
        impact: `Queue built to ${jx.queueMeters}m (${jx.avgWaitSec}s avg wait)`,
        severity: jx.densityPct >= 85 ? 'critical' : 'warning',
      };
    }

    return {
      id: `${jx.id}-log`,
      timestamp,
      junctionName: jx.name,
      action: jx.aiActionNote,
      impact: `-${jx.waitReductionPct}% wait · Grip ${jx.roadFrictionCoeff.toFixed(2)} · Yellow ${jx.yellowSec}s`,
      severity:
        scenario === 'emergency_green_wave'
          ? 'priority'
          : weatherCondition === 'heavy_rain' && jx.waterloggingProne
            ? 'warning'
            : jx.densityPct >= 82
              ? 'warning'
              : 'nominal',
    };
  });

  return {
    intersections,
    reasoningLog,
    corridorSpeedKmh,
    avgWaitReductionPct,
    totalQueueMeters,
    avgRoadFrictionCoeff,
    yellowSafetyBufferSec: yellowBufferAddedSec,
  };
}
