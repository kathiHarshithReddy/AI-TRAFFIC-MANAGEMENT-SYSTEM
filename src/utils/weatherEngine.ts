import { BENGALURU_LOCALITIES } from '../data/bengaluruLocalities';
import {
  Locality,
  LocalityMicroWeather,
  MicroWeatherCondition,
  WeatherCondition,
  WeatherTelemetry,
  WeatherTrafficImpact,
} from '../types/traffic';

export const BENGALURU_OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FKolkata';

export const WEATHER_IMPACT_CONFIG: Record<WeatherCondition, WeatherTrafficImpact> = {
  clear: {
    condition: 'clear',
    label: 'Clear / Nominal',
    speedMultiplier: 1.0,
    densityDeltaPct: 0,
    queueMultiplier: 1.0,
    roadFrictionCoeff: 1.0,
    yellowSafetyBufferSec: 0,
    transitAdvantageNote: 'Normal dry-road visibility and Yulu EV + Metro zero-emission preference.',
  },
  light_rain: {
    condition: 'light_rain',
    label: 'Sudden Evening Rainstorm',
    speedMultiplier: 0.82,
    densityDeltaPct: 8,
    queueMultiplier: 1.2,
    roadFrictionCoeff: 0.81,
    yellowSafetyBufferSec: 2,
    transitAdvantageNote:
      'Wet braking lowers discharge rate (-19%); +2s yellow safety buffer & covered Metro/E-Auto routing.',
  },
  heavy_rain: {
    condition: 'heavy_rain',
    label: 'Waterlogging Alert (Low-Lying Junctions)',
    speedMultiplier: 0.65,
    densityDeltaPct: 16,
    queueMultiplier: 1.42,
    roadFrictionCoeff: 0.68,
    yellowSafetyBufferSec: 2,
    transitAdvantageNote:
      'Road friction reduced to 0.68 (-32% discharge rate); +2s yellow clearance & covered rail/E-Auto priority.',
  },
  morning_fog: {
    condition: 'morning_fog',
    label: 'Morning Fog / Low Visibility',
    speedMultiplier: 0.84,
    densityDeltaPct: 6,
    queueMultiplier: 1.16,
    roadFrictionCoeff: 0.84,
    yellowSafetyBufferSec: 2,
    transitAdvantageNote:
      'Low visibility on Hebbal, Airport & Outskirts corridors; +2s yellow buffer & grade-separated Metro priority.',
  },
  extreme_heat: {
    condition: 'extreme_heat',
    label: 'High Heat / UV (>=31°C)',
    speedMultiplier: 0.89,
    densityDeltaPct: 6,
    queueMultiplier: 1.12,
    roadFrictionCoeff: 0.94,
    yellowSafetyBufferSec: 0,
    transitAdvantageNote:
      'High afternoon UV & thermal load; AC Metro, BMTC Vajra & shaded E-Auto transfers preferred.',
  },
};

export function classifyBengaluruWeather(
  temperatureC: number,
  precipitationMm: number,
  weatherCode: number
): { condition: WeatherCondition; weatherLabel: string } {
  const isHeavyRainCode = [63, 65, 67, 81, 82, 95, 96, 99].includes(weatherCode);
  const isLightRainCode = [51, 53, 55, 56, 57, 61, 80].includes(weatherCode);
  const isFogCode = [45, 48].includes(weatherCode);

  if (precipitationMm >= 2.5 || isHeavyRainCode) {
    return {
      condition: 'heavy_rain',
      weatherLabel: weatherCode >= 95 ? 'Thunderstorm & Downpour' : 'Heavy Monsoon Rain',
    };
  }

  if (precipitationMm >= 0.1 || isLightRainCode) {
    return {
      condition: 'light_rain',
      weatherLabel: weatherCode <= 55 ? 'Light Drizzle' : 'Moderate Showers',
    };
  }

  if (isFogCode) {
    return {
      condition: 'morning_fog',
      weatherLabel: 'Early Morning Mist/Fog',
    };
  }

  if (temperatureC >= 31) {
    return {
      condition: 'extreme_heat',
      weatherLabel: temperatureC >= 34 ? 'Extreme Heatwave' : 'High Heat / UV',
    };
  }

  if (weatherCode >= 1 && weatherCode <= 3) {
    return {
      condition: 'clear',
      weatherLabel: weatherCode === 3 ? 'Overcast' : 'Partly Cloudy',
    };
  }

  return {
    condition: 'clear',
    weatherLabel: 'Clear & Pleasant',
  };
}

