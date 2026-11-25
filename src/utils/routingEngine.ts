import { METRO_INTERCHANGES, METRO_LINE_INFO } from '../data/bengaluruLocalities';
import {
  DepartureWindow,
  Itinerary,
  Locality,
  MetroLine,
  RouteLeg,
  RoutePriority,
  TimeOfDay,
  TravelerProfile,
  WeatherCondition,
} from '../types/traffic';
import {
  getLocalityMicroWeather,
  isMicroWeatherRainy,
  WEATHER_IMPACT_CONFIG,
} from './weatherEngine';

export const DEPARTURE_WINDOWS: Record<
  DepartureWindow,
  { label: string; congestionMultiplier: number; metroWaitMin: number; busWaitMin: number }
> = {
  now_peak: {
    label: 'Now (Live Peak Traffic)',
    congestionMultiplier: 1.24,
    metroWaitMin: 4,
    busWaitMin: 7,
  },
  morning_0830: {
    label: '08:30 AM (Morning Office Rush)',
    congestionMultiplier: 1.32,
    metroWaitMin: 3,
    busWaitMin: 6,
  },
  midday_1300: {
    label: '01:00 PM (Midday Moderate)',
    congestionMultiplier: 0.92,
    metroWaitMin: 5,
    busWaitMin: 9,
  },
  evening_1830: {
    label: '06:30 PM (Evening Gridlock)',
    congestionMultiplier: 1.42,
    metroWaitMin: 3,
    busWaitMin: 8,
  },
  late_2200: {
    label: '10:00 PM (Night Free-Flow)',
    congestionMultiplier: 0.68,
    metroWaitMin: 8,
    busWaitMin: 14,
  },
};

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.8, R * c);
}

function getInterchangePlan(
  originLine: MetroLine,
  destLine: MetroLine
): { station: string; transferMinutes: number } | null {
  if (originLine === destLine) return null;

  const direct = METRO_INTERCHANGES.find(
    (ic) => ic.lines.includes(originLine) && ic.lines.includes(destLine)
  );
  if (direct) {
    return { station: direct.station, transferMinutes: 4 };
  }

  if (
    (originLine === 'Purple' && destLine === 'Yellow') ||
    (originLine === 'Yellow' && destLine === 'Purple')
  ) {
    return {
      station: 'Majestic (Purple↔Green) & RV Road (Green↔Yellow)',
      transferMinutes: 8,
    };
  }

  if (
    (originLine === 'Green' && destLine === 'Pink') ||
    (originLine === 'Pink' && destLine === 'Green')
  ) {
    return {
      station: 'RV Road (Green↔Yellow) & Jayadeva Hospital (Yellow↔Pink)',
      transferMinutes: 7,
    };
  }

  return {
    station: 'Majestic & Jayadeva Hospital Interchanges',
    transferMinutes: 9,
  };
}

function metroFare(distKm: number): number {
  if (distKm <= 2) return 10;
  if (distKm <= 5) return 20;
  if (distKm <= 10) return 30;
  if (distKm <= 15) return 40;
  if (distKm <= 22) return 50;
  return 60;
}

function bmtcFare(distKm: number, isVajra: boolean, isWomenShakti: boolean): number {
  if (!isVajra && isWomenShakti) {
    return 0; // Karnataka Shakti Scheme free travel for women on ordinary BMTC buses
  }
  if (isVajra) {
    return Math.min(115, Math.max(25, Math.round(18 + distKm * 3.1)));
  }
  return Math.min(45, Math.max(10, Math.round(8 + distKm * 1.4)));
}

function memuFare(distKm: number): number {
  if (distKm <= 12) return 10;
  if (distKm <= 25) return 15;
  return 25;
}

