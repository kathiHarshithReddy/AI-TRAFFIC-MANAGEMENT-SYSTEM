export type AppView =
  | 'dashboard'
  | 'signals'
  | 'planner'
  | 'safety'
  | 'escape'
  | 'weather'
  | 'analytics'
  | 'corridor';

export type BengaluruZone =
  | 'South Bengaluru'
  | 'North Bengaluru'
  | 'East Bengaluru'
  | 'West Bengaluru'
  | 'IT Hubs'
  | 'Central Bengaluru'
  | 'Outskirts';

export type MetroLine = 'Purple' | 'Green' | 'Yellow' | 'Pink';

export interface Locality {
  id: string;
  name: string;
  zone: BengaluruZone;
  lat: number;
  lng: number;
  congestionIndex: number; // 0.30 (outskirts) to 0.96 (chokepoints like Silk Board/KR Puram)
  nearestMetro: {
    station: string;
    line: MetroLine;
    distanceKm: number;
    interchangeWith?: MetroLine[];
  };
  nearestRail: {
    station: string;
    distanceKm: number;
    corridor: string;
  };
  busProfile: {
    primaryRoutes: string[];
    vayuVajraAvailable: boolean;
    feederRoutes: string[];
  };
  aliases?: string[];
}

export type SignalMode = 'static' | 'adaptive';

export type TrafficScenario =
  | 'off_peak'
  | 'morning_rush'
  | 'evening_gridlock'
  | 'emergency_green_wave';

export type SignalPhase = 'GREEN' | 'YELLOW' | 'RED';

export interface BaseIntersection {
  id: string;
  name: string;
  landmark: string;
  baseDensityPct: number;
  baseQueueMeters: number;
  staticGreenSec: number;
  staticRedSec: number;
  lanes: number;
  hasMetroCross: boolean;
  busPriorityScore: number;
}

export interface Corridor {
  id: string;
  name: string;
  shortName: string;
  zoneFocus: string;
  lengthKm: number;
  avgSpeedStaticKmh: number;
  avgSpeedAdaptiveKmh: number;
  intersections: BaseIntersection[];
}

export interface SimulatedIntersection extends BaseIntersection {
  densityPct: number;
  queueMeters: number;
  currentPhase: SignalPhase;
  countdownSec: number;
  assignedGreenSec: number;
  assignedRedSec: number;
  yellowSec: number;
  yellowBufferAddedSec: number;
  roadFrictionCoeff: number;
  dischargeRatePct: number;
  waterloggingProne: boolean;
  avgWaitSec: number;
  waitReductionPct: number;
  aiActionNote: string;
}

export interface AIReasoningEntry {
  id: string;
  timestamp: string;
  junctionName: string;
  action: string;
  impact: string;
  severity: 'nominal' | 'warning' | 'critical' | 'priority';
}

export type TravelerProfile = 'standard' | 'women_commuter';
export type TimeOfDay = 'daytime' | 'evening_rush' | 'late_night';

export type RoutePriority =
  | 'lowest_co2'
  | 'fastest'
  | 'lowest_fare'
  | 'minimal_walking'
  | 'safest_women';

export type DepartureWindow =
  | 'now_peak'
  | 'morning_0830'
  | 'midday_1300'
  | 'evening_1830'
  | 'late_2200';

export type TransitModeType =
  | 'solo_car'
  | 'ev_car'
  | 'two_wheeler'
  | 'bmtc_vajra'
  | 'bmtc_ordinary'
  | 'bmtc_feeder'
  | 'namma_metro'
  | 'memu_rail'
  | 'yulu_ev'
  | 'e_auto'
  | 'auto_rickshaw'
  | 'bike_taxi'
  | 'cab_share'
  | 'walk';

export interface RouteLeg {
  id: string;
  mode: TransitModeType;
  modeLabel: string;
  lineOrRoute: string;
  metroLine?: MetroLine;
  from: string;
  to: string;
  durationMin: number;
  distanceKm: number;
  fareInr: number;
  co2Kg: number;
  notes: string;
  weatherAdapted?: boolean;
  wetWeatherPenalty?: boolean;
}

