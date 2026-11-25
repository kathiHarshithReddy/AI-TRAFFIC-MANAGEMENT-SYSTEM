import {
  CorridorSignalNode,
  EmergencyDestinationHub,
  EmergencyVehicleType,
  GiveWayAlert,
  GreenCorridorVehicle,
  Locality,
  RouteWaypoint,
  WeatherCondition,
} from '../types/traffic';
import { haversineKm } from './routingEngine';

export const EMERGENCY_DESTINATION_HUBS: EmergencyDestinationHub[] = [
  {
    id: 'hub-manipal-hal',
    name: 'Manipal Hospital (Old Airport Rd)',
    type: 'hospital',
    localityName: 'Murugeshpalya / HAL',
    lat: 12.9585,
    lng: 77.6488,
    address: '98, HAL Old Airport Rd, Bengaluru 560017',
  },
  {
    id: 'hub-nimhans',
    name: 'NIMHANS Trauma & Emergency Center',
    type: 'hospital',
    localityName: 'Wilson Garden / Lakkasandra',
    lat: 12.9406,
    lng: 77.5968,
    address: 'Hosur Rd, Lakkasandra, Bengaluru 560029',
  },
  {
    id: 'hub-st-johns',
    name: "St. John's Medical College Hospital",
    type: 'hospital',
    localityName: 'Koramangala',
    lat: 12.9296,
    lng: 77.6203,
    address: 'Sarjapur - Marathahalli Rd, Koramangala, Bengaluru 560034',
  },
  {
    id: 'hub-aster-cmi',
    name: 'Aster CMI Hospital (Hebbal)',
    type: 'hospital',
    localityName: 'Hebbal',
    lat: 13.0545,
    lng: 77.5916,
    address: '43/2, New Airport Rd, Sahakara Nagar, Bengaluru 560092',
  },
  {
    id: 'hub-narayana-health',
    name: 'Narayana Health City (Bommasandra)',
    type: 'hospital',
    localityName: 'Electronic City / Bommasandra',
    lat: 12.8091,
    lng: 77.6952,
    address: '258/A, Bommasandra Industrial Area, Bengaluru 560099',
  },
  {
    id: 'hub-victoria',
    name: 'Victoria Trauma Hospital (KR Market)',
    type: 'hospital',
    localityName: 'KR Market / Chamarajpet',
    lat: 12.9636,
    lng: 77.5738,
    address: 'Fort Rd, New Tharagupet, Bengaluru 560002',
  },
  {
    id: 'hub-fire-hq',
    name: 'Bengaluru Fire & Emergency Command',
    type: 'fire_command',
    localityName: 'High Grounds / Ulsoor',
    lat: 12.9815,
    lng: 77.6194,
    address: 'Annaswamy Mudaliar Rd, Ulsoor, Bengaluru 560042',
  },
  {
    id: 'hub-police-hq',
    name: 'Bengaluru Police Control Room (112 HQ)',
    type: 'police_hq',
    localityName: 'Infantry Road / Cubbon Park',
    lat: 12.9818,
    lng: 77.5974,
    address: 'No. 1 Infantry Rd, Bengaluru 560001',
  },
];

