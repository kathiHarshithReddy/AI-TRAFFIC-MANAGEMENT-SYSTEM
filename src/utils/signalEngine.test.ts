import test from 'node:test';
import assert from 'node:assert/strict';
import { BENGALURU_CORRIDORS } from '../data/corridors';
import {
  computeCorridorSnapshot,
  getSignalIndicatorPulseState,
  isGreenCorridorActive,
} from './signalEngine';

test('all 6 arterial corridors exist with 5-6 intersections each', () => {
  assert.equal(BENGALURU_CORRIDORS.length, 6);
  for (const corridor of BENGALURU_CORRIDORS) {
    assert.ok(
      corridor.intersections.length >= 5 && corridor.intersections.length <= 6,
      `Corridor ${corridor.id} should have 5-6 intersections`
    );
  }
});

test('AI Adaptive mode reduces queue length and wait time compared to Static mode', () => {
  const orr = BENGALURU_CORRIDORS[0];
  const staticSnap = computeCorridorSnapshot(orr, 'static', 'morning_rush', 10);
  const adaptiveSnap = computeCorridorSnapshot(orr, 'adaptive', 'morning_rush', 10);

  assert.ok(adaptiveSnap.totalQueueMeters < staticSnap.totalQueueMeters);
  assert.ok(adaptiveSnap.corridorSpeedKmh > staticSnap.corridorSpeedKmh);
  assert.ok(adaptiveSnap.avgWaitReductionPct > 15);
  assert.equal(staticSnap.avgWaitReductionPct, 0);
});

test('Emergency Green Wave provides higher corridor speed and priority log entries in Adaptive mode', () => {
  const north = BENGALURU_CORRIDORS[1];
  const rushSnap = computeCorridorSnapshot(north, 'adaptive', 'morning_rush', 5);
  const waveSnap = computeCorridorSnapshot(north, 'adaptive', 'emergency_green_wave', 5);

  assert.ok(waveSnap.corridorSpeedKmh > rushSnap.corridorSpeedKmh);
  assert.ok(waveSnap.reasoningLog.every((entry) => entry.severity === 'priority'));
});

test('isGreenCorridorActive and getSignalIndicatorPulseState pulse only during active Emergency Green Wave while running', () => {
  assert.equal(isGreenCorridorActive('emergency_green_wave'), true);
  assert.equal(isGreenCorridorActive('morning_rush'), false);
  assert.equal(isGreenCorridorActive('evening_gridlock'), false);
  assert.equal(isGreenCorridorActive('off_peak'), false);

  const runningGreen = getSignalIndicatorPulseState('GREEN', 'emergency_green_wave', true);
  assert.deepEqual(runningGreen, {
    isGreenCorridorActive: true,
    shouldPulse: true,
    pulseVariant: 'green_corridor',
  });

  const runningRed = getSignalIndicatorPulseState('RED', 'emergency_green_wave', true);
  assert.deepEqual(runningRed, {
    isGreenCorridorActive: true,
    shouldPulse: true,
    pulseVariant: 'preempt_prep',
  });

  const pausedGreen = getSignalIndicatorPulseState('GREEN', 'emergency_green_wave', false);
  assert.deepEqual(pausedGreen, {
    isGreenCorridorActive: true,
    shouldPulse: false,
    pulseVariant: 'none',
  });

  const normalRush = getSignalIndicatorPulseState('GREEN', 'morning_rush', true);
  assert.deepEqual(normalRush, {
    isGreenCorridorActive: false,
    shouldPulse: false,
    pulseVariant: 'none',
  });
});