export function computeMultiModalItineraries(
  origin: Locality,
  destination: Locality,
  priority: RoutePriority,
  departure: DepartureWindow,
  weatherCondition: WeatherCondition = 'clear',
  travelerProfile: TravelerProfile = 'standard',
  timeOfDay: TimeOfDay = 'evening_rush'
): Itinerary[] {
  const straightKm = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const roadDistKm = Number((straightKm * 1.28).toFixed(1));
  const avgCongestion = (origin.congestionIndex + destination.congestionIndex) / 2;
  const dep = DEPARTURE_WINDOWS[departure];
  const weather = WEATHER_IMPACT_CONFIG[weatherCondition];

  const originMicro = getLocalityMicroWeather(origin, weatherCondition);
  const destMicro = getLocalityMicroWeather(destination, weatherCondition);

  const globalRain =
    weatherCondition === 'light_rain' || weatherCondition === 'heavy_rain';
  const hasRainAtOrigin = isMicroWeatherRainy(originMicro) || globalRain;
  const hasRainAtDest = isMicroWeatherRainy(destMicro) || globalRain;
  const hasAnyRain = hasRainAtOrigin || hasRainAtDest;
  const hasHeavyRain =
    weatherCondition === 'heavy_rain' ||
    originMicro.condition === 'heavy_downpour' ||
    destMicro.condition === 'heavy_downpour';
  const hasFog =
    weatherCondition === 'morning_fog' ||
    originMicro.condition === 'morning_fog' ||
    destMicro.condition === 'morning_fog';

  const localGripAvg = (originMicro.roadGripFactor + destMicro.roadGripFactor) / 2;
  const effectiveSpeedMult = Number(
    Math.min(weather.speedMultiplier, 0.45 + localGripAvg * 0.55).toFixed(2)
  );
  const effectiveCongestion = avgCongestion * dep.congestionMultiplier;
  const isWomen = travelerProfile === 'women_commuter';
  const isLateNight = timeOfDay === 'late_night';

  // 1. NAMMA METRO + FEEDER (AI Eco-Hybrid Chain)
  const firstMileDist = origin.nearestMetro.distanceKm;
  const lastMileDist = destination.nearestMetro.distanceKm;
  const metroDistKm = Number(
    Math.max(2.2, roadDistKm - (firstMileDist + lastMileDist) * 0.72).toFixed(1)
  );
  const interchange = getInterchangePlan(
    origin.nearestMetro.line,
    destination.nearestMetro.line
  );

  const ecoLegs: RouteLeg[] = [];
  const avoidOpenOrigin = hasRainAtOrigin || hasFog || isLateNight;
  const avoidOpenDest = hasRainAtDest || hasFog || isLateNight;

  let switchedFirstMileToCovered = false;
  let switchedLastMileToCovered = false;

  // First-mile
  const firstWalkLimit = hasRainAtOrigin || isLateNight ? 0.35 : 0.6;
  if (firstMileDist <= firstWalkLimit) {
    ecoLegs.push({
      id: 'eco-first-walk',
      mode: 'walk',
      modeLabel: isLateNight ? 'Lit Skywalk / Walk' : 'Skywalk / Walk',
      lineOrRoute: 'Direct Station Footpath',
      from: origin.name,
      to: origin.nearestMetro.station,
      durationMin: Math.max(3, Math.round(firstMileDist * 12)),
      distanceKm: firstMileDist,
      fareInr: 0,
      co2Kg: 0,
      notes: isLateNight
        ? 'CCTV-monitored lit skywalk access to Metro concourse.'
        : 'Zero-emission pedestrian access to Metro concourse.',
    });
  } else if (firstMileDist <= 2.4 && !avoidOpenOrigin && !isLateNight) {
    ecoLegs.push({
      id: 'eco-first-yulu',
      mode: 'yulu_ev',
      modeLabel: 'Yulu Miracle EV',
      lineOrRoute: 'Zero-Emission Micro-EV',
      from: origin.name,
      to: origin.nearestMetro.station,
      durationMin: Math.max(4, Math.round((firstMileDist / 16) * 60 + 2)),
      distanceKm: firstMileDist,
      fareInr: Math.max(15, Math.round(10 + firstMileDist * 6)),
      co2Kg: 0.01,
      notes: 'Daytime micro-mobility Yulu dock to Metro Zone.',
    });
  } else {
    switchedFirstMileToCovered = (avoidOpenOrigin || isLateNight) && firstMileDist <= 2.4;
    ecoLegs.push({
      id: 'eco-first-feeder',
      mode: 'e_auto',
      modeLabel: 'Covered E-Auto (Namma Yatri Pink)',
      lineOrRoute: 'Verified Pink E-Auto Link',
      from: origin.name,
      to: origin.nearestMetro.station,
      durationMin: Math.max(
        6,
        Math.round((firstMileDist / 22) * 60 + 3)
      ),
      distanceKm: firstMileDist,
      fareInr: Math.max(25, Math.round(20 + firstMileDist * 9)),
      co2Kg: Number((firstMileDist * 0.022).toFixed(2)),
      weatherAdapted: switchedFirstMileToCovered || hasRainAtOrigin || isLateNight,
      notes: isLateNight
        ? 'Late-Night Safety Protocol: Verified GPS-tracked Pink E-Auto directly to Metro gate.'
        : 'Covered electric auto link avoiding weather and dark intervals.',
    });
  }

  // Metro Main Haul
  const metroRideMin = Math.max(
    5,
    Math.round((metroDistKm / 34) * 60) +
      dep.metroWaitMin +
      (interchange ? interchange.transferMinutes : 0)
  );
  const mLine = METRO_LINE_INFO[origin.nearestMetro.line];
  const dLine = METRO_LINE_INFO[destination.nearestMetro.line];

  ecoLegs.push({
    id: 'eco-metro-main',
    mode: 'namma_metro',
    modeLabel: interchange
      ? `Namma Metro Women's Coach (${origin.nearestMetro.line} → ${destination.nearestMetro.line})`
      : `Namma Metro Women's Coach (${origin.nearestMetro.line} Line)`,
    lineOrRoute: interchange
      ? `${mLine.name} via ${interchange.station} to ${dLine.name}`
      : mLine.name,
    metroLine: origin.nearestMetro.line,
    from: origin.nearestMetro.station,
    to: destination.nearestMetro.station,
    durationMin: metroRideMin,
    distanceKm: metroDistKm,
    fareInr: metroFare(metroDistKm),
    co2Kg: Number((metroDistKm * 0.014).toFixed(2)),
    weatherAdapted: hasAnyRain || hasFog || isLateNight,
    notes: '100% CCTV-monitored Women First Coach, station security, platform staff & zero traffic delay.',
  });

  // Last-mile
  const lastWalkLimit = hasRainAtDest || isLateNight ? 0.35 : 0.6;
  if (lastMileDist <= lastWalkLimit) {
    ecoLegs.push({
      id: 'eco-last-walk',
      mode: 'walk',
      modeLabel: isLateNight ? 'Lit Station Skywalk' : 'Skywalk / Walk',
      lineOrRoute: 'Pedestrian Last Mile',
      from: destination.nearestMetro.station,
      to: destination.name,
      durationMin: Math.max(3, Math.round(lastMileDist * 12)),
      distanceKm: lastMileDist,
      fareInr: 0,
      co2Kg: 0,
      notes: 'Secure lit station skywalk exit to destination.',
    });
  } else {
    switchedLastMileToCovered = avoidOpenDest || isLateNight;
    ecoLegs.push({
      id: 'eco-last-feeder',
      mode: 'e_auto',
      modeLabel: 'Covered E-Auto (Namma Yatri Pink)',
      lineOrRoute: 'Verified Pink E-Auto Last Mile',
      from: destination.nearestMetro.station,
      to: destination.name,
      durationMin: Math.max(
        5,
        Math.round((lastMileDist / 23) * 60 + 3)
      ),
      distanceKm: lastMileDist,
      fareInr: Math.max(25, Math.round(20 + lastMileDist * 9)),
      co2Kg: Number((lastMileDist * 0.022).toFixed(2)),
      weatherAdapted: switchedLastMileToCovered || hasRainAtDest || isLateNight,
      notes: isLateNight
        ? 'Late-Night Safety Protocol: Verified GPS auto drop directly at doorstep.'
        : 'Direct last-mile drop avoiding arterial congestion.',
    });
  }

  const ecoTotalMin = ecoLegs.reduce((s, l) => s + l.durationMin, 0);
  const ecoTotalFare = ecoLegs.reduce((s, l) => s + l.fareInr, 0);
  const ecoTotalCo2 = Number(ecoLegs.reduce((s, l) => s + l.co2Kg, 0).toFixed(2));
  const ecoWalkMeters = Math.round(
    ecoLegs
      .filter((l) => l.mode === 'walk')
      .reduce((s, l) => s + l.distanceKm * 1000, 0) + 180
  );

  const ecoItinerary: Itinerary = {
    id: 'eco-hybrid',
    category: 'eco_hybrid',
    title: isWomen ? 'Namma Metro + Verified Pink E-Auto (Safest)' : 'Namma Metro + Feeder Chain',
    subtitle: `${ecoLegs[0].modeLabel} → ${origin.nearestMetro.line} Line Metro → ${ecoLegs[ecoLegs.length - 1].modeLabel}`,
    recommended: false,
    weatherAdapted: hasAnyRain || isLateNight,
    weatherAdaptationBadge: isLateNight
      ? 'Late-Night Safe Protocol: Women First Metro Coach + Verified Pink E-Auto'
      : hasAnyRain
        ? 'Weather-Adapted: Covered Metro + E-Auto rain shield active'
        : undefined,
    totalDurationMin: ecoTotalMin,
    totalDistanceKm: Number((firstMileDist + metroDistKm + lastMileDist).toFixed(1)),
    totalFareInr: ecoTotalFare,
    totalCo2Kg: ecoTotalCo2,
    co2PreventedKg: Number(Math.max(0, 3.8 - ecoTotalCo2).toFixed(2)),
    delayAvoidedMin: 18,
    walkingMeters: ecoWalkMeters,
    safetyRating: isLateNight ? 96 : 94,
    comfortScore: 9.1,
    comfortTags: ['AC Metro', 'Zero Traffic Delay', 'Women First Coach', 'High Seating Probability'],
    safeCorridorCoveragePct: 95,
    safeHavenHubs: [origin.nearestMetro.station, 'Central Police Outpost #12', destination.nearestMetro.station],
    policePatrolZone: 'Bengaluru Metro Safe-Transit Beat Alpha & Pink Hoysala Sector 4',
    legs: ecoLegs,
  };

  // 2. BMTC ORDINARY BUS (Shakti Scheme Eligible for Women)
  const ordBusDist = roadDistKm;
  const ordBusDuration = Math.max(
    16,
    Math.round(((ordBusDist / (20 * effectiveSpeedMult)) * 60) + dep.busWaitMin)
  );
  const ordBusFare = bmtcFare(ordBusDist, false, isWomen);
  const ordBusCo2 = Number((ordBusDist * 0.042).toFixed(2));

  const bmtcOrdinaryItinerary: Itinerary = {
    id: 'bmtc-ordinary',
    category: 'bmtc_ordinary',
    title: isWomen ? 'BMTC Ordinary Bus (₹0 Karnataka Shakti Scheme)' : 'BMTC Ordinary Bus (Budget)',
    subtitle: `Direct bus via Route ${origin.busProfile.primaryRoutes[0] || '500-D'}`,
    recommended: false,
    shaktiEligible: isWomen,
    totalDurationMin: ordBusDuration,
    totalDistanceKm: ordBusDist,
    totalFareInr: ordBusFare,
    totalCo2Kg: ordBusCo2,
    co2PreventedKg: Number(Math.max(0, 3.2 - ordBusCo2).toFixed(2)),
    delayAvoidedMin: 6,
    walkingMeters: 450,
    safetyRating: isWomen ? 86 : 82,
    comfortScore: 6.0,
    comfortTags: [isWomen ? 'Shakti Scheme Free (₹0)' : 'Budget Fare', 'Non-AC', 'Crowded Peak Hours'],
    safeCorridorCoveragePct: 82,
    safeHavenHubs: [`${origin.name} Bus Terminal`, 'Traffic Police Outpost'],
    policePatrolZone: 'City Transit Patrol Sector B',
    legs: [
      {
        id: 'ord-walk-1',
        mode: 'walk',
        modeLabel: 'Walk to Bus Stop',
        lineOrRoute: 'Footpath',
        from: origin.name,
        to: `${origin.name} Bus Stop`,
        durationMin: 5,
        distanceKm: 0.35,
        fareInr: 0,
        co2Kg: 0,
        notes: 'Walk to main road bus shelter.',
      },
      {
        id: 'ord-bus-1',
        mode: 'bmtc_ordinary',
        modeLabel: isWomen ? 'BMTC Ordinary Bus (Shakti Free)' : 'BMTC Ordinary Bus',
        lineOrRoute: `Route ${origin.busProfile.primaryRoutes[0] || '500-D'}`,
        from: `${origin.name} Bus Stop`,
        to: `${destination.name} Stop`,
        durationMin: ordBusDuration - 7,
        distanceKm: ordBusDist,
        fareInr: ordBusFare,
        co2Kg: ordBusCo2,
        notes: isWomen
          ? 'Karnataka Shakti Scheme Eligible: Free travel for women commuters on ordinary non-AC buses.'
          : 'Budget non-AC city bus service.',
      },
      {
        id: 'ord-walk-2',
        mode: 'walk',
        modeLabel: 'Final Walk',
        lineOrRoute: 'Pedestrian',
        from: `${destination.name} Stop`,
        to: destination.name,
        durationMin: 2,
        distanceKm: 0.15,
        fareInr: 0,
        co2Kg: 0,
        notes: 'Final walk to destination.',
      },
    ],
  };

  // 3. BMTC VAJRA AC VOLVO
  const vajraDuration = Math.max(
    14,
    Math.round(((roadDistKm / (24 * effectiveSpeedMult)) * 60) + 5)
  );
  const vajraFare = bmtcFare(roadDistKm, true, isWomen);
  const vajraCo2 = Number((roadDistKm * 0.036).toFixed(2));

  const bmtcVajraItinerary: Itinerary = {
    id: 'bmtc-vajra',
    category: 'bmtc_vajra',
    title: 'BMTC Vajra AC Volvo Bus',
    subtitle: `Air-conditioned express via Route ${origin.busProfile.primaryRoutes.find(r => r.startsWith('V-') || r.startsWith('KIA-')) || 'V-500D'}`,
    recommended: false,
    totalDurationMin: vajraDuration,
    totalDistanceKm: roadDistKm,
    totalFareInr: vajraFare,
    totalCo2Kg: vajraCo2,
    co2PreventedKg: Number(Math.max(0, 3.5 - vajraCo2).toFixed(2)),
    delayAvoidedMin: 10,
    walkingMeters: 380,
    safetyRating: 88,
    comfortScore: 7.8,
    comfortTags: ['AC Volvo', 'GPS Panic Button', 'Dedicated Bus Lane'],
    safeCorridorCoveragePct: 88,
    safeHavenHubs: ['BMTC Major Interchange Hub', 'Police Outpost'],
    policePatrolZone: 'Express Bus Corridor Sector 3',
    legs: [
      {
        id: 'vajra-leg-1',
        mode: 'bmtc_vajra',
        modeLabel: 'BMTC Vajra AC Volvo',
        lineOrRoute: 'V-500D Express',
        from: origin.name,
        to: destination.name,
        durationMin: vajraDuration,
        distanceKm: roadDistKm,
        fareInr: vajraFare,
        co2Kg: vajraCo2,
        notes: 'Air-conditioned comfort with GPS-tracked security and conductor oversight.',
      },
    ],
  };

  // 4. MEMU SUBURBAN TRAIN
  const rFirstDist = origin.nearestRail.distanceKm;
  const rLastDist = destination.nearestRail.distanceKm;
  const railHaul = Number(Math.max(4.0, roadDistKm - 3.5).toFixed(1));
  const railDuration = Math.max(12, Math.round((railHaul / 42) * 60 + 10));
  const railFare = memuFare(railHaul);
  const railCo2 = Number((railHaul * 0.011).toFixed(2));

  const railItinerary: Itinerary = {
    id: 'rail-express',
    category: 'rail_express',
    title: 'Suburban MEMU Commuter Rail',
    subtitle: `${origin.nearestRail.station} ↔ ${destination.nearestRail.station} Suburban Rail`,
    recommended: false,
    totalDurationMin: railDuration,
    totalDistanceKm: roadDistKm,
    totalFareInr: railFare + 20,
    totalCo2Kg: railCo2,
    co2PreventedKg: Number(Math.max(0, 4.1 - railCo2).toFixed(2)),
    delayAvoidedMin: 22,
    walkingMeters: 520,
    safetyRating: 87,
    comfortScore: 7.4,
    comfortTags: ['Bypasses Traffic Jams', 'Spacious Seating', 'Railway Protection Force'],
    safeCorridorCoveragePct: 85,
    safeHavenHubs: [`${origin.nearestRail.station} Railway Station`, `${destination.nearestRail.station} Station RPF Booth`],
    policePatrolZone: 'Suburban Railway Protection Division',
    legs: [
      {
        id: 'rail-m-1',
        mode: 'memu_rail',
        modeLabel: 'Suburban MEMU Commuter Rail',
        lineOrRoute: `${origin.nearestRail.corridor} Line`,
        from: `${origin.nearestRail.station} Station`,
        to: `${destination.nearestRail.station} Station`,
        durationMin: railDuration,
        distanceKm: railHaul,
        fareInr: railFare,
        co2Kg: railCo2,
        notes: 'High-speed electric commuter train bypassing all road gridlock.',
      },
    ],
  };

  // 5. NAMMA YATRI / E-AUTO
  const autoDuration = Math.max(
    15,
    Math.round(((roadDistKm / (26 * effectiveSpeedMult)) * 60) + 3)
  );
  const autoFare = Math.max(45, Math.round(35 + roadDistKm * 18));
  const autoCo2 = Number((roadDistKm * 0.052).toFixed(2));

  const eAutoItinerary: Itinerary = {
    id: 'e-auto',
    category: 'e_auto',
    title: 'Namma Yatri / Verified E-Auto',
    subtitle: 'Door-to-door electric auto with live GPS sharing',
    recommended: false,
    totalDurationMin: autoDuration,
    totalDistanceKm: roadDistKm,
    totalFareInr: autoFare,
    totalCo2Kg: autoCo2,
    co2PreventedKg: Number(Math.max(0, 2.1 - autoCo2).toFixed(2)),
    delayAvoidedMin: 8,
    walkingMeters: 40,
    safetyRating: isLateNight ? 85 : 84,
    comfortScore: 6.8,
    comfortTags: ['Door-to-Door', 'Verified Driver Badge', 'Live Trip Share Ready'],
    safeCorridorCoveragePct: 83,
    safeHavenHubs: ['Local E-Auto Union Booth', 'Police Station Route Enroute'],
    policePatrolZone: 'Verified E-Auto Fleet Zone',
    legs: [
      {
        id: 'auto-1',
        mode: 'e_auto',
        modeLabel: 'Namma Yatri E-Auto',
        lineOrRoute: 'Direct E-Auto Route',
        from: origin.name,
        to: destination.name,
        durationMin: autoDuration,
        distanceKm: roadDistKm,
        fareInr: autoFare,
        co2Kg: autoCo2,
        notes: 'Zero-direct-emission electric auto with live tracking and emergency SOS integration.',
      },
    ],
  };

  // 6. BIKE TAXI
  const bikeDuration = Math.max(
    11,
    Math.round(((roadDistKm / (31 * effectiveSpeedMult)) * 60) + 2)
  );
  const bikeFare = Math.max(35, Math.round(25 + roadDistKm * 11));
  const bikeCo2 = Number((roadDistKm * 0.048).toFixed(2));

  const bikeItinerary: Itinerary = {
    id: 'bike-taxi',
    category: 'bike_taxi',
    title: 'Rapido / Uber Moto Bike Taxi',
    subtitle: 'Fastest maneuverability through narrow lane shortcuts',
    recommended: false,
    wetWeatherPenaltyApplied: hasAnyRain,
    wetWeatherPenaltyNote: hasAnyRain
      ? 'Wet-weather exposure & braking penalty: open two-wheeler unsuited for heavy rain.'
      : undefined,
    totalDurationMin: bikeDuration,
    totalDistanceKm: roadDistKm,
    totalFareInr: bikeFare,
    totalCo2Kg: bikeCo2,
    co2PreventedKg: Number(Math.max(0, 2.4 - bikeCo2).toFixed(2)),
    delayAvoidedMin: 14,
    walkingMeters: 20,
    safetyRating: isLateNight ? 52 : 72, // Significantly lower at night for women commuters
    comfortScore: 5.2,
    comfortTags: ['Fastest Lane Weaving', 'Helmet Provided', 'Open Air'],
    safeCorridorCoveragePct: 70,
    safeHavenHubs: ['Arterial Junction Checkpoint'],
    policePatrolZone: 'Micro-Mobility Commute Sector',
    legs: [
      {
        id: 'bike-1',
        mode: 'bike_taxi',
        modeLabel: 'Bike Taxi',
        lineOrRoute: 'Two-Wheeler Shortcut Corridor',
        from: origin.name,
        to: destination.name,
        durationMin: bikeDuration,
        distanceKm: roadDistKm,
        fareInr: bikeFare,
        co2Kg: bikeCo2,
        wetWeatherPenalty: hasAnyRain,
        notes: isLateNight ? 'Caution: Lower recommended safety rating for women commuters at late night.' : 'Fastest point-to-point journey.',
      },
    ],
  };

  // 7. CAB / SHARED CAB
  const cabDuration = Math.max(
    14,
    Math.round(((roadDistKm / (22 * effectiveSpeedMult)) * 60) + 5)
  );
  const cabFare = Math.round(80 + roadDistKm * 25);
  const cabCo2 = Number((roadDistKm * 0.185).toFixed(2));

  const cabItinerary: Itinerary = {
    id: 'cab-share',
    category: 'cab_share',
    title: 'Ola / Uber / Shared Cab',
    subtitle: 'AC door-to-door cab with live safety tracking & SOS',
    recommended: false,
    totalDurationMin: cabDuration,
    totalDistanceKm: roadDistKm,
    totalFareInr: cabFare,
    totalCo2Kg: cabCo2,
    co2PreventedKg: 0,
    delayAvoidedMin: 4,
    walkingMeters: 30,
    safetyRating: isLateNight ? 84 : 88,
    comfortScore: 8.5,
    comfortTags: ['AC Comfort', 'Live SOS Button', 'Door-to-Door'],
    safeCorridorCoveragePct: 86,
    safeHavenHubs: ['Major Tech Park / Mall Gate', 'Police Station'],
    policePatrolZone: 'Arterial Fleet Patrol Zone',
    legs: [
      {
        id: 'cab-1',
        mode: 'cab_share',
        modeLabel: 'AC Cab Share / Private Cab',
        lineOrRoute: 'Arterial Highway Route',
        from: origin.name,
        to: destination.name,
        durationMin: cabDuration,
        distanceKm: roadDistKm,
        fareInr: cabFare,
        co2Kg: cabCo2,
        notes: 'AC vehicle with verified driver background check and live trip sharing.',
      },
    ],
  };

  const all: Itinerary[] = [
    ecoItinerary,
    bmtcOrdinaryItinerary,
    bmtcVajraItinerary,
    railItinerary,
    eAutoItinerary,
    bikeItinerary,
    cabItinerary,
  ];

  // Set recommendation according to priority
  let best = ecoItinerary;
  let reason = 'Balanced multi-modal eco-transit chain with highest safety and reliability.';

  if (priority === 'safest_women' || isWomen || isLateNight) {
    best = all.reduce((prev, curr) =>
      curr.safetyRating > prev.safetyRating ? curr : prev
    );
    reason = `Safest Route for Women Commuters: ${best.title} features CCTV coverage, security staff, and ${best.safeCorridorCoveragePct}% safe-corridor rating.`;
  } else if (priority === 'lowest_co2') {
    best = all.reduce((prev, curr) => (curr.totalCo2Kg < prev.totalCo2Kg ? curr : prev));
    reason = `Lowest tailpipe carbon footprint (${best.totalCo2Kg} kg CO₂).`;
  } else if (priority === 'fastest') {
    best = all.reduce((prev, curr) => (curr.totalDurationMin < prev.totalDurationMin ? curr : prev));
    reason = `Fastest door-to-door arrival (${best.totalDurationMin} mins).`;
  } else if (priority === 'lowest_fare') {
    best = all.reduce((prev, curr) => (curr.totalFareInr < prev.totalFareInr ? curr : prev));
    reason = isWomen && best.shaktiEligible ? 'Free travel under Karnataka Shakti Scheme (₹0).' : `Lowest fare at ₹${best.totalFareInr}.`;
  } else if (priority === 'minimal_walking') {
    best = all.reduce((prev, curr) => (curr.walkingMeters < prev.walkingMeters ? curr : prev));
    reason = `Minimal walking distance (~${best.walkingMeters}m).`;
  }

  best.recommended = true;
  best.recommendedReason = reason;

  // Sorting
  const sorted = [...all].sort((a, b) => {
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    if (priority === 'safest_women' || isWomen || isLateNight) {
      return b.safetyRating - a.safetyRating;
    }
    if (priority === 'fastest') return a.totalDurationMin - b.totalDurationMin;
    if (priority === 'lowest_fare') return a.totalFareInr - b.totalFareInr;
    if (priority === 'minimal_walking') return a.walkingMeters - b.walkingMeters;
    return a.totalCo2Kg - b.totalCo2Kg;
  });

  return sorted;
}

function useVajraFlag(routeCode: string): boolean {
  return routeCode.startsWith('V-') || routeCode.startsWith('KIA-');
}