const INTERMEDIATE_SIGNAL_CANDIDATES: Array<{
  id: string;
  name: string;
  lat: number;
  lng: number;
}> = [
  { id: 'sig-silk-board', name: 'Central Silk Board Signal', lat: 12.9177, lng: 77.6238 },
  { id: 'sig-iblu', name: 'Iblur Gate ORR Signal', lat: 12.9209, lng: 77.6531 },
  { id: 'sig-bellandur', name: 'Bellandur Ecospace Junction', lat: 12.9279, lng: 77.6762 },
  { id: 'sig-marathahalli', name: 'Marathahalli Bridge Signal', lat: 12.9562, lng: 77.7019 },
  { id: 'sig-domlur', name: 'Domlur Flyover Signal', lat: 12.9609, lng: 77.6387 },
  { id: 'sig-indiranagar', name: 'Indiranagar 100ft Rd Signal', lat: 12.9784, lng: 77.6408 },
  { id: 'sig-trinity', name: 'Trinity Circle Signal', lat: 12.973, lng: 77.6169 },
  { id: 'sig-richmond', name: 'Richmond Circle Signal', lat: 12.9644, lng: 77.5993 },
  { id: 'sig-jayadeva', name: 'Jayadeva Interchange Signal', lat: 12.9167, lng: 77.6001 },
  { id: 'sig-hebbal', name: 'Hebbal Flyover Junction', lat: 13.0358, lng: 77.597 },
  { id: 'sig-nagavara', name: 'Nagavara Manyata Signal', lat: 13.045, lng: 77.6203 },
  { id: 'sig-mekhri', name: 'Mekhri Circle Signal', lat: 13.0119, lng: 77.5833 },
  { id: 'sig-krpuram', name: 'KR Puram Tin Factory Signal', lat: 12.9964, lng: 77.6696 },
  { id: 'sig-koramangala-sony', name: 'Koramangala Sony World Signal', lat: 12.9367, lng: 77.6269 },
  { id: 'sig-majestic', name: 'Majestic Kempegowda Circle', lat: 12.9756, lng: 77.5728 },
];

export function buildEmergencyRoutePlan(
  id: string,
  callSign: string,
  type: EmergencyVehicleType,
  priorityLevel: 'Code 1 Critical' | 'Code 2 Urgent',
  originName: string,
  originLat: number,
  originLng: number,
  destination: EmergencyDestinationHub,
  progressPct = 18,
  roadblockActive = false,
  weatherCondition: WeatherCondition = 'clear'
): GreenCorridorVehicle {
  const distKm = haversineKm(originLat, originLng, destination.lat, destination.lng);
  const midLat = (originLat + destination.lat) / 2;
  const midLng = (originLng + destination.lng) / 2;

  // Pick realistic intermediate signal intersections closest to the route corridor
  const rankedSignals = INTERMEDIATE_SIGNAL_CANDIDATES.map((s) => {
    const dOrigin = haversineKm(originLat, originLng, s.lat, s.lng);
    const dDest = haversineKm(s.lat, s.lng, destination.lat, destination.lng);
    const detour = dOrigin + dDest - distKm;
    const fraction = Math.min(0.88, Math.max(0.14, dOrigin / Math.max(0.5, dOrigin + dDest)));
    return { signal: s, detour, fraction };
  })
    .sort((a, b) => a.detour - b.detour)
    .slice(0, 4)
    .sort((a, b) => a.fraction - b.fraction);

  // Deduplicate/normalize fractions cleanly along the path
  const normalizedSignals: CorridorSignalNode[] = rankedSignals.map((item, idx) => {
    const frac = Number((0.18 + idx * 0.21).toFixed(2));
    return {
      id: `${id}-${item.signal.id}`,
      name: item.signal.name,
      lat: item.signal.lat,
      lng: item.signal.lng,
      routeFraction: frac,
      defaultPhase: idx % 2 === 0 ? 'RED' : 'YELLOW',
      currentPhase: 'RED',
      preClearedForEmergency: false,
      distanceFromVehicleKm: 0,
      waitSavedSec: 42 + idx * 8,
    };
  });

  // Construct primary route waypoints through those intersections
  const primaryRoute: RouteWaypoint[] = [
    { name: originName, lat: originLat, lng: originLng },
    ...normalizedSignals.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng })),
    { name: destination.name, lat: destination.lat, lng: destination.lng },
  ];

  // Construct AI alternate bypass route slightly offset around congestion/roadblocks
  const dLat = destination.lat - originLat;
  const dLng = destination.lng - originLng;
  const perpLat = -dLng * 0.16;
  const perpLng = dLat * 0.16;

  const alternateRoute: RouteWaypoint[] = [
    { name: originName, lat: originLat, lng: originLng },
    {
      name: 'AI Bypass Arterial Sector 1',
      lat: Number((originLat + dLat * 0.35 + perpLat).toFixed(4)),
      lng: Number((originLng + dLng * 0.35 + perpLng).toFixed(4)),
    },
    {
      name: 'AI Parallel Signal-Cleared Link',
      lat: Number((midLat + perpLat * 1.1).toFixed(4)),
      lng: Number((midLng + perpLng * 1.1).toFixed(4)),
    },
    {
      name: 'Hospital Priority Entry Ramp',
      lat: Number((originLat + dLat * 0.78 + perpLat * 0.5).toFixed(4)),
      lng: Number((originLng + dLng * 0.78 + perpLng * 0.5).toFixed(4)),
    },
    { name: destination.name, lat: destination.lat, lng: destination.lng },
  ];

  const weatherSlowdown =
    weatherCondition === 'heavy_rain'
      ? 1.25
      : weatherCondition === 'light_rain' || weatherCondition === 'morning_fog'
        ? 1.12
        : 1.0;

  const baselineEtaMin = Math.max(8, Math.round(distKm * 3.1 * weatherSlowdown));
  const optimizedEtaMin = Math.max(
    4,
    Math.round(distKm * (roadblockActive ? 1.75 : 1.45) * weatherSlowdown)
  );
  const timeSavedMin = Math.max(3, baselineEtaMin - optimizedEtaMin);

  const initial: GreenCorridorVehicle = {
    id,
    callSign,
    type,
    priorityLevel,
    originName,
    originLat,
    originLng,
    destination,
    progressPct,
    speedKmh: roadblockActive ? 44 : 52,
    roadblockActive,
    status: roadblockActive ? 'rerouting_obstacle' : 'en_route_priority',
    baselineEtaMin,
    optimizedEtaMin,
    timeSavedMin,
    congestionScorePct: roadblockActive ? 89 : 76,
    primaryRoute,
    alternateRoute,
    signals: normalizedSignals,
  };

  return synchronizeCorridorSignals(initial);
}

