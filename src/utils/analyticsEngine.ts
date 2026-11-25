import {
  ModeEmissionDatum,
  SignalMode,
  TrafficScenario,
  WeatherCondition,
  ZoneDelayDatum,
} from '../types/traffic';
import { SCENARIO_CONFIG } from './signalEngine';
import { WEATHER_IMPACT_CONFIG } from './weatherEngine';

export interface SustainabilityKpis {
  totalCo2PreventedKg: number;
  signalWaitReducedPct: number;
  fuelSavedLiters: number;
  commutersShifted: number;
}

export function computeSustainabilityKpis(
  scenario: TrafficScenario,
  signalMode: SignalMode,
  weatherCondition: WeatherCondition = 'clear'
): SustainabilityKpis {
  const cfg = SCENARIO_CONFIG[scenario];
  const weather = WEATHER_IMPACT_CONFIG[weatherCondition];
  const adaptiveMultiplier = signalMode === 'adaptive' ? 1.0 : 0.42;
  const weatherBoost = weatherCondition === 'heavy_rain' ? 1.18 : weatherCondition === 'clear' ? 1.0 : 1.08;

  const baseCo2 = 48620;
  const totalCo2PreventedKg = Math.round(
    baseCo2 * cfg.densityMultiplier * adaptiveMultiplier * weatherBoost
  );

  const signalWaitReducedPct =
    signalMode === 'adaptive'
      ? Math.min(
          54,
          (scenario === 'emergency_green_wave'
            ? 44
            : scenario === 'evening_gridlock'
              ? 36
              : scenario === 'morning_rush'
                ? 39
                : 31) + Math.round(weather.densityDeltaPct * 0.35)
        )
      : 0;

  // ~2.31 kg CO2 per liter of petrol saved
  const fuelSavedLiters = Math.round(totalCo2PreventedKg / 2.31);

  const commutersShifted = Math.round(
    19400 * cfg.densityMultiplier * (signalMode === 'adaptive' ? 1.15 : 0.78) * weatherBoost
  );

  return {
    totalCo2PreventedKg,
    signalWaitReducedPct,
    fuelSavedLiters,
    commutersShifted,
  };
}

export function computeZoneDelayComparison(
  scenario: TrafficScenario,
  weatherCondition: WeatherCondition = 'clear'
): ZoneDelayDatum[] {
  const m = SCENARIO_CONFIG[scenario].densityMultiplier;
  const weather = WEATHER_IMPACT_CONFIG[weatherCondition];

  const rawZones = [
    { zone: 'IT Hubs', shortZone: 'IT Hubs', baseStatic: 44, baseAdaptive: 22 },
    { zone: 'South Bengaluru', shortZone: 'South BLR', baseStatic: 36, baseAdaptive: 19 },
    { zone: 'East Bengaluru', shortZone: 'East BLR', baseStatic: 35, baseAdaptive: 18 },
    { zone: 'Central Bengaluru', shortZone: 'Central BLR', baseStatic: 34, baseAdaptive: 18 },
    { zone: 'North Bengaluru', shortZone: 'North BLR', baseStatic: 31, baseAdaptive: 17 },
    { zone: 'West Bengaluru', shortZone: 'West BLR', baseStatic: 27, baseAdaptive: 15 },
    { zone: 'Outskirts', shortZone: 'Outskirts', baseStatic: 24, baseAdaptive: 14 },
  ];

  return rawZones.map((item) => {
    const staticDelayMin = Math.round(item.baseStatic * m * weather.queueMultiplier);
    const adaptiveDelayMin = Math.round(
      item.baseAdaptive * (0.85 + (m - 0.5) * 0.35) * (1 + (weather.queueMultiplier - 1) * 0.55)
    );
    const reductionPct = Math.round(
      ((staticDelayMin - adaptiveDelayMin) / Math.max(1, staticDelayMin)) * 100
    );

    return {
      zone: item.zone,
      shortZone: item.shortZone,
      staticDelayMin,
      adaptiveDelayMin,
      reductionPct,
    };
  });
}

export function computeModeEmissionComparison(
  tripDistanceKm: number
): ModeEmissionDatum[] {
  const d = Math.max(2, tripDistanceKm);

  const modes: Array<{
    mode: string;
    shortMode: string;
    co2PerKmGrams: number;
    fareFn: (km: number) => number;
    category: 'private' | 'shared' | 'public' | 'zero';
  }> = [
    {
      mode: 'Solo Petrol Car',
      shortMode: 'Petrol Car',
      co2PerKmGrams: 192,
      fareFn: (km) => Math.round(km * 13.5 + 30),
      category: 'private',
    },
    {
      mode: 'Electric Car (Grid EV)',
      shortMode: 'EV Car',
      co2PerKmGrams: 72,
      fareFn: (km) => Math.round(km * 4.5 + 25),
      category: 'private',
    },
    {
      mode: 'Petrol Two-Wheeler',
      shortMode: '2-Wheeler',
      co2PerKmGrams: 84,
      fareFn: (km) => Math.round(km * 3.8),
      category: 'private',
    },
    {
      mode: 'Metered Auto / Cab Share',
      shortMode: 'Auto-Rickshaw',
      co2PerKmGrams: 68,
      fareFn: (km) => Math.round(30 + km * 15),
      category: 'shared',
    },
    {
      mode: 'BMTC Vajra / Trunk Bus',
      shortMode: 'BMTC Bus',
      co2PerKmGrams: 36,
      fareFn: (km) => Math.min(85, Math.round(12 + km * 2.2)),
      category: 'public',
    },
    {
      mode: 'Shared E-Auto + Metro',
      shortMode: 'Eco-Hybrid',
      co2PerKmGrams: 18,
      fareFn: (km) => Math.min(75, Math.round(20 + km * 2.1)),
      category: 'public',
    },
    {
      mode: 'Namma Metro (Direct)',
      shortMode: 'Namma Metro',
      co2PerKmGrams: 14,
      fareFn: (km) => Math.min(60, Math.max(10, Math.round(10 + km * 2.0))),
      category: 'public',
    },
    {
      mode: 'Suburban MEMU Rail',
      shortMode: 'MEMU Rail',
      co2PerKmGrams: 11,
      fareFn: (km) => (km <= 15 ? 10 : km <= 28 ? 15 : 25),
      category: 'public',
    },
    {
      mode: 'Yulu Miracle EV / Walk',
      shortMode: 'Yulu EV',
      co2PerKmGrams: 3,
      fareFn: (km) => Math.round(10 + km * 5),
      category: 'zero',
    },
  ];

  return modes.map((m) => ({
    mode: m.mode,
    shortMode: m.shortMode,
    co2PerKmGrams: m.co2PerKmGrams,
    tripCo2Kg: Number(((m.co2PerKmGrams * d) / 1000).toFixed(2)),
    fareEstimateInr: m.fareFn(d),
    category: m.category,
  }));
}
