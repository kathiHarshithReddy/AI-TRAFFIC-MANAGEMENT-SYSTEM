import { BENGALURU_POLICE_STATIONS } from '../data/policeStations';
import { Locality, NearestPoliceResult, PoliceStation } from '../types/traffic';
import { haversineKm } from './routingEngine';

export function findNearestPoliceStation(
  lat: number,
  lng: number,
  usedGps = false,
  stations: PoliceStation[] = BENGALURU_POLICE_STATIONS
): NearestPoliceResult {
  let closest = stations[0];
  let minDistance = haversineKmRaw(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < stations.length; i++) {
    const candidate = stations[i];
    const dist = haversineKmRaw(lat, lng, candidate.lat, candidate.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = candidate;
    }
  }

  return {
    station: closest,
    distanceKm: Number(Math.max(0.2, minDistance).toFixed(1)),
    usedGps,
    coords: { lat, lng },
  };
}

export function resolveNearestPoliceForLocalityOrGps(
  gpsCoords: { lat: number; lng: number } | null,
  fallbackLocality: Locality
): NearestPoliceResult {
  if (gpsCoords) {
    return findNearestPoliceStation(gpsCoords.lat, gpsCoords.lng, true);
  }
  return findNearestPoliceStation(
    fallbackLocality.lat,
    fallbackLocality.lng,
    false
  );
}

export function buildEmergencyTelUri(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleaned || '112'}`;
}

function haversineKmRaw(
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
  return R * c;
}