export function synchronizeCorridorSignals(
  vehicle: GreenCorridorVehicle
): GreenCorridorVehicle {
  const frac = vehicle.progressPct / 100;
  const totalKm = Math.max(
    1.5,
    haversineKm(
      vehicle.originLat,
      vehicle.originLng,
      vehicle.destination.lat,
      vehicle.destination.lng
    ) * 1.25
  );

  const updatedSignals: CorridorSignalNode[] = vehicle.signals.map((sig) => {
    const delta = sig.routeFraction - frac;
    const distKm = Number(Math.abs(delta * totalKm).toFixed(2));
    // Pre-clear upcoming signals within 0.28 route fraction ahead of the emergency vehicle
    const preCleared = delta >= -0.05 && delta <= 0.30;
    const currentPhase = preCleared
      ? 'GREEN'
      : delta < -0.05
        ? 'YELLOW'
        : sig.defaultPhase;

    return {
      ...sig,
      currentPhase,
      preClearedForEmergency: preCleared,
      distanceFromVehicleKm: distKm,
    };
  });

  const status =
    vehicle.progressPct >= 90
      ? 'arriving'
      : vehicle.roadblockActive
        ? 'rerouting_obstacle'
        : 'en_route_priority';

  const remainingRatio = Math.max(0.05, (100 - vehicle.progressPct) / 100);
  const dynamicEta = Math.max(
    1,
    Math.round(vehicle.optimizedEtaMin * remainingRatio)
  );

  return {
    ...vehicle,
    status,
    optimizedEtaMin: vehicle.progressPct === 0 ? vehicle.optimizedEtaMin : Math.max(dynamicEta, 1),
    signals: updatedSignals,
  };
}

export function advanceEmergencyVehicle(
  vehicle: GreenCorridorVehicle,
  deltaPct: number
): GreenCorridorVehicle {
  const nextProgress = vehicle.progressPct + deltaPct;
  const wrapped = nextProgress > 98 ? 8 : nextProgress;
  return synchronizeCorridorSignals({
    ...vehicle,
    progressPct: Number(wrapped.toFixed(1)),
  });
}

