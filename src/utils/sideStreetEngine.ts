import {
  BottleneckCorridor,
  BottleneckId,
  EvaluatedSideStreet,
  Locality,
  SideStreetFilterReason,
  SideStreetScanInput,
  SideStreetScanResult,
  VehicleSuitability,
} from '../types/traffic';
import { buildGoogleMapsDirectionsUrl } from './googleMapsNav';
import { haversineKm } from './routingEngine';

export const BENGALURU_BOTTLENECKS: BottleneckCorridor[] = [
  {
    id: 'silk_board',
    name: 'Silk Board Junction',
    corridorId: 'orr-east',
    blockedRoadName: 'Hosur Rd & Central Silk Board Flyover Loop',
    lat: 12.9177,
    lng: 77.6238,
    avgGridlockDelayMin: 26,
    defaultSideStreetSaturationPct: 58,
    candidates: [
      {
        id: 'sb-btm-hsr-cut',
        name: '29th Main BTM Cross → HSR Sector 6 Service Cut',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 1.6,
        rejoinLandmark: 'HSR Sector 6 ORR Junction',
        timeSavedMin: 16,
        roadWidthMeters: 7.5,
        suitability: 'car_auto_2w',
        turnCue:
          'Take 29th Main BTM Cross → Join 17th Cross HSR Sector 6 → Rejoins ORR 1.6 km ahead past Silk Board Ramp',
        warningNote: '',
        waypoints: ['29th Main BTM 2nd Stage', '17th Cross HSR Layout Sector 6'],
        wellLit: true,
        policePatrolled: true,
        floodProne: false,
        isResidentialSpilloverProne: true,
        residentialBlockName: 'BTM 2nd Stage & HSR Inner Blocks',
        schematicLaneOffset: -1,
      },
      {
        id: 'sb-madiwala-loop',
        name: 'Madiwala Checkpost Service Cut → Roopena Agrahara',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 1.4,
        rejoinLandmark: 'Bommanahalli Hosur Rd Ramp',
        timeSavedMin: 12,
        roadWidthMeters: 8.5,
        suitability: 'car_auto_2w',
        turnCue:
          'Take Madiwala Service Lane → Roopena Agrahara Outer Link → Rejoins Hosur Rd 1.4 km ahead',
        warningNote: '',
        waypoints: ['Madiwala Checkpost', 'Roopena Agrahara'],
        wellLit: true,
        policePatrolled: true,
        floodProne: false,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: 1,
      },
      {
        id: 'sb-gangothri-lane',
        name: 'Gangothri Circle Inner Cross (BTM 1st Stage)',
        verdict: 'two_wheeler_only',
        rejoinDistanceKm: 0.9,
        rejoinLandmark: 'BTM Water Tank Rd',
        timeSavedMin: 11,
        roadWidthMeters: 3.5,
        suitability: 'two_wheeler_only',
        turnCue:
          'Narrow BTM 1st Stage Cross Lane → Exits near BTM Water Tank 0.9 km ahead',
        warningNote:
          '3.5m residential lane — Two-Wheelers & Yulu only; SUV/Car risk of getting trapped',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: true,
        residentialBlockName: 'BTM 1st Stage',
        schematicLaneOffset: 2,
      },
      {
        id: 'sb-lake-culdesac',
        name: 'Silk Board Lake Bund Cul-de-sac (Behind Depot)',
        verdict: 'dead_end',
        rejoinDistanceKm: 0,
        rejoinLandmark: 'Barricaded Drain Boundary',
        timeSavedMin: 0,
        roadWidthMeters: 3.0,
        suitability: 'not_passable',
        turnCue: 'Dead-end approach beside Madiwala Tank Bund',
        warningNote: 'Cul-de-sac / Lake Bund Barricade Blocked — Do NOT turn here',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: 2,
      },
    ],
  },
  {
    id: 'marathahalli',
    name: 'Marathahalli Bridge',
    corridorId: 'orr-east',
    blockedRoadName: 'ORR Marathahalli Bridge & Flyover Loop',
    lat: 12.9569,
    lng: 77.7011,
    avgGridlockDelayMin: 24,
    defaultSideStreetSaturationPct: 52,
    candidates: [
      {
        id: 'mr-14th-main',
        name: '14th Main Cross → Spice Garden ORR Link',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 1.8,
        rejoinLandmark: 'Karthik Nagar ORR',
        timeSavedMin: 14,
        roadWidthMeters: 7.2,
        suitability: 'car_auto_2w',
        turnCue:
          'Take 14th Main Cross → Rejoins ORR 1.8 km ahead past Marathahalli Bridge',
        warningNote: '',
        waypoints: ['14th Main Cross Marathahalli', 'Spice Garden Outer Ring Road'],
        wellLit: true,
        policePatrolled: true,
        floodProne: false,
        isResidentialSpilloverProne: true,
        residentialBlockName: 'Aswath Nagar & Marathahalli Inner Blocks',
        schematicLaneOffset: -1,
      },
      {
        id: 'mr-hal-kundalahalli',
        name: 'HAL Old Airport Service Rd → Kundalahalli Gate',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 2.2,
        rejoinLandmark: 'Doddanekundi ORR Junction',
        timeSavedMin: 11,
        roadWidthMeters: 9.0,
        suitability: 'car_auto_2w',
        turnCue:
          'Exit at HAL Heritage Service Ramp → Kundalahalli Gate Parallel → Rejoins ORR 2.2 km ahead',
        warningNote: '',
        waypoints: ['HAL Old Airport Road Marathahalli', 'Kundalahalli Gate'],
        wellLit: true,
        policePatrolled: true,
        floodProne: false,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: 1,
      },
      {
        id: 'mr-sanjay-4th-lane',
        name: 'Sanjay Nagar Cross 4th Lane',
        verdict: 'two_wheeler_only',
        rejoinDistanceKm: 1.1,
        rejoinLandmark: 'Marathahalli Multiplex Back Gate',
        timeSavedMin: 10,
        roadWidthMeters: 3.5,
        suitability: 'two_wheeler_only',
        turnCue: 'Tight residential cut behind Kalamandir → Exits past Bridge',
        warningNote:
          '3.5m residential lane — Two-Wheelers & Yulu only; SUV/Car risk of getting trapped',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: false,
        isResidentialSpilloverProne: true,
        residentialBlockName: 'Sanjay Nagar',
        schematicLaneOffset: 2,
      },
      {
        id: 'mr-munnekolala-deadend',
        name: 'Munnekolala Drain Cul-de-sac',
        verdict: 'dead_end',
        rejoinDistanceKm: 0,
        rejoinLandmark: 'Stormwater Drain End',
        timeSavedMin: 0,
        roadWidthMeters: 2.8,
        suitability: 'not_passable',
        turnCue: 'Unpaved feeder dead-ending at Munnekolala Rajakaluve',
        warningNote: 'Cul-de-sac / Stormwater Drain Dead End — Do NOT turn here',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: 2,
      },
    ],
  },
  {
    id: 'bellandur_orr',
    name: 'Bellandur ORR',
    corridorId: 'orr-east',
    blockedRoadName: 'ORR Bellandur Ecospace Main Carriageway',
    lat: 12.9279,
    lng: 77.6762,
    avgGridlockDelayMin: 22,
    defaultSideStreetSaturationPct: 56,
    candidates: [
      {
        id: 'bl-green-glen-spine',
        name: 'Green Glen Layout Spine → Ecospace Rear Cut',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 1.7,
        rejoinLandmark: 'Iblur Gate ORR',
        timeSavedMin: 15,
        roadWidthMeters: 8.0,
        suitability: 'car_auto_2w',
        turnCue:
          'Take Green Glen Layout Main Spine → Rejoins ORR 1.7 km ahead past Bellandur Flyover',
        warningNote: '',
        waypoints: ['Green Glen Layout Bellandur', 'Iblur Gate'],
        wellLit: true,
        policePatrolled: true,
        floodProne: false,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: -1,
      },
      {
        id: 'bl-kodi-tank-bund',
        name: 'Bellandur Kodi Tank Bund Link → Sakra Cut',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 1.5,
        rejoinLandmark: 'Devarabeesanahalli ORR',
        timeSavedMin: 13,
        roadWidthMeters: 6.2,
        suitability: 'car_auto_2w',
        turnCue:
          'Take Bellandur Kodi Tank Bund Rd → Rejoins ORR 1.5 km ahead near Sakra Hospital',
        warningNote: '',
        waypoints: ['Bellandur Lake Road', 'Sakra World Hospital'],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: true,
        residentialBlockName: 'Bellandur Inner Layout',
        schematicLaneOffset: 1,
      },
      {
        id: 'bl-yemalur-3rd-cross',
        name: 'Yemalur 3rd Cross Colony Cut',
        verdict: 'two_wheeler_only',
        rejoinDistanceKm: 1.0,
        rejoinLandmark: 'Bellandur Gate Service Rd',
        timeSavedMin: 9,
        roadWidthMeters: 3.5,
        suitability: 'two_wheeler_only',
        turnCue: 'Narrow colony alley beside Old Post Office → Exits to Service Rd',
        warningNote:
          '3.5m residential lane — Two-Wheelers & Yulu only; SUV/Car risk of getting trapped',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: true,
        schematicLaneOffset: 2,
      },
      {
        id: 'bl-lake-marsh-gate',
        name: 'Bellandur Lake Marsh No-Outlet Gate',
        verdict: 'dead_end',
        rejoinDistanceKm: 0,
        rejoinLandmark: 'Closed Lake Perimeter Gate',
        timeSavedMin: 0,
        roadWidthMeters: 3.2,
        suitability: 'not_passable',
        turnCue: 'Terminates at fenced Bellandur Lake marsh gate',
        warningNote: 'Cul-de-sac / Lake Gate Blocked — Do NOT turn here',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: 2,
      },
    ],
  },
  {
    id: 'hebbal_flyover',
    name: 'Hebbal Flyover',
    corridorId: 'north-airport',
    blockedRoadName: 'NH-44 Hebbal Flyover Ramp & Bellary Rd Merge',
    lat: 13.0358,
    lng: 77.597,
    avgGridlockDelayMin: 25,
    defaultSideStreetSaturationPct: 54,
    candidates: [
      {
        id: 'hb-sahakara-60ft',
        name: 'Sahakara Nagar 60ft Parallel → Kodigehalli Loop',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 2.1,
        rejoinLandmark: 'Kodigehalli NH-44 Gate',
        timeSavedMin: 17,
        roadWidthMeters: 9.0,
        suitability: 'car_auto_2w',
        turnCue:
          'Take Esteem Mall Left Exit → Sahakara Nagar 60ft Rd → Rejoins NH-44 2.1 km ahead past Hebbal Ramp',
        warningNote: '',
        waypoints: ['Sahakara Nagar 60 Feet Road', 'Kodigehalli Gate'],
        wellLit: true,
        policePatrolled: true,
        floodProne: false,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: -1,
      },
      {
        id: 'hb-sanjaynagar-80ft',
        name: 'Sanjaynagar 80ft Collector → Lottegollahalli',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 1.4,
        rejoinLandmark: 'BEL Circle ORR',
        timeSavedMin: 12,
        roadWidthMeters: 7.5,
        suitability: 'car_auto_2w',
        turnCue:
          'Take CBI Rd Cut → Sanjaynagar 80ft Collector → Rejoins ORR 1.4 km west of Hebbal Circle',
        warningNote: '',
        waypoints: ['Sanjaynagar 80 Feet Road', 'BEL Circle'],
        wellLit: true,
        policePatrolled: true,
        floodProne: false,
        isResidentialSpilloverProne: true,
        residentialBlockName: 'Sanjaynagar & RMV 2nd Stage',
        schematicLaneOffset: 1,
      },
      {
        id: 'hb-kempapura-2nd-lane',
        name: 'Kempapura Tank Cross 2nd Lane',
        verdict: 'two_wheeler_only',
        rejoinDistanceKm: 0.8,
        rejoinLandmark: 'Coffee Board Park Back Rd',
        timeSavedMin: 10,
        roadWidthMeters: 3.4,
        suitability: 'two_wheeler_only',
        turnCue: 'Narrow tank-side cross lane → Exits near Coffee Board Layout',
        warningNote:
          '3.5m residential lane — Two-Wheelers & Yulu only; SUV/Car risk of getting trapped',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: true,
        schematicLaneOffset: 2,
      },
      {
        id: 'hb-rail-gate-closed',
        name: 'Hebbal Railway Crossing Closed Gate',
        verdict: 'dead_end',
        rejoinDistanceKm: 0,
        rejoinLandmark: 'Closed Level Crossing',
        timeSavedMin: 0,
        roadWidthMeters: 3.5,
        suitability: 'not_passable',
        turnCue: 'Blocked level crossing spur beside Hebbal Yard',
        warningNote: 'Cul-de-sac / Railway Gate Blocked — Do NOT turn here',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: false,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: 2,
      },
    ],
  },
  {
    id: 'kr_puram',
    name: 'K.R. Puram Tin Factory',
    corridorId: 'orr-east',
    blockedRoadName: 'Old Madras Rd & Tin Factory Cable-Stayed Bridge',
    lat: 13.0005,
    lng: 77.6745,
    avgGridlockDelayMin: 28,
    defaultSideStreetSaturationPct: 60,
    candidates: [
      {
        id: 'kr-kasturi-nagar',
        name: 'Kasturi Nagar 2nd Main → Benniganahalli Metro Cut',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 1.9,
        rejoinLandmark: 'Ramamurthy Nagar ORR',
        timeSavedMin: 16,
        roadWidthMeters: 8.5,
        suitability: 'car_auto_2w',
        turnCue:
          'Take Kasturi Nagar 2nd Main Parallel → Cross under Baiyappanahalli Ramp → Rejoins ORR 1.9 km ahead past Tin Factory',
        warningNote: '',
        waypoints: ['Kasturi Nagar 2nd Main', 'Benniganahalli Metro Station'],
        wellLit: true,
        policePatrolled: true,
        floodProne: false,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: -1,
      },
      {
        id: 'kr-vijinapura-cut',
        name: 'Vijinapura 1st Cross Inner Collector',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 1.3,
        rejoinLandmark: 'ITI Gate Old Madras Rd',
        timeSavedMin: 13,
        roadWidthMeters: 6.0,
        suitability: 'car_auto_2w',
        turnCue:
          'Turn onto Vijinapura 1st Cross → Rejoins Old Madras Rd 1.3 km ahead past Tin Factory Bus Stop',
        warningNote: '',
        waypoints: ['Vijinapura Road KR Puram', 'ITI Gate KR Puram'],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: true,
        residentialBlockName: 'Vijinapura & Dooravani Nagar',
        schematicLaneOffset: 1,
      },
      {
        id: 'kr-udayanagar-lane',
        name: 'Udaya Nagar Railway Parallel Lane',
        verdict: 'two_wheeler_only',
        rejoinDistanceKm: 1.0,
        rejoinLandmark: 'KR Puram Market Back Gate',
        timeSavedMin: 11,
        roadWidthMeters: 3.3,
        suitability: 'two_wheeler_only',
        turnCue: 'Tight track-parallel passage → Exits behind KR Puram Station',
        warningNote:
          '3.5m residential lane — Two-Wheelers & Yulu only; SUV/Car risk of getting trapped',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: false,
        isResidentialSpilloverProne: true,
        schematicLaneOffset: 2,
      },
      {
        id: 'kr-goods-shed-deadend',
        name: 'Tin Factory Goods Shed Dead End',
        verdict: 'dead_end',
        rejoinDistanceKm: 0,
        rejoinLandmark: 'Railway Goods Barrier',
        timeSavedMin: 0,
        roadWidthMeters: 3.0,
        suitability: 'not_passable',
        turnCue: 'Terminates at walled railway siding near Tin Factory',
        warningNote: 'Cul-de-sac / Railway Gate Blocked — Do NOT turn here',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: false,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: 2,
      },
    ],
  },
  {
    id: 'panathur_underpass',
    name: 'Panathur Underpass',
    corridorId: 'orr-east',
    blockedRoadName: 'Panathur Railway S-Cross Underpass & Balagere Bottleneck',
    lat: 12.9369,
    lng: 77.7052,
    avgGridlockDelayMin: 27,
    defaultSideStreetSaturationPct: 62,
    candidates: [
      {
        id: 'pn-balagere-80ft',
        name: 'Balagere 80ft Collector → Varthur Kodi Bypass',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 2.3,
        rejoinLandmark: 'Varthur Kodi Whitefield Link',
        timeSavedMin: 18,
        roadWidthMeters: 8.2,
        suitability: 'car_auto_2w',
        turnCue:
          'Take Balagere 80ft Collector → Varthur Main Spine → Rejoins Marathahalli–Whitefield Link 2.3 km ahead',
        warningNote: '',
        waypoints: ['Balagere Main Road', 'Varthur Kodi'],
        wellLit: true,
        policePatrolled: true,
        floodProne: false,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: -1,
      },
      {
        id: 'pn-kaverappa-drain',
        name: 'Kaverappa Layout Drain Service Cut',
        verdict: 'verified_bypass',
        rejoinDistanceKm: 1.1,
        rejoinLandmark: 'Panathur Post Office Link',
        timeSavedMin: 12,
        roadWidthMeters: 5.8,
        suitability: 'car_auto_2w',
        turnCue:
          'Low-lying drain-side shortcut through Kaverappa Layout → Rejoins Panathur Main 1.1 km East',
        warningNote: '',
        waypoints: ['Kaverappa Layout Panathur', 'Panathur Main Road'],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: true,
        residentialBlockName: 'Kaverappa Layout',
        schematicLaneOffset: 1,
      },
      {
        id: 'pn-kadubeesanahalli-lane',
        name: 'Kadubeesanahalli Narrow Village Cut',
        verdict: 'two_wheeler_only',
        rejoinDistanceKm: 0.9,
        rejoinLandmark: 'Panathur Cross Back Rd',
        timeSavedMin: 10,
        roadWidthMeters: 3.4,
        suitability: 'two_wheeler_only',
        turnCue: 'Old village cross-alley avoiding S-cross curve',
        warningNote:
          '3.5m residential lane — Two-Wheelers & Yulu only; SUV/Car risk of getting trapped',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: true,
        isResidentialSpilloverProne: true,
        schematicLaneOffset: 2,
      },
      {
        id: 'pn-rail-culdesac',
        name: 'Panathur Railway Cul-de-sac Gate',
        verdict: 'dead_end',
        rejoinDistanceKm: 0,
        rejoinLandmark: 'Sealed Track Boundary',
        timeSavedMin: 0,
        roadWidthMeters: 3.1,
        suitability: 'not_passable',
        turnCue: 'Sealed trackside stub before Panathur Railway Bridge',
        warningNote: 'Cul-de-sac / Railway Gate Blocked — Do NOT turn here',
        waypoints: [],
        wellLit: false,
        policePatrolled: false,
        floodProne: false,
        isResidentialSpilloverProne: false,
        schematicLaneOffset: 2,
      },
    ],
  },
];

