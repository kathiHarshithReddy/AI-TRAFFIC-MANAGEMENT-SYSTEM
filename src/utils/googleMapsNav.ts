import { METRO_INTERCHANGES } from '../data/bengaluruLocalities';
import { Itinerary, Locality, TransitModeType } from '../types/traffic';

export type GoogleMapsTravelMode = 'transit' | 'driving' | 'bicycling' | 'walking';

export interface GoogleMapsDirectionsOptions {
  origin?: string | null;
  destination: string;
  travelMode?: GoogleMapsTravelMode;
  waypoints?: string[];
}

const COORD_REGEX = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

export function formatBengaluruPlaceForMaps(place: string): string {
  const trimmed = place.trim();
  if (!trimmed) return '';
  if (COORD_REGEX.test(trimmed)) {
    return trimmed.replace(/\s+/g, '');
  }
  if (/bengaluru|bangalore|karnataka/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}, Bengaluru, Karnataka`;
}

function formatWaypointForMaps(place: string): string {
  const trimmed = place.trim();
  if (!trimmed) return '';
  if (COORD_REGEX.test(trimmed)) {
    return trimmed.replace(/\s+/g, '');
  }
  if (/bengaluru|bangalore|karnataka/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}, Bengaluru`;
}

export function buildGoogleMapsDirectionsUrl({
  origin,
  destination,
  travelMode = 'driving',
  waypoints,
}: GoogleMapsDirectionsOptions): string {
  const params: string[] = ['api=1'];

  const formattedOrigin = origin ? formatBengaluruPlaceForMaps(origin) : '';
  if (formattedOrigin) {
    params.push(`origin=${encodeURIComponent(formattedOrigin)}`);
  }

  const formattedDestination = formatBengaluruPlaceForMaps(destination);
  params.push(`destination=${encodeURIComponent(formattedDestination)}`);
  params.push(`travelmode=${travelMode}`);

  if (waypoints && waypoints.length > 0) {
    const cleanedWaypoints = Array.from(
      new Set(
        waypoints
          .map((wp) => formatWaypointForMaps(wp))
          .filter((wp) => wp.length > 0)
      )
    );
    if (cleanedWaypoints.length > 0) {
      params.push(`waypoints=${encodeURIComponent(cleanedWaypoints.join('|'))}`);
    }
  }

  params.push('dir_action=navigate');
  return `https://www.google.com/maps/dir/?${params.join('&')}`;
}

export function mapTransitModeToTravelMode(mode: TransitModeType): GoogleMapsTravelMode {
  switch (mode) {
    case 'namma_metro':
    case 'bmtc_vajra':
    case 'bmtc_ordinary':
    case 'bmtc_feeder':
    case 'memu_rail':
      return 'transit';
    case 'yulu_ev':
      return 'bicycling';
    case 'walk':
      return 'walking';
    case 'solo_car':
    case 'ev_car':
    case 'two_wheeler':
    case 'e_auto':
    case 'auto_rickshaw':
    case 'bike_taxi':
    case 'cab_share':
    default:
      return 'driving';
  }
}

export function mapItineraryToTravelMode(itinerary: Itinerary): GoogleMapsTravelMode {
  switch (itinerary.category) {
    case 'eco_hybrid':
    case 'namma_metro':
    case 'bmtc_ordinary':
    case 'bmtc_vajra':
    case 'bmtc_direct':
    case 'memu_rail':
    case 'rail_express':
      return 'transit';
    case 'car_baseline':
    case 'cab_share':
    case 'e_auto':
    case 'bike_taxi':
      return 'driving';
    default: {
      const modes = itinerary.legs.map((l) => l.mode);
      if (modes.length > 0 && modes.every((m) => m === 'walk')) {
        return 'walking';
      }
      if (
        modes.includes('yulu_ev') &&
        !modes.some((m) =>
          [
            'namma_metro',
            'bmtc_ordinary',
            'bmtc_vajra',
            'bmtc_feeder',
            'memu_rail',
            'solo_car',
            'ev_car',
            'cab_share',
            'e_auto',
            'bike_taxi',
          ].includes(m)
        )
      ) {
        return 'bicycling';
      }
      if (
        modes.some((m) =>
          ['namma_metro', 'bmtc_ordinary', 'bmtc_vajra', 'bmtc_feeder', 'memu_rail'].includes(m)
        )
      ) {
        return 'transit';
      }
      return 'driving';
    }
  }
}

function ensureMetroSuffix(stationName: string): string {
  const trimmed = stationName.trim();
  if (/metro\s+station/i.test(trimmed)) return trimmed;
  if (/metro$/i.test(trimmed)) return `${trimmed} Station`;
  return `${trimmed} Metro Station`;
}

function ensureRailSuffix(stationName: string): string {
  const trimmed = stationName.trim();
  if (/railway\s+station|station/i.test(trimmed)) return trimmed;
  return `${trimmed} Railway Station`;
}

export function getItineraryWaypoints(
  itinerary: Itinerary,
  origin: Locality,
  destination: Locality
): string[] {
  const category = itinerary.category;

  if (category === 'eco_hybrid' || category === 'namma_metro') {
    const hubs: string[] = [ensureMetroSuffix(origin.nearestMetro.station)];

    if (origin.nearestMetro.line !== destination.nearestMetro.line) {
      const directInterchange = METRO_INTERCHANGES.find(
        (ic) =>
          ic.lines.includes(origin.nearestMetro.line) &&
          ic.lines.includes(destination.nearestMetro.line)
      );
      if (directInterchange) {
        hubs.push(ensureMetroSuffix(directInterchange.station));
      } else {
        hubs.push('Majestic Metro Station');
      }
    }

    hubs.push(ensureMetroSuffix(destination.nearestMetro.station));

    return Array.from(new Set(hubs)).filter(
      (h) =>
        h.toLowerCase() !== origin.name.toLowerCase() &&
        h.toLowerCase() !== destination.name.toLowerCase()
    );
  }

  if (category === 'rail_express' || category === 'memu_rail') {
    const hubs = [
      ensureRailSuffix(origin.nearestRail.station),
      ensureRailSuffix(destination.nearestRail.station),
    ];
    return Array.from(new Set(hubs));
  }

  return [];
}

export function getSafeCorridorWaypoints(
  origin: Locality,
  destination: Locality
): string[] {
  const hubs: string[] = [ensureMetroSuffix(origin.nearestMetro.station)];

  if (origin.zone !== destination.zone) {
    const interchange = METRO_INTERCHANGES.find(
      (ic) =>
        ic.lines.includes(origin.nearestMetro.line) &&
        ic.lines.includes(destination.nearestMetro.line)
    );
    hubs.push(
      ensureMetroSuffix(interchange ? interchange.station : 'MG Road')
    );
  }

  hubs.push(ensureMetroSuffix(destination.nearestMetro.station));

  return Array.from(new Set(hubs)).filter(
    (h) =>
      h.toLowerCase() !== origin.name.toLowerCase() &&
      h.toLowerCase() !== destination.name.toLowerCase()
  );
}

export function openInGoogleMaps(options: GoogleMapsDirectionsOptions): string {
  const url = buildGoogleMapsDirectionsUrl(options);
  if (typeof document !== 'undefined') {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
  return url;
}
