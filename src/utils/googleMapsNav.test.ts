import assert from 'node:assert/strict';
import test from 'node:test';
import { BENGALURU_LOCALITIES } from '../data/bengaluruLocalities';
import { computeMultiModalItineraries } from './routingEngine';
import {
  buildGoogleMapsDirectionsUrl,
  formatBengaluruPlaceForMaps,
  getItineraryWaypoints,
  getSafeCorridorWaypoints,
  mapItineraryToTravelMode,
  mapTransitModeToTravelMode,
} from './googleMapsNav';

test('buildGoogleMapsDirectionsUrl formats origin, destination, travelmode, and dir_action=navigate', () => {
  const url = buildGoogleMapsDirectionsUrl({
    origin: 'Indiranagar',
    destination: 'Whitefield',
    travelMode: 'transit',
  });

  assert.equal(
    url,
    'https://www.google.com/maps/dir/?api=1&origin=Indiranagar%2C%20Bengaluru%2C%20Karnataka&destination=Whitefield%2C%20Bengaluru%2C%20Karnataka&travelmode=transit&dir_action=navigate'
  );
});

test('buildGoogleMapsDirectionsUrl omits origin when routing from live device GPS and supports coordinate destinations', () => {
  const url = buildGoogleMapsDirectionsUrl({
    destination: '12.9716, 77.5946',
    travelMode: 'walking',
  });

  assert.ok(url.startsWith('https://www.google.com/maps/dir/?api=1&destination=12.9716%2C77.5946'));
  assert.ok(!url.includes('&origin='));
  assert.ok(url.includes('&travelmode=walking'));
  assert.ok(url.endsWith('&dir_action=navigate'));
});

test('buildGoogleMapsDirectionsUrl encodes intermediate pipe-separated waypoints cleanly', () => {
  const url = buildGoogleMapsDirectionsUrl({
    origin: 'Koramangala',
    destination: 'Electronic City',
    travelMode: 'driving',
    waypoints: ['Silk Board', 'Bommanahalli Metro Station, Bengaluru'],
  });

  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('api'), '1');
  assert.equal(parsed.searchParams.get('travelmode'), 'driving');
  assert.equal(parsed.searchParams.get('dir_action'), 'navigate');
  assert.equal(
    parsed.searchParams.get('waypoints'),
    'Silk Board, Bengaluru|Bommanahalli Metro Station, Bengaluru'
  );
});

test('formatBengaluruPlaceForMaps preserves existing Bengaluru suffixes and coordinates', () => {
  assert.equal(
    formatBengaluruPlaceForMaps('Indiranagar Police Station, 100 Feet Rd, Bengaluru'),
    'Indiranagar Police Station, 100 Feet Rd, Bengaluru'
  );
  assert.equal(formatBengaluruPlaceForMaps('12.9352, 77.6245'), '12.9352,77.6245');
  assert.equal(formatBengaluruPlaceForMaps('Jayanagar'), 'Jayanagar, Bengaluru, Karnataka');
});

test('mapItineraryToTravelMode maps all route categories to exact Google Maps travelmodes', () => {
  const origin = BENGALURU_LOCALITIES.find((l) => l.id === 'indiranagar')!;
  const dest = BENGALURU_LOCALITIES.find((l) => l.id === 'whitefield')!;
  const itineraries = computeMultiModalItineraries(origin, dest, 'lowest_co2', 'now_peak');

  const byCategory = new Map(itineraries.map((it) => [it.category, it]));

  assert.equal(mapItineraryToTravelMode(byCategory.get('eco_hybrid')!), 'transit');
  assert.equal(mapItineraryToTravelMode(byCategory.get('bmtc_ordinary')!), 'transit');
  assert.equal(mapItineraryToTravelMode(byCategory.get('bmtc_vajra')!), 'transit');
  assert.equal(mapItineraryToTravelMode(byCategory.get('rail_express')!), 'transit');
  assert.equal(mapItineraryToTravelMode(byCategory.get('e_auto')!), 'driving');
  assert.equal(mapItineraryToTravelMode(byCategory.get('bike_taxi')!), 'driving');
  assert.equal(mapItineraryToTravelMode(byCategory.get('cab_share')!), 'driving');

  assert.equal(mapTransitModeToTravelMode('yulu_ev'), 'bicycling');
  assert.equal(mapTransitModeToTravelMode('walk'), 'walking');
});

test('getItineraryWaypoints and getSafeCorridorWaypoints return deduplicated Bengaluru Metro/Rail hubs', () => {
  const origin = BENGALURU_LOCALITIES.find((l) => l.name.toLowerCase().includes('indiranagar'))!;
  const dest = BENGALURU_LOCALITIES.find((l) => l.name.toLowerCase().includes('jayanagar'))!;
  const itineraries = computeMultiModalItineraries(origin, dest, 'safest_women', 'late_2200');

  const eco = itineraries.find((it) => it.category === 'eco_hybrid')!;
  const ecoWaypoints = getItineraryWaypoints(eco, origin, dest);
  assert.ok(ecoWaypoints.length >= 2);
  assert.ok(ecoWaypoints.every((w) => w.includes('Metro Station') && !w.includes('Metro Metro')));

  const rail = itineraries.find((it) => it.category === 'rail_express')!;
  const railWaypoints = getItineraryWaypoints(rail, origin, dest);
  assert.ok(railWaypoints.length >= 1);

  const safeWaypoints = getSafeCorridorWaypoints(origin, dest);
  assert.ok(safeWaypoints.length >= 2);
});

test('localizeItinerary safely translates all 7 comparator categories across kn, te, hi, ml, ta, mr', async () => {
  const { localizeItinerary } = await import('../i18n/domainLocalizers');
  const origin = BENGALURU_LOCALITIES.find((l) => l.name.toLowerCase().includes('indiranagar'))!;
  const dest = BENGALURU_LOCALITIES.find((l) => l.name.toLowerCase().includes('jayanagar'))!;
  const itineraries = computeMultiModalItineraries(origin, dest, 'safest_women', 'late_2200');
  const langs = ['kn', 'te', 'hi', 'ml', 'ta', 'mr'] as const;

  for (const lang of langs) {
    for (const route of itineraries) {
      const localized = localizeItinerary(route, origin, dest, 'safest_women', 'clear', lang);
      assert.ok(localized.title.length > 0);
      assert.ok(localized.legs.length > 0);
    }
  }
});