export function getBottleneckById(id: BottleneckId): BottleneckCorridor {
  return (
    BENGALURU_BOTTLENECKS.find((b) => b.id === id) || BENGALURU_BOTTLENECKS[1]
  );
}

export function findNearestBottleneck(
  lat: number,
  lng: number
): BottleneckCorridor {
  let best = BENGALURU_BOTTLENECKS[0];
  let minDist = Infinity;
  for (const item of BENGALURU_BOTTLENECKS) {
    const dist = haversineKm(lat, lng, item.lat, item.lng);
    if (dist < minDist) {
      minDist = dist;
      best = item;
    }
  }
  return best;
}

export function mapCorridorToBottleneckId(corridorId: string): BottleneckId {
  switch (corridorId) {
    case 'north-airport':
      return 'hebbal_flyover';
    case 'south-tech':
      return 'silk_board';
    case 'orr-east':
    default:
      return 'marathahalli';
  }
}

export function mapLocalityToBottleneckId(locality: Locality): BottleneckId {
  const nameLower = locality.name.toLowerCase();
  if (nameLower.includes('silk board') || nameLower.includes('btm')) {
    return 'silk_board';
  }
  if (nameLower.includes('marathahalli')) {
    return 'marathahalli';
  }
  if (nameLower.includes('bellandur')) {
    return 'bellandur_orr';
  }
  if (nameLower.includes('hebbal')) {
    return 'hebbal_flyover';
  }
  if (nameLower.includes('k.r. puram') || nameLower.includes('kr puram')) {
    return 'kr_puram';
  }
  if (nameLower.includes('panathur') || nameLower.includes('balagere')) {
    return 'panathur_underpass';
  }
  return findNearestBottleneck(locality.lat, locality.lng).id;
}