export function createSimulatedWeather(
  condition: WeatherCondition
): WeatherTelemetry {
  const nowLabel = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  switch (condition) {
    case 'light_rain':
      return {
        source: 'simulated',
        condition: 'light_rain',
        temperatureC: 21.4,
        apparentTempC: 22.0,
        humidityPct: 88,
        precipitationMm: 4.8,
        windKmh: 16,
        weatherLabel: 'Sudden Evening Rainstorm',
        updatedAt: nowLabel,
      };
    case 'heavy_rain':
      return {
        source: 'simulated',
        condition: 'heavy_rain',
        temperatureC: 19.2,
        apparentTempC: 19.8,
        humidityPct: 96,
        precipitationMm: 22.0,
        windKmh: 26,
        weatherLabel: 'Waterlogging Alert (Low-Lying Junctions)',
        updatedAt: nowLabel,
      };
    case 'morning_fog':
      return {
        source: 'simulated',
        condition: 'morning_fog',
        temperatureC: 18.1,
        apparentTempC: 18.1,
        humidityPct: 92,
        precipitationMm: 0,
        windKmh: 6,
        weatherLabel: 'Early Morning Mist / Fog',
        updatedAt: nowLabel,
      };
    case 'extreme_heat':
      return {
        source: 'simulated',
        condition: 'extreme_heat',
        temperatureC: 32.8,
        apparentTempC: 34.6,
        humidityPct: 36,
        precipitationMm: 0,
        windKmh: 9,
        weatherLabel: 'High Heat / UV Advisory',
        updatedAt: nowLabel,
      };
    default:
      return {
        source: 'simulated',
        condition: 'clear',
        temperatureC: 24.2,
        apparentTempC: 24.5,
        humidityPct: 60,
        precipitationMm: 0,
        windKmh: 11,
        weatherLabel: 'Clear & Pleasant',
        updatedAt: nowLabel,
      };
  }
}

export function getFallbackBengaluruWeather(): WeatherTelemetry {
  const nowLabel = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return {
    source: 'fallback',
    condition: 'clear',
    temperatureC: 24.2,
    apparentTempC: 24.8,
    humidityPct: 62,
    precipitationMm: 0,
    windKmh: 10,
    weatherLabel: 'Clear & Pleasant (Cached BLR)',
    updatedAt: nowLabel,
  };
}

export async function fetchBengaluruLiveWeather(
  signal?: AbortSignal
): Promise<WeatherTelemetry> {
  const response = await fetch(BENGALURU_OPEN_METEO_URL, { signal });
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  const data = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      apparent_temperature?: number;
      relative_humidity_2m?: number;
      precipitation?: number;
      weather_code?: number;
      wind_speed_10m?: number;
    };
  };

  const current = data.current;
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('Malformed Open-Meteo weather payload');
  }

  const temperatureC = Number(current.temperature_2m.toFixed(1));
  const apparentTempC = Number(
    (current.apparent_temperature ?? temperatureC).toFixed(1)
  );
  const humidityPct = Math.round(current.relative_humidity_2m ?? 60);
  const precipitationMm = Number((current.precipitation ?? 0).toFixed(1));
  const weatherCode = current.weather_code ?? 0;
  const windKmh = Math.round(current.wind_speed_10m ?? 10);

  const { condition, weatherLabel } = classifyBengaluruWeather(
    temperatureC,
    precipitationMm,
    weatherCode
  );

  const updatedAt = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    source: 'live',
    condition,
    temperatureC,
    apparentTempC,
    humidityPct,
    precipitationMm,
    windKmh,
    weatherLabel,
    updatedAt,
  };
}