export interface Itinerary {
  id: string;
  category:
    | 'car_baseline'
    | 'bmtc_direct'
    | 'eco_hybrid'
    | 'rail_express'
    | 'bmtc_ordinary'
    | 'bmtc_vajra'
    | 'namma_metro'
    | 'memu_rail'
    | 'e_auto'
    | 'bike_taxi'
    | 'cab_share';
  title: string;
  subtitle: string;
  recommended: boolean;
  recommendedReason?: string;
  weatherAdapted?: boolean;
  weatherAdaptationBadge?: string;
  wetWeatherPenaltyApplied?: boolean;
  wetWeatherPenaltyNote?: string;
  totalDurationMin: number;
  totalDistanceKm: number;
  totalFareInr: number;
  totalCo2Kg: number;
  co2PreventedKg: number;
  delayAvoidedMin: number;
  walkingMeters: number;
  safetyRating: number; // 0-100
  comfortScore: number; // 1-10
  comfortTags: string[];
  shaktiEligible?: boolean;
  safeCorridorCoveragePct: number;
  safeHavenHubs: string[];
  policePatrolZone: string;
  legs: RouteLeg[];
}

export interface ZoneDelayDatum {
  zone: string;
  shortZone: string;
  staticDelayMin: number;
  adaptiveDelayMin: number;
  reductionPct: number;
}

export interface ModeEmissionDatum {
  mode: string;
  shortMode: string;
  co2PerKmGrams: number;
  tripCo2Kg: number;
  fareEstimateInr: number;
  category: 'private' | 'shared' | 'public' | 'zero';
}

export type WeatherCondition =
  | 'clear'
  | 'light_rain'
  | 'heavy_rain'
  | 'morning_fog'
  | 'extreme_heat';

export type MicroWeatherCondition =
  | 'clear_pleasant'
  | 'light_drizzle'
  | 'heavy_downpour'
  | 'morning_fog'
  | 'high_heat_uv';

export interface LocalityMicroWeather {
  localityId: string;
  condition: MicroWeatherCondition;
  label: string;
  temperatureC: number;
  rainProbabilityPct: number;
  precipitationMmHr: number;
  roadGripFactor: number;
  waterloggingRisk: boolean;
  uvIndex: number;
}

export interface WeatherTelemetry {
  source: 'live' | 'simulated' | 'fallback';
  condition: WeatherCondition;
  temperatureC: number;
  apparentTempC: number;
  humidityPct: number;
  precipitationMm: number;
  windKmh: number;
  weatherLabel: string;
  updatedAt: string;
}

export interface WeatherTrafficImpact {
  condition: WeatherCondition;
  label: string;
  speedMultiplier: number;
  densityDeltaPct: number;
  queueMultiplier: number;
  roadFrictionCoeff: number;
  yellowSafetyBufferSec: number;
  transitAdvantageNote: string;
}

export type TrafficAlertCategory =
  | 'bottleneck'
  | 'roadwork'
  | 'waterlogging'
  | 'metro_work'
  | 'emergency_clearance';

export type TrafficAlertSeverity = 'critical' | 'high' | 'moderate';

export interface TrafficAlertIncident {
  id: string;
  corridorId: string;
  junctionName: string;
  category: TrafficAlertCategory;
  categoryLabel: string;
  severity: TrafficAlertSeverity;
  headline: string;
  details: string;
  laneImpact: string;
  estDelayMin: number;
  aiMitigationNote: string;
  reportedAgo: string;
}

export type SosCallMode = 'demo' | 'live';

export interface PoliceStation {
  id: string;
  name: string;
  division: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  isWomenStation?: boolean;
}

export interface NearestPoliceResult {
  station: PoliceStation;
  distanceKm: number;
  usedGps: boolean;
  coords: { lat: number; lng: number };
}

export type EmergencyVehicleType = 'ambulance' | 'fire_engine' | 'police';

export type EmergencyStatus =
  | 'dispatched'
  | 'en_route_priority'
  | 'rerouting_obstacle'
  | 'arriving';

