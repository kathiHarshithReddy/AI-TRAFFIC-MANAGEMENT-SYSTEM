import test from 'node:test';
import assert from 'node:assert/strict';
import { BENGALURU_CORRIDORS } from '../data/corridors';
import {
  getCorridorTrafficAlerts,
  selectActiveTrafficAlert,
} from './trafficAlertsEngine';

test('every Bengaluru corridor has at least 3 simulated bottleneck or roadwork alerts', () => {
  for (const corridor of BENGALURU_CORRIDORS) {
    const alerts = getCorridorTrafficAlerts(
      corridor,
      'morning_rush',
      'clear',
      10,
      'adaptive'
    );
    assert.ok(
      alerts.length >= 3,
      `Expected >= 3 alerts for ${corridor.id}, got ${alerts.length}`
    );
    assert.ok(
      alerts.some(
        (a) =>
          a.category === 'bottleneck' ||
          a.category === 'roadwork' ||
          a.category === 'metro_work'
      )
    );
  }
});

test('heavy rain weather injects a waterlogging bottleneck alert at the top of the corridor feed', () => {
  const orr = BENGALURU_CORRIDORS[0];
  const alerts = getCorridorTrafficAlerts(
    orr,
    'morning_rush',
    'heavy_rain',
    12,
    'static'
  );
  assert.equal(alerts[0].category, 'waterlogging');
  assert.equal(alerts[0].severity, 'critical');
  assert.ok(alerts[0].headline.includes(orr.intersections[0].name));
});

test('emergency green wave surfaces emergency priority clearance alert and adaptive mode reduces incident delay', () => {
  const north = BENGALURU_CORRIDORS[1];
  const staticAlerts = getCorridorTrafficAlerts(
    north,
    'emergency_green_wave',
    'clear',
    12,
    'static'
  );
  const adaptiveAlerts = getCorridorTrafficAlerts(
    north,
    'emergency_green_wave',
    'clear',
    12,
    'adaptive'
  );

  assert.equal(adaptiveAlerts[0].category, 'emergency_clearance');
  assert.ok(adaptiveAlerts[0].estDelayMin < staticAlerts[0].estDelayMin);
});

test('selectActiveTrafficAlert rotates smoothly on simulated feed ticks and manual offset', () => {
  const central = BENGALURU_CORRIDORS[2];
  const alerts = getCorridorTrafficAlerts(
    central,
    'evening_gridlock',
    'clear',
    0,
    'adaptive'
  );

  const first = selectActiveTrafficAlert(alerts, 0, 0, 12);
  const rotated = selectActiveTrafficAlert(alerts, 12, 0, 12);
  const prevManual = selectActiveTrafficAlert(alerts, 0, -1, 12);

  assert.equal(first.activeIndex, 0);
  assert.equal(rotated.activeIndex, 1);
  assert.equal(prevManual.activeIndex, alerts.length - 1);
  assert.notEqual(first.activeAlert.id, rotated.activeAlert.id);
});
