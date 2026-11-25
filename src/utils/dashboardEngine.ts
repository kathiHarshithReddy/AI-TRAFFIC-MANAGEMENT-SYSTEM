import {
  GreenCorridorVehicle,
  SignalMode,
  TrafficScenario,
  WeatherCondition,
} from '../types/traffic';
import { AppLanguage } from '../i18n/types';
import { localizeBengaluruPlaceName } from '../i18n/bengaluruTransliterator';

export type IsometricPinCategory =
  | 'hospital'
  | 'police'
  | 'fire'
  | 'pharmacy'
  | 'women_help'
  | 'metro';

export interface IsometricSafeHavenPin {
  id: string;
  name: string;
  category: IsometricPinCategory;
  xPct: number;
  yPct: number;
  elevationPx: number;
  phone: string;
  open247: boolean;
}

export interface MajorJunctionStatusItem {
  id: string;
  name: string;
  corridorHint: string;
  status: 'GREEN' | 'PREPARING';
  countdownSec: number;
  speedKmh: number;
}

export interface LiveActivityEvent {
  id: string;
  timestamp: string;
  category: 'signal' | 'weather' | 'safety' | 'emergency';
  title: string;
  detail: string;
}

export interface DashboardKpiSummary {
  activeEmergencies: string;
  greenSignals: string;
  activeCorridors: string;
  timeSavedMin: string;
}

export const ISOMETRIC_SAFE_HAVEN_PINS: IsometricSafeHavenPin[] = [
  {
    id: 'pin-hosp-manipal',
    name: 'Manipal Hospital HAL Old Airport',
    category: 'hospital',
    xPct: 85,
    yPct: 24,
    elevationPx: 26,
    phone: '080-25024444',
    open247: true,
  },
  {
    id: 'pin-police-indiranagar',
    name: 'Indiranagar Police Station & Pink Beat',
    category: 'police',
    xPct: 55,
    yPct: 30,
    elevationPx: 22,
    phone: '080-22942544',
    open247: true,
  },
  {
    id: 'pin-fire-mg',
    name: 'Mayo Hall Fire & Rescue Station',
    category: 'fire',
    xPct: 38,
    yPct: 24,
    elevationPx: 24,
    phone: '101',
    open247: true,
  },
  {
    id: 'pin-pharm-koramangala',
    name: 'Apollo 24/7 Pharmacy Koramangala',
    category: 'pharmacy',
    xPct: 51,
    yPct: 78,
    elevationPx: 18,
    phone: '080-41123344',
    open247: true,
  },
  {
    id: 'pin-women-sakhi',
    name: 'Sakhi Women Help Centre (Silk Board)',
    category: 'women_help',
    xPct: 29,
    yPct: 82,
    elevationPx: 24,
    phone: '181',
    open247: true,
  },
  {
    id: 'pin-metro-kr',
    name: 'K.R. Puram Namma Metro Hub',
    category: 'metro',
    xPct: 83,
    yPct: 68,
    elevationPx: 28,
    phone: '080-22969200',
    open247: true,
  },
  {
    id: 'pin-metro-mg',
    name: 'MG Road Namma Metro Interchange',
    category: 'metro',
    xPct: 16,
    yPct: 56,
    elevationPx: 26,
    phone: '080-22969200',
    open247: true,
  },
];

export function formatTwoDigitCount(value: number): string {
  const clamped = Math.max(0, Math.round(value));
  return clamped < 10 ? `0${clamped}` : String(clamped);
}

export function computeDashboardKpis(
  fleet: GreenCorridorVehicle[],
  signalMode: SignalMode,
  weatherCondition: WeatherCondition
): DashboardKpiSummary {
  const emergencyCount = Math.max(4, fleet.length + 1);
  const preClearedSignals = fleet.reduce(
    (sum, v) => sum + v.signals.filter((s) => s.currentPhase === 'GREEN').length,
    0
  );
  const greenSignalTotal = Math.max(
    12,
    preClearedSignals + (signalMode === 'adaptive' ? 6 : 2)
  );
  const corridorCount = Math.max(8, fleet.length + 5);

  const avgSaved =
    fleet.length > 0
      ? Math.round(
          fleet.reduce((sum, v) => sum + v.timeSavedMin, 0) / fleet.length
        )
      : 6;
  const weatherAdj =
    weatherCondition === 'heavy_rain' || weatherCondition === 'morning_fog'
      ? 1
      : 0;
  const finalSaved = Math.max(6, avgSaved + weatherAdj);

  return {
    activeEmergencies: formatTwoDigitCount(emergencyCount),
    greenSignals: formatTwoDigitCount(greenSignalTotal),
    activeCorridors: formatTwoDigitCount(corridorCount),
    timeSavedMin: formatTwoDigitCount(finalSaved),
  };
}

