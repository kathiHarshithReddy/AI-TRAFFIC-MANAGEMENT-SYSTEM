import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BENGALURU_LOCALITIES,
  BENGALURU_ZONES,
  findLocalityByQuery,
} from '../data/bengaluruLocalities';
import { computeMultiModalItineraries } from './routingEngine';

test('database includes all 160+ Bengaluru localities across 7 directional & hub blocks', () => {
  assert.deepEqual(BENGALURU_ZONES, [
    'South Bengaluru',
    'North Bengaluru',
    'East Bengaluru',
    'West Bengaluru',
    'IT Hubs',
    'Central Bengaluru',
    'Outskirts',
  ]);
  assert.ok(
    BENGALURU_LOCALITIES.length >= 160,
    `Expected >= 160 localities, got ${BENGALURU_LOCALITIES.length}`
  );
  const zonesPresent = new Set(BENGALURU_LOCALITIES.map((l) => l.zone));
  assert.equal(zonesPresent.size, BENGALURU_ZONES.length);

  const countSum = BENGALURU_ZONES.reduce(
    (sum, zone) => sum + BENGALURU_LOCALITIES.filter((l) => l.zone === zone).length,
    0
  );
  assert.equal(countSum, BENGALURU_LOCALITIES.length);

  const expectedZoneSamples: Array<[string, (typeof BENGALURU_ZONES)[number]]> = [
    ['Jayanagar', 'South Bengaluru'],
    ['Hebbal', 'North Bengaluru'],
    ['Yelahanka', 'North Bengaluru'],
    ['Indiranagar', 'East Bengaluru'],
    ['Rajajinagar', 'West Bengaluru'],
    ['Whitefield', 'IT Hubs'],
    ['Electronic City (Phases 1 & 2)', 'IT Hubs'],
    ['MG Road', 'Central Bengaluru'],
    ['Bidadi', 'Outskirts'],
  ];

  for (const [query, expectedZone] of expectedZoneSamples) {
    const match = findLocalityByQuery(query)[0];
    assert.ok(match, `Expected locality match for ${query}`);
    assert.equal(match.zone, expectedZone, `Expected ${query} in ${expectedZone}, got ${match.zone}`);
  }
});

test('alias search finds Koramangala 4th Block and JP Nagar 7th Phase', () => {
  const kora = findLocalityByQuery('Koramangala 4th Block');
  assert.ok(kora.some((l) => l.name.includes('Koramangala')));

  const jp = findLocalityByQuery('JP Nagar 7th Phase');
  assert.ok(jp.some((l) => l.name.includes('JP Nagar')));
});

test('all 161 Bengaluru area names and user-requested phase/block/stage aliases resolve cleanly', () => {
  assert.equal(BENGALURU_LOCALITIES.length, 161);

  const requiredQueries = [
    'Pulikeshi Nagar (Frazer Town area)',
    'Pulikeshi Nagar',
    'ayanagar',
    'JP Nagar 5th Phase',
    'Koramangala 6th Block',
    'Banashankari Stage 3',
    'Electronic City Phase 2',
    'Chikkabanavara',
    'Bidadi',
  ];

  for (const query of requiredQueries) {
    const matches = findLocalityByQuery(query);
    assert.ok(matches.length > 0, `Expected findLocalityByQuery("${query}") to return a match`);
  }

  for (const loc of BENGALURU_LOCALITIES) {
    const exactMatches = findLocalityByQuery(loc.name);
    assert.ok(
      exactMatches.some((m) => m.id === loc.id),
      `Expected exact name "${loc.name}" to resolve to itself`
    );
  }
});

test('multi-modal engine returns 7 valid comparator itineraries with positive CO2 savings for Hennur to Electronic City', () => {
  const hennur = findLocalityByQuery('Hennur')[0];
  const ecity = findLocalityByQuery('Electronic City')[0];
  assert.ok(hennur && ecity);

  const routes = computeMultiModalItineraries(
    hennur,
    ecity,
    'lowest_co2',
    'morning_0830'
  );
  assert.equal(routes.length, 7);

  const cab = routes.find((r) => r.category === 'cab_share');
  const eco = routes.find((r) => r.category === 'eco_hybrid');
  const rail = routes.find((r) => r.category === 'rail_express');
  assert.ok(cab && eco && rail);

  assert.ok(eco.totalCo2Kg < cab.totalCo2Kg);
  assert.ok(eco.co2PreventedKg > 0);
  assert.ok(routes.some((r) => r.recommended));
});

test('fastest priority marks fastest itinerary as recommended', () => {
  const rrNagar = findLocalityByQuery('RR Nagar')[0];
  const itpl = findLocalityByQuery('ITPL Road')[0];
  assert.ok(rrNagar && itpl);

  const routes = computeMultiModalItineraries(
    rrNagar,
    itpl,
    'fastest',
    'evening_1830'
  );
  const recommended = routes.find((r) => r.recommended);
  assert.ok(recommended);
  const minDuration = Math.min(...routes.map((r) => r.totalDurationMin));
  assert.equal(recommended.totalDurationMin, minDuration);
});