const WATERLOGGING_PRONE_IDS = new Set<string>([
  'bellandur',
  'panathur',
  'marathahalli',
  'kadubeesanahalli',
  'varthur',
  'madiwala',
  'btm-layout',
  'ejipura',
  'koramangala-blocks-1-8',
  'hebbal',
  'nagavara',
  'kr-market',
  'kalasipalyam',
  'chickpet',
  'kr-puram-krishnarajapuram',
  'nayandahalli',
  'majestic',
  'halasuru-ulsoor',
  'domlur',
  'yeshwanthpur',
  'electronic-city-phases-1-2',
  'bommanahalli',
  'hosakerehalli',
]);

const LAKE_MIST_CORRIDOR_IDS = new Set<string>([
  'devanahalli',
  'bagalur',
  'jakkur',
  'yelahanka',
  'yelahanka-new-town',
  'kogilu',
  'hesaraghatta',
  'chikkabanavara',
  'nelamangala',
  'hennur',
  'rachenahalli',
  'thanisandra',
  'varthur',
  'gunjur',
  'sankey-road',
  'lalbagh',
  'cubbon-park',
]);

const HIGH_HEAT_EXPOSED_IDS = new Set<string>([
  'peenya',
  'kg-road',
  'kr-market',
  'mahadevapura',
  'hoodi',
  'itpl-road',
  'attibele',
  'chandapura',
  'hoskote',
  'bidadi',
  'jigani',
  'anekal',
]);

function deterministicLocalityHash(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 997;
  }
  return hash;
}

export function isMicroWeatherRainy(micro: LocalityMicroWeather): boolean {
  return micro.condition === 'light_drizzle' || micro.condition === 'heavy_downpour';
}