export function evaluateSideStreetEscape(
  input: SideStreetScanInput
): SideStreetScanResult {
  const bottleneck = input.gpsCoords
    ? findNearestBottleneck(input.gpsCoords.lat, input.gpsCoords.lng)
    : getBottleneckById(input.bottleneckId);

  const usedGps = Boolean(input.gpsCoords);
  const originLabel = input.gpsCoords
    ? `${input.gpsCoords.lat.toFixed(4)}, ${input.gpsCoords.lng.toFixed(4)}`
    : bottleneck.name;

  const spilloverCapActive = input.sideStreetSaturationPct > 70;
  const safetyFilterActive =
    input.womenSafetyMode || input.timeOfDay === 'late_night';
  const monsoonFilterActive =
    input.weatherCondition === 'heavy_rain' ||
    input.weatherCondition === 'light_rain';

  const evaluated: EvaluatedSideStreet[] = bottleneck.candidates.map((cand) => {
    const filterReasons: SideStreetFilterReason[] = [];

    if (
      cand.verdict !== 'dead_end' &&
      safetyFilterActive &&
      (!cand.wellLit || !cand.policePatrolled)
    ) {
      filterReasons.push('unlit_night_women');
    }

    if (
      cand.verdict !== 'dead_end' &&
      input.weatherCondition === 'heavy_rain' &&
      cand.floodProne
    ) {
      filterReasons.push('waterlogged_monsoon');
    }

    const filteredOut = filterReasons.length > 0;
    const carDiversionCapped =
      cand.verdict === 'verified_bypass' &&
      spilloverCapActive &&
      cand.isResidentialSpilloverProne;

    let effectiveSuitability: VehicleSuitability = cand.suitability;
    if (carDiversionCapped) {
      effectiveSuitability = 'two_wheeler_capped';
    }

    const googleMapsUrl =
      cand.verdict === 'verified_bypass' && !filteredOut
        ? buildGoogleMapsDirectionsUrl({
            origin: originLabel,
            destination: input.destinationName,
            travelMode: 'driving',
            waypoints: [...cand.waypoints, cand.rejoinLandmark],
          })
        : null;

    return {
      ...cand,
      effectiveSuitability,
      carDiversionCapped,
      filteredOut,
      filterReasons,
      googleMapsUrl,
    };
  });

  return {
    bottleneck,
    originLabel,
    usedGps,
    spilloverCapActive,
    safetyFilterActive,
    monsoonFilterActive,
    activeCandidates: evaluated.filter((item) => !item.filteredOut),
    filteredCandidates: evaluated.filter((item) => item.filteredOut),
  };
}
