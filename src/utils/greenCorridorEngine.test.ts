import test from 'node:test';
import assert from 'node:assert/strict';
import { BENGALURU_LOCALITIES } from '../data/bengaluruLocalities';
import {
  advanceEmergencyVehicle,
  buildEmergencyRoutePlan,
  createInitialEmergencyFleet,
  EMERGENCY_DESTINATION_HUBS,
  generateGiveWayAlerts,
  interpolateVehiclePosition,
} from './greenCorridorEngine';

test('buildEmergencyRoutePlan sets up pre-cleared GREEN signals ahead of ambulance', () => {
  const bellandur = BENGALURU_LOCALITIES.find((l) =>
    l.name.toLowerCase().includes('bellandur')
  )!;
  const vehicle = buildEmergencyRoutePlan(
    'test-amb',
    'KA-01-G-108',
    'ambulance',
    'Code 1 Critical',
    bellandur.name,
    bellandur.lat,
    bellandur.lng,
    EMERGENCY_DESTINATION_HUBS[0],
    20,
    false,
    'clear'
  );

  assert.ok(vehicle.signals.length >= 3);
  const preClearedCount = vehicle.signals.filter((s) => s.preClearedForEmergency).length;
  assert.ok(preClearedCount >= 1, 'Expected at least 1 signal pre-cleared as GREEN');
  assert.ok(vehicle.timeSavedMin >= 3);
});

test('advanceEmergencyVehicle moves vehicle forward and shifts green wave along route', () => {
  const fleet = createInitialEmergencyFleet(BENGALURU_LOCALITIES, 'clear');
  const first = fleet[0];
  const initialPos = interpolateVehiclePosition(first);

  const stepped = advanceEmergencyVehicle(first, 35);
  const nextPos = interpolateVehiclePosition(stepped);

  assert.notEqual(stepped.progressPct, first.progressPct);
  assert.ok(
    initialPos.lat !== nextPos.lat || initialPos.lng !== nextPos.lng,
    'Expected interpolated GPS coordinates to move'
  );
});

test('roadblockActive changes status to rerouting_obstacle and generates alternate route instructions', () => {
  const bellandur = BENGALURU_LOCALITIES.find((l) =>
    l.name.toLowerCase().includes('bellandur')
  )!;
  const rerouted = buildEmergencyRoutePlan(
    'test-reroute',
    'KA-01-F-101',
    'fire_engine',
    'Code 1 Critical',
    bellandur.name,
    bellandur.lat,
    bellandur.lng,
    EMERGENCY_DESTINATION_HUBS[1],
    30,
    true,
    'heavy_rain'
  );

  assert.equal(rerouted.status, 'rerouting_obstacle');
  assert.ok(rerouted.alternateRoute.length >= 4);
  const alerts = generateGiveWayAlerts([rerouted]);
  assert.equal(alerts.length, 1);
  assert.ok(alerts[0].instruction.includes('AI Bypass'));
});