export function getLocalityMicroWeather(
  locality: Locality,
  globalCondition: WeatherCondition = 'clear',
  globalTempC?: number
): LocalityMicroWeather {
  const hash = deterministicLocalityHash(locality.id);
  const offset = (hash % 5) - 2; // -2 to +2 fine micro-climate variation
  const isFloodProne = WATERLOGGING_PRONE_IDS.has(locality.id);
  const isMistZone = LAKE_MIST_CORRIDOR_IDS.has(locality.id) || locality.zone === 'North Bengaluru';
  const isHeatExposed = HIGH_HEAT_EXPOSED_IDS.has(locality.id) || locality.zone === 'Outskirts';

  if (globalCondition === 'heavy_rain') {
    const precip = isFloodProne ? 22 + (hash % 6) : 14 + (hash % 5);
    const grip = Number((isFloodProne ? 0.65 + (hash % 4) * 0.01 : 0.71 + (hash % 4) * 0.01).toFixed(2));
    return {
      localityId: locality.id,
      condition: 'heavy_downpour',
      label: isFloodProne
        ? 'Heavy Monsoon Downpour & Waterlogging Alert'
        : 'Heavy Monsoon Downpour',
      temperatureC: Number((18.6 + (hash % 3) * 0.4).toFixed(1)),
      rainProbabilityPct: isFloodProne ? 96 : 88 + (hash % 8),
      precipitationMmHr: precip,
      roadGripFactor: grip,
      waterloggingRisk: isFloodProne,
      uvIndex: 1,
    };
  }

  if (globalCondition === 'light_rain') {
    if (isFloodProne) {
      return {
        localityId: locality.id,
        condition: 'heavy_downpour',
        label: 'Heavy Monsoon Downpour & Waterlogging Alert',
        temperatureC: Number((19.2 + (hash % 3) * 0.3).toFixed(1)),
        rainProbabilityPct: 92 + (hash % 6),
        precipitationMmHr: 16 + (hash % 5),
        roadGripFactor: Number((0.68 + (hash % 4) * 0.01).toFixed(2)),
        waterloggingRisk: true,
        uvIndex: 2,
      };
    }

    return {
      localityId: locality.id,
      condition: 'light_drizzle',
      label: 'Light Drizzle',
      temperatureC: Number((20.8 + (hash % 4) * 0.3).toFixed(1)),
      rainProbabilityPct: 74 + (hash % 15),
      precipitationMmHr: Number((3.2 + (hash % 5) * 0.7).toFixed(1)),
      roadGripFactor: Number((0.8 + (hash % 5) * 0.01).toFixed(2)),
      waterloggingRisk: false,
      uvIndex: 2,
    };
  }

  if (globalCondition === 'morning_fog') {
    const denseFog = isMistZone || isFloodProne;
    return {
      localityId: locality.id,
      condition: 'morning_fog',
      label: 'Early Morning Mist/Fog',
      temperatureC: Number((17.5 + (hash % 4) * 0.3).toFixed(1)),
      rainProbabilityPct: 12 + (hash % 10),
      precipitationMmHr: 0,
      roadGripFactor: Number((denseFog ? 0.82 + (hash % 3) * 0.01 : 0.87 + (hash % 3) * 0.01).toFixed(2)),
      waterloggingRisk: false,
      uvIndex: 2,
    };
  }

  if (globalCondition === 'extreme_heat') {
    const baseHot = Math.max(31, globalTempC ?? 32.5);
    return {
      localityId: locality.id,
      condition: 'high_heat_uv',
      label: 'High Heat / UV',
      temperatureC: Number((baseHot + (isHeatExposed ? 1.4 : 0) + offset * 0.3).toFixed(1)),
      rainProbabilityPct: 5 + (hash % 7),
      precipitationMmHr: 0,
      roadGripFactor: Number((0.93 + (hash % 3) * 0.01).toFixed(2)),
      waterloggingRisk: false,
      uvIndex: isHeatExposed ? 10 : 9,
    };
  }

  // Global 'clear' / live nominal baseline: realistic zone-specific Bengaluru micro-climates
  if (isFloodProne && hash % 2 === 0) {
    return {
      localityId: locality.id,
      condition: 'light_drizzle',
      label: 'Light Drizzle',
      temperatureC: Number((21.0 + (hash % 3) * 0.4).toFixed(1)),
      rainProbabilityPct: 58 + (hash % 18),
      precipitationMmHr: Number((1.8 + (hash % 4) * 0.5).toFixed(1)),
      roadGripFactor: Number((0.83 + (hash % 4) * 0.01).toFixed(2)),
      waterloggingRisk: false,
      uvIndex: 3,
    };
  }

  if (isMistZone && hash % 3 === 0) {
    return {
      localityId: locality.id,
      condition: 'morning_fog',
      label: 'Early Morning Mist/Fog',
      temperatureC: Number((18.2 + (hash % 3) * 0.4).toFixed(1)),
      rainProbabilityPct: 14 + (hash % 8),
      precipitationMmHr: 0,
      roadGripFactor: 0.88,
      waterloggingRisk: false,
      uvIndex: 3,
    };
  }

  if (isHeatExposed && hash % 3 === 1) {
    return {
      localityId: locality.id,
      condition: 'high_heat_uv',
      label: 'High Heat / UV',
      temperatureC: Number((30.8 + (hash % 3) * 0.4).toFixed(1)),
      rainProbabilityPct: 8 + (hash % 6),
      precipitationMmHr: 0,
      roadGripFactor: 0.95,
      waterloggingRisk: false,
      uvIndex: 8,
    };
  }

  const baseClear = globalTempC && globalTempC < 29 ? globalTempC : 24.0;
  const condition: MicroWeatherCondition = 'clear_pleasant';
  return {
    localityId: locality.id,
    condition,
    label: 'Clear & Pleasant',
    temperatureC: Number((baseClear + offset * 0.3).toFixed(1)),
    rainProbabilityPct: 10 + (hash % 12),
    precipitationMmHr: 0,
    roadGripFactor: Number((0.97 + (hash % 3) * 0.01).toFixed(2)),
    waterloggingRisk: false,
    uvIndex: 5,
  };
}

export function getAllLocalitiesMicroWeather(
  globalCondition: WeatherCondition = 'clear',
  globalTempC?: number
): Map<string, LocalityMicroWeather> {
  const result = new Map<string, LocalityMicroWeather>();
  for (const locality of BENGALURU_LOCALITIES) {
    result.set(
      locality.id,
      getLocalityMicroWeather(locality, globalCondition, globalTempC)
    );
  }
  return result;
}
