import test from 'node:test';
import assert from 'node:assert/strict';
import { BENGALURU_CORRIDORS } from '../data/corridors';
import { computeCorridorSnapshot } from './signalEngine';
import {
  buildFlowParticles,
  computeJunctionGeometry,
  getDesiredParticleCount,
  getWaitTimeColorInfo,
  interpolateWaitTimeColor,
  stepFlowParticles,
  syncParticlePopulation,
} from './flowSimulation';

test('wait-time color mapping categorizes low, moderate, high, and severe wait times', () => {
  const low = getWaitTimeColorInfo(15);
  const mod = getWaitTimeColorInfo(28);
  const high = getWaitTimeColorInfo(45);
  const severe = getWaitTimeColorInfo(65);

  assert.equal(low.tier, 'low');
  assert.equal(mod.tier, 'moderate');
  assert.equal(high.tier, 'high');
  assert.equal(severe.tier, 'severe');
  assert.notEqual(interpolateWaitTimeColor(12), interpolateWaitTimeColor(68));
});

test('particle population scales upward with higher traffic density', () => {
  const orr = BENGALURU_CORRIDORS[0];
  const offPeak = computeCorridorSnapshot(orr, 'adaptive', 'off_peak', 10);
  const gridlock = computeCorridorSnapshot(orr, 'static', 'evening_gridlock', 10);

  const offPeakCount = getDesiredParticleCount(offPeak.intersections);
  const gridlockCount = getDesiredParticleCount(gridlock.intersections);

  assert.ok(
    gridlockCount > offPeakCount,
    `Expected gridlock particle count (${gridlockCount}) > off-peak (${offPeakCount})`
  );
});

test('particles advance forward across green waves and hold smoothly behind red stop lines', () => {
  const orr = BENGALURU_CORRIDORS[0];
  const snapshot = computeCorridorSnapshot(orr, 'adaptive', 'morning_rush', 12);
  const geometries = computeJunctionGeometry(snapshot.intersections);

  const redJx = geometries.find((g) => g.intersection.currentPhase === 'RED');
  const greenJx = geometries.find((g) => g.intersection.currentPhase === 'GREEN');
  assert.ok(redJx && greenJx);

  const particles = syncParticlePopulation(buildFlowParticles(24), 24);
  // Place particle 0 right at the red stop line and particle 1 inside the green junction approach
  particles[0].x = redJx.stopX - 3;
  particles[1].x = greenJx.stopX - 18;

  const prevRedX = particles[0].x;
  const prevGreenX = particles[1].x;

  const rendered = stepFlowParticles(
    particles,
    geometries,
    snapshot.corridorSpeedKmh,
    'adaptive',
    0.05
  );

  assert.equal(rendered[0].stoppedAtRed, true);
  const redDelta = particles[0].x - prevRedX;
  const greenDelta = particles[1].x - prevGreenX;
  assert.ok(
    greenDelta > redDelta * 5,
    `Expected green flow delta (${greenDelta}) >> red hold delta (${redDelta})`
  );
});
