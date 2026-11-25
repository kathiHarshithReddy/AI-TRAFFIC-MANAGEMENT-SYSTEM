import assert from 'node:assert/strict';
import test from 'node:test';
import { BENGALURU_CORRIDORS } from '../data/corridors';
import { getCorridorTrafficAlerts } from './trafficAlertsEngine';
import {
  buildIncidentDedupeKey,
  buildWeatherDedupeKey,
  formatIncidentSpeechAlert,
  formatLocalityWeatherChangeSpeechAlert,
  formatWeatherSpeechAlert,
  isSignificantIncident,
  isSpeechSynthesisSupported,
  shouldTriggerSpeechAlert,
  speakAlertText,
} from './ttsAlertEngine';
import { createSimulatedWeather, WEATHER_IMPACT_CONFIG } from './weatherEngine';

test('isSignificantIncident flags critical, high, emergency, and >=10m delay alerts while muting minor ones', () => {
  const orr = BENGALURU_CORRIDORS[0];
  const alerts = getCorridorTrafficAlerts(
    orr,
    'morning_rush',
    'clear',
    12,
    'adaptive'
  );
  assert.equal(isSignificantIncident(alerts[0]), true);

  assert.equal(
    isSignificantIncident({
      id: 'minor-test',
      corridorId: 'central-cbd',
      junctionName: 'Trinity Circle',
      category: 'bottleneck',
      categoryLabel: 'Intersection Surge',
      severity: 'moderate',
      headline: 'Minor surge',
      details: 'Light queues',
      laneImpact: 'Outer lane slow',
      estDelayMin: 4,
      aiMitigationNote: 'Smooth',
      reportedAgo: '2m ago',
    }),
    false
  );
});

test('formatIncidentSpeechAlert produces concise commuter briefing with corridor, junction, delay, and mode', () => {
  const orr = BENGALURU_CORRIDORS[0];
  const alerts = getCorridorTrafficAlerts(
    orr,
    'evening_gridlock',
    'clear',
    12,
    'adaptive'
  );
  const text = formatIncidentSpeechAlert(alerts[0], orr.shortName, 'adaptive');
  assert.match(text, /Traffic AI alert on ORR IT Corridor/);
  assert.match(text, /Central Silk Board Junction/);
  assert.match(text, /minutes estimated delay/);
  assert.match(text, /Adaptive green wave active/);
  assert.ok(text.length < 220);
});

test('formatWeatherSpeechAlert adapts spoken guidance for heavy rain, fog, and clear transitions', () => {
  const rainTelemetry = createSimulatedWeather('heavy_rain');
  const rainText = formatWeatherSpeechAlert(
    rainTelemetry,
    WEATHER_IMPACT_CONFIG.heavy_rain
  );
  assert.match(rainText, /Waterlogging Alert/);
  assert.match(rainText, /0\.68/);
  assert.match(rainText, /E-Auto/);

  const fogTelemetry = createSimulatedWeather('morning_fog');
  const fogText = formatWeatherSpeechAlert(
    fogTelemetry,
    WEATHER_IMPACT_CONFIG.morning_fog
  );
  assert.match(fogText, /visibility alert/i);
  assert.match(fogText, /2 second yellow clearance buffer/);

  const clearTelemetry = createSimulatedWeather('clear');
  const clearText = formatWeatherSpeechAlert(
    clearTelemetry,
    WEATHER_IMPACT_CONFIG.clear
  );
  assert.match(clearText, /Dry road grip restored/);
});

test('formatLocalityWeatherChangeSpeechAlert announces destination waterlogging E-Auto adaptation', () => {
  const msg = formatLocalityWeatherChangeSpeechAlert('Hennur', 'Bellandur', {
    localityId: 'bellandur',
    condition: 'heavy_downpour',
    label: 'Heavy Monsoon Downpour & Waterlogging Alert',
    temperatureC: 19.3,
    rainProbabilityPct: 95,
    precipitationMmHr: 22.4,
    roadGripFactor: 0.67,
    waterloggingRisk: true,
    uvIndex: 2,
  });
  assert.match(msg, /Hennur to Bellandur/);
  assert.match(msg, /Waterlogging risk at Bellandur/);
  assert.match(msg, /covered E-Auto/);
});

test('shouldTriggerSpeechAlert deduplicates identical incident/weather keys across simulation ticks', () => {
  const k1 = buildIncidentDedupeKey('orr-east', 'orr-silkboard-bottleneck', 'critical');
  const k2 = buildWeatherDedupeKey('heavy_rain');

  assert.equal(shouldTriggerSpeechAlert(null, k1), true);
  assert.equal(shouldTriggerSpeechAlert(k1, k1), false);
  assert.equal(shouldTriggerSpeechAlert(k1, k2), true);
});

test('speakAlertText and isSpeechSynthesisSupported degrade gracefully when window.speechSynthesis is unavailable', () => {
  assert.equal(isSpeechSynthesisSupported(), false);
  assert.equal(speakAlertText('Traffic AI alert test'), false);
});