export function computeMajorJunctionStatuses(
  tickSeconds: number,
  signalMode: SignalMode,
  scenario: TrafficScenario,
  language: AppLanguage
): MajorJunctionStatusItem[] {
  const defs: Array<{ id: string; name: string; corridor: string; offset: number; baseSpeed: number }> = [
    { id: 'jx-silk-board', name: 'Silk Board', corridor: 'ORR South Hub', offset: 0, baseSpeed: 34 },
    { id: 'jx-marathahalli', name: 'Marathahalli', corridor: 'ORR East IT Belt', offset: 1, baseSpeed: 38 },
    { id: 'jx-kr-puram', name: 'K.R. Puram', corridor: 'Tin Factory / Purple Line', offset: 2, baseSpeed: 36 },
    { id: 'jx-mg-road', name: 'MG Road', corridor: 'Central CBD Axis', offset: 3, baseSpeed: 42 },
    { id: 'jx-hebbal', name: 'Hebbal', corridor: 'Airport Flyover', offset: 4, baseSpeed: 44 },
  ];

  const isWave = scenario === 'emergency_green_wave' || signalMode === 'adaptive';

  return defs.map((def, idx) => {
    const cycle = (tickSeconds + def.offset * 5) % 24;
    const status: 'GREEN' | 'PREPARING' =
      scenario === 'emergency_green_wave'
        ? idx <= 3
          ? 'GREEN'
          : 'PREPARING'
        : isWave
          ? cycle < 17
            ? 'GREEN'
            : 'PREPARING'
          : cycle < 11
            ? 'GREEN'
            : 'PREPARING';

    const countdownSec =
      status === 'GREEN' ? Math.max(4, 24 - cycle) : Math.max(2, 8 - (cycle % 7));

    return {
      id: def.id,
      name: localizeBengaluruPlaceName(def.name, language),
      corridorHint: localizeBengaluruPlaceName(def.corridor, language),
      status,
      countdownSec,
      speedKmh: isWave ? def.baseSpeed + 6 : def.baseSpeed - 8,
    };
  });
}

export function buildLiveActivityFeed(
  weatherCondition: WeatherCondition,
  signalMode: SignalMode,
  sosActive: boolean,
  language: AppLanguage
): LiveActivityEvent[] {
  const localizedSilkBoard = localizeBengaluruPlaceName('Silk Board', language);
  const localizedMarathahalli = localizeBengaluruPlaceName('Marathahalli', language);
  const localizedIndiranagar = localizeBengaluruPlaceName('Indiranagar', language);
  const localizedHebbal = localizeBengaluruPlaceName('Hebbal', language);

  if (language === 'kn') {
    return [
      {
        id: 'act-1',
        timestamp: 'ಈಗಲೇ',
        category: 'emergency',
        title: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಗ್ರೀನ್ ವೇವ್ ಸಕ್ರಿಯ',
        detail: `${localizedMarathahalli} → ಮಣಿಪಾಲ್ ಆಸ್ಪತ್ರೆ ಮಾರ್ಗದಲ್ಲಿ 4 ಸಿಗ್ನಲ್ ಹಸಿರು ಮಾಡಲಾಗಿದೆ`,
      },
      {
        id: 'act-2',
        timestamp: '2 ನಿ. ಹಿಂದೆ',
        category: 'signal',
        title: signalMode === 'adaptive' ? 'AI ಸಿಗ್ನಲ್ ಸಮನ್ವಯ' : 'ಸ್ಥಿರ ಟೈಮರ್ ಪರಿಶೀಲನೆ',
        detail: `${localizedSilkBoard} ನಲ್ಲಿ ಕಾಯುವ ಸಮಯ 38% ಕಡಿಮೆಯಾಗಿದೆ`,
      },
      {
        id: 'act-3',
        timestamp: '4 ನಿ. ಹಿಂದೆ',
        category: 'safety',
        title: sosActive ? 'SOS ಪೊಲೀಸ್ ರವಾನೆ ಸಕ್ರಿಯ' : 'ಮಹಿಳಾ ಸುರಕ್ಷಿತ ಕಾರಿಡಾರ್ ಗಸ್ತು',
        detail: `${localizedIndiranagar} ಪಿಂಕ್ ಹೊಯ್ಸಳ ಗಸ್ತು ವಲಯ ದೃಢೀಕರಿಸಲಾಗಿದೆ`,
      },
      {
        id: 'act-4',
        timestamp: '7 ನಿ. ಹಿಂದೆ',
        category: 'weather',
        title: weatherCondition === 'heavy_rain' ? 'ಮಳೆ ಹಳದಿ ಬಫರ್ +2s' : 'ಹೈಪರ್-ಲೋಕಲ್ ಹವಾಮಾನ ಸಿಂಕ್',
        detail: `${localizedHebbal} ರಸ್ತೆ ಗ್ರಿಪ್ ಮತ್ತು ಮೆಟ್ರೋ ಫೀಡರ್ ನವೀಕರಿಸಲಾಗಿದೆ`,
      },
    ];
  }

  return [
    {
      id: 'act-1',
      timestamp: 'Just now',
      category: 'emergency',
      title: 'Ambulance Green Wave Active',
      detail: `4 signals cleared ahead along ${localizedMarathahalli} → Manipal Hospital corridor`,
    },
    {
      id: 'act-2',
      timestamp: '2m ago',
      category: 'signal',
      title:
        signalMode === 'adaptive'
          ? 'Adaptive Signal Optimization'
          : 'Signal Cycle Telemetry',
      detail: `${localizedSilkBoard} queue discharge boosted (+38% throughput)`,
    },
    {
      id: 'act-3',
      timestamp: '4m ago',
      category: 'safety',
      title: sosActive ? 'SOS Auto-Dispatch Protocol Active' : "Women's Safe Corridor Patrol",
      detail: `${localizedIndiranagar} LED-lit stretch & Pink Hoysala beat verified`,
    },
    {
      id: 'act-4',
      timestamp: '7m ago',
      category: 'weather',
      title:
        weatherCondition === 'heavy_rain' || weatherCondition === 'light_rain'
          ? 'Monsoon Wet-Grip Adjustment'
          : 'Micro-Weather Telemetry Sync',
      detail: `${localizedHebbal} friction index & sheltered Metro feeder synced`,
    },
  ];
}