export interface EmergencyDestinationHub {
  id: string;
  name: string;
  type: 'hospital' | 'fire_command' | 'police_hq';
  localityName: string;
  lat: number;
  lng: number;
  address: string;
}

export interface CorridorSignalNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  routeFraction: number; // 0 to 1 along route
  defaultPhase: SignalPhase;
  currentPhase: SignalPhase;
  preClearedForEmergency: boolean;
  distanceFromVehicleKm: number;
  waitSavedSec: number;
}

export interface RouteWaypoint {
  name: string;
  lat: number;
  lng: number;
}

export interface GreenCorridorVehicle {
  id: string;
  callSign: string;
  type: EmergencyVehicleType;
  priorityLevel: 'Code 1 Critical' | 'Code 2 Urgent';
  originName: string;
  originLat: number;
  originLng: number;
  destination: EmergencyDestinationHub;
  progressPct: number; // 0 to 100
  speedKmh: number;
  roadblockActive: boolean;
  status: EmergencyStatus;
  baselineEtaMin: number;
  optimizedEtaMin: number;
  timeSavedMin: number;
  congestionScorePct: number;
  primaryRoute: RouteWaypoint[];
  alternateRoute: RouteWaypoint[];
  signals: CorridorSignalNode[];
}

export interface GiveWayAlert {
  id: string;
  vehicleCallSign: string;
  vehicleType: EmergencyVehicleType;
  junctionName: string;
  distanceAheadKm: number;
  etaSec: number;
  instruction: string;
}

export type BottleneckId =
  | 'silk_board'
  | 'marathahalli'
  | 'bellandur_orr'
  | 'hebbal_flyover'
  | 'kr_puram'
  | 'panathur_underpass';

export type SideStreetVerdict =
  | 'verified_bypass'
  | 'two_wheeler_only'
  | 'dead_end';

export type VehicleSuitability =
  | 'car_auto_2w'
  | 'two_wheeler_only'
  | 'two_wheeler_capped'
  | 'not_passable';

export interface SideStreetCandidate {
  id: string;
  name: string;
  verdict: SideStreetVerdict;
  rejoinDistanceKm: number;
  rejoinLandmark: string;
  timeSavedMin: number;
  roadWidthMeters: number;
  suitability: VehicleSuitability;
  turnCue: string;
  warningNote: string;
  waypoints: string[];
  wellLit: boolean;
  policePatrolled: boolean;
  floodProne: boolean;
  isResidentialSpilloverProne: boolean;
  residentialBlockName?: string;
  schematicLaneOffset: -1 | 1 | 2;
}

export interface BottleneckCorridor {
  id: BottleneckId;
  name: string;
  corridorId: string;
  blockedRoadName: string;
  lat: number;
  lng: number;
  avgGridlockDelayMin: number;
  defaultSideStreetSaturationPct: number;
  candidates: SideStreetCandidate[];
}

export interface SideStreetScanInput {
  bottleneckId: BottleneckId;
  destinationName: string;
  gpsCoords?: { lat: number; lng: number } | null;
  sideStreetSaturationPct: number;
  womenSafetyMode: boolean;
  timeOfDay: TimeOfDay;
  weatherCondition: WeatherCondition;
}

export type SideStreetFilterReason =
  | 'unlit_night_women'
  | 'waterlogged_monsoon';

export interface EvaluatedSideStreet extends SideStreetCandidate {
  effectiveSuitability: VehicleSuitability;
  carDiversionCapped: boolean;
  filteredOut: boolean;
  filterReasons: SideStreetFilterReason[];
  googleMapsUrl: string | null;
}

export interface SideStreetScanResult {
  bottleneck: BottleneckCorridor;
  originLabel: string;
  usedGps: boolean;
  spilloverCapActive: boolean;
  safetyFilterActive: boolean;
  monsoonFilterActive: boolean;
  activeCandidates: EvaluatedSideStreet[];
  filteredCandidates: EvaluatedSideStreet[];
}

