import test from 'node:test';
import assert from 'node:assert/strict';
import { BENGALURU_LOCALITIES } from '../data/bengaluruLocalities';
import {
  buildEmergencyTelUri,
  findNearestPoliceStation,
  resolveNearestPoliceForLocalityOrGps,
} from './policeStationEngine';

test('findNearestPoliceStation resolves Indiranagar Police Station near Indiranagar coords', () => {
  const indiranagar = BENGALURU_LOCALITIES.find(
    (l) => l.name.toLowerCase() === 'indiranagar'
  )!;
  const result = findNearestPoliceStation(indiranagar.lat, indiranagar.lng, false);
  assert.equal(result.station.id, 'ps-indiranagar');
  assert.ok(result.distanceKm <= 2.0);
});

test('findNearestPoliceStation resolves K.R. Puram Police Station near KR Puram coords', () => {
  const krPuram = BENGALURU_LOCALITIES.find((l) =>
    l.name.toLowerCase().includes('kr puram')
  )!;
  const result = findNearestPoliceStation(krPuram.lat, krPuram.lng, false);
  assert.equal(result.station.id, 'ps-kr-puram');
  assert.ok(result.distanceKm <= 2.0);
});

test('resolveNearestPoliceForLocalityOrGps prefers GPS coordinates when provided', () => {
  const hennur = BENGALURU_LOCALITIES.find((l) => l.name === 'Hennur')!;
  const res = resolveNearestPoliceForLocalityOrGps(
    { lat: 12.8455, lng: 77.6604 },
    hennur
  );
  assert.equal(res.usedGps, true);
  assert.equal(res.station.id, 'ps-electronic-city');
});

test('buildEmergencyTelUri strips formatting characters cleanly', () => {
  assert.equal(buildEmergencyTelUri('080-2294 2544'), 'tel:08022942544');
  assert.equal(buildEmergencyTelUri('112'), 'tel:112');
});