export function interpolateVehiclePosition(
  vehicle: GreenCorridorVehicle
): { lat: number; lng: number; headingDeg: number } {
  const waypoints = vehicle.roadblockActive
    ? vehicle.alternateRoute
    : vehicle.primaryRoute;
  if (waypoints.length < 2) {
    return { lat: vehicle.originLat, lng: vehicle.originLng, headingDeg: 0 };
  }

  const t = Math.min(1, Math.max(0, vehicle.progressPct / 100));
  const scaled = t * (waypoints.length - 1);
  const idx = Math.min(waypoints.length - 2, Math.floor(scaled));
  const localT = scaled - idx;

  const p1 = waypoints[idx];
  const p2 = waypoints[idx + 1];

  const lat = p1.lat + (p2.lat - p1.lat) * localT;
  const lng = p1.lng + (p2.lng - p1.lng) * localT;
  const headingDeg =
    (Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat) * 180) / Math.PI;

  return { lat, lng, headingDeg };
}

export function generateGiveWayAlerts(
  vehicles: GreenCorridorVehicle[]
): GiveWayAlert[] {
  const alerts: GiveWayAlert[] = [];

  for (const v of vehicles) {
    const frac = v.progressPct / 100;
    const upcoming = v.signals.find((s) => s.routeFraction >= frac);
    const targetSig = upcoming || v.signals[v.signals.length - 1];
    if (!targetSig) continue;

    const etaSec = Math.max(
      12,
      Math.round((targetSig.distanceFromVehicleKm / Math.max(25, v.speedKmh)) * 3600)
    );

    const vehicleLabel =
      v.type === 'ambulance'
        ? '108 ICU Ambulance'
        : v.type === 'fire_engine'
          ? 'Fire & Rescue Tender'
          : 'Pink Hoysala / Police Escort';

    alerts.push({
      id: `gw-${v.id}-${targetSig.id}`,
      vehicleCallSign: v.callSign,
      vehicleType: v.type,
      junctionName: targetSig.name,
      distanceAheadKm: targetSig.distanceFromVehicleKm,
      etaSec,
      instruction: v.roadblockActive
        ? `Rerouted ${vehicleLabel} (${v.callSign}) approaching ${targetSig.name} via AI Bypass — Clear right emergency lane immediately.`
        : `${vehicleLabel} (${v.callSign}) approaching ${targetSig.name} under Green Wave — Yield left/center lanes.`,
    });
  }

  return alerts;
}

export function createInitialEmergencyFleet(
  localities: Locality[],
  weatherCondition: WeatherCondition = 'clear'
): GreenCorridorVehicle[] {
  const bellandur =
    localities.find((l) => l.name.toLowerCase().includes('bellandur')) || localities[0];
  const hebbal =
    localities.find((l) => l.name.toLowerCase().includes('hebbal')) || localities[1];
  const koramangala =
    localities.find((l) => l.name.toLowerCase().includes('koramangala')) || localities[2];

  const manipalHal = EMERGENCY_DESTINATION_HUBS[0];
  const asterHebbal = EMERGENCY_DESTINATION_HUBS[3];
  const nimhans = EMERGENCY_DESTINATION_HUBS[1];

  return [
    buildEmergencyRoutePlan(
      'ev-amb-108',
      'KA-01-G-108 (ICU Ambulance)',
      'ambulance',
      'Code 1 Critical',
      bellandur.name,
      bellandur.lat,
      bellandur.lng,
      manipalHal,
      24,
      false,
      weatherCondition
    ),
    buildEmergencyRoutePlan(
      'ev-fire-101',
      'KA-01-F-101 (Fire Tender)',
      'fire_engine',
      'Code 1 Critical',
      hebbal.name,
      hebbal.lat,
      hebbal.lng,
      EMERGENCY_DESTINATION_HUBS[6],
      42,
      false,
      weatherCondition
    ),
    buildEmergencyRoutePlan(
      'ev-pol-112',
      'KA-01-P-112 (Police Escort)',
      'police',
      'Code 2 Urgent',
      koramangala.name,
      koramangala.lat,
      koramangala.lng,
      nimhans,
      58,
      false,
      weatherCondition
    ),
  ];
}
