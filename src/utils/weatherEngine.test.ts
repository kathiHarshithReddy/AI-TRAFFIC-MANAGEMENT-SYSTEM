import test from 'node:test';
import assert from 'node:assert/strict';
import { BENGALURU_CORRIDORS } from '../data/corridors';
import {
  BENGALURU_LOCALITIES,
  findLocalityById,
  findLocalityByQuery,
} from '../data/bengaluruLocalities';
import { computeMultiModalItineraries } from './routingEngine';
import { computeCorridorSnapshot } from './signalEngine';
import {
  classifyBengaluruWeather,
  getAllLocalitiesMicroWeather,
  getLocalityMicroWeather,
} from './weatherEngine';

test('classifies Bengaluru weather telemetry into clear, light_rain, heavy_rain, morning_fog, and extreme_heat', () => {
  assert.equal(classifyBengaluruWeather(26.0, 0, 1).condition, 'clear');
  assert.equal(classifyBengaluruWeather(22.5, 1.2, 61).condition, 'light_rain');
  assert.equal(classifyBengaluruWeather(21.0, 5.4, 65).condition, 'heavy_rain');
  assert.equal(classifyBengaluruWeather(18.0, 0, 45).condition, 'morning_fog');
  assert.equal(classifyBengaluruWeather(35.8, 0, 0).condition, 'extreme_heat');
});

test('hyper-local micro-weather engine assigns valid micro-climate states across all 161 localities', () => {
  const map = getAllLocalitiesMicroWeather('clear');
  assert.equal(map.size, BENGALURU_LOCALITIES.length);
  assert.equal(map.size, 161);

  for (const micro of map.values()) {
    assert.ok(micro.temperatureC >= 15 && micro.temperatureC <= 42);
    assert.ok(micro.rainProbabilityPct >= 0 && micro.rainProbabilityPct <= 100);
    assert.ok(micro.roadGripFactor >= 0.62 && micro.roadGripFactor <= 1.0);
  }

  const bellandur = findLocalityById('bellandur')!;
  const bellandurHeavy = getLocalityMicroWeather(bellandur, 'heavy_rain');
  assert.equal(bellandurHeavy.waterloggingRisk, true);
  assert.ok(bellandurHeavy.roadGripFactor <= 0.7);
  assert.ok(bellandurHeavy.label.includes('Waterlogging Alert'));
});

test('heavy rain and morning fog reduce road friction, extend yellow clearance +2s, and log weather-triggered decisions', () => {
  const orr = BENGALURU_CORRIDORS[0];
  const clearSnap = computeCorridorSnapshot(orr, 'adaptive', 'morning_rush', 10, 'clear');
  const rainSnap = computeCorridorSnapshot(orr, 'adaptive', 'morning_rush', 10, 'heavy_rain');
  const fogSnap = computeCorridorSnapshot(orr, 'adaptive', 'morning_rush', 10, 'morning_fog');
  const heatSnap = computeCorridorSnapshot(orr, 'adaptive', 'morning_rush', 10, 'extreme_heat');

  assert.ok(rainSnap.corridorSpeedKmh < clearSnap.corridorSpeedKmh);
  assert.ok(rainSnap.totalQueueMeters > clearSnap.totalQueueMeters);
  assert.ok(heatSnap.corridorSpeedKmh < clearSnap.corridorSpeedKmh);
  assert.ok(heatSnap.totalQueueMeters > clearSnap.totalQueueMeters);

  // Supply-side road friction reduction (25-35% in heavy rain -> 0.65..0.75) & +2s yellow buffer
  assert.equal(clearSnap.yellowSafetyBufferSec, 0);
  assert.equal(rainSnap.yellowSafetyBufferSec, 2);
  assert.equal(fogSnap.yellowSafetyBufferSec, 2);
  assert.ok(
    rainSnap.avgRoadFrictionCoeff >= 0.65 && rainSnap.avgRoadFrictionCoeff <= 0.75,
    `Expected friction 0.65-0.75, got ${rainSnap.avgRoadFrictionCoeff}`
  );

  const bellandurJx = rainSnap.intersections.find((j) =>
    j.name.toLowerCase().includes('bellandur')
  )!;
  assert.equal(bellandurJx.yellowSec, 6);
  assert.equal(bellandurJx.yellowBufferAddedSec, 2);
  assert.equal(bellandurJx.waterloggingProne, true);
  assert.ok(
    rainSnap.reasoningLog.some(
      (entry) =>
        entry.junctionName.includes('Bellandur') &&
        entry.action.includes('friction factor') &&
        entry.action.includes('+2s')
    )
  );
});

test('heavy rain slows car baseline, switches last-mile to covered E-Auto, and penalizes exposed open modes', () => {
  const whitefield = findLocalityByQuery('Whitefield')[0];
  const jayanagar = findLocalityById('jayanagar')!;
  const koramangala = findLocalityById('koramangala-blocks-1-8')!; // 1.6km to Metro (Yulu in clear -> E-Auto in rain)
  assert.ok(whitefield && jayanagar && koramangala);

  const clearRoutes = computeMultiModalItineraries(
    whitefield,
    koramangala,
    'lowest_co2',
    'now_peak',
    'clear'
  );
  const rainRoutes = computeMultiModalItineraries(
    whitefield,
    koramangala,
    'lowest_co2',
    'now_peak',
    'heavy_rain'
  );

  const clearCab = clearRoutes.find((r) => r.category === 'cab_share')!;
  const rainCab = rainRoutes.find((r) => r.category === 'cab_share')!;
  assert.ok(rainCab.totalDurationMin > clearCab.totalDurationMin);

  const clearEco = clearRoutes.find((r) => r.category === 'eco_hybrid')!;
  assert.ok(clearEco.legs.some((leg) => leg.mode === 'yulu_ev'));

  const rainEco = rainRoutes.find((r) => r.category === 'eco_hybrid')!;
  assert.ok(rainEco.legs.every((leg) => leg.mode !== 'yulu_ev'));
  assert.equal(
    rainEco.weatherAdaptationBadge,
    'Weather-Adapted: Covered Metro + E-Auto rain shield active'
  );
  assert.ok(rainRoutes.some((r) => r.wetWeatherPenaltyApplied === true));
});
