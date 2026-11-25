import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CANDIDATE_TRANSLATIONS,
  BOTTLENECK_TRANSLATIONS,
  SIDE_STREET_UI,
} from '../i18n/sideStreetTranslations';
import { AppLanguage } from '../i18n/types';
import { BottleneckId } from '../types/traffic';
import {
  BENGALURU_BOTTLENECKS,
  evaluateSideStreetEscape,
  findNearestBottleneck,
} from './sideStreetEngine';

const ALL_LANGS: AppLanguage[] = ['en', 'kn', 'te', 'hi', 'ml', 'ta', 'mr'];

test('BENGALURU_BOTTLENECKS includes all 6 major bottlenecks with verified, 2W-only, and dead-end options', () => {
  const expectedIds: BottleneckId[] = [
    'silk_board',
    'marathahalli',
    'bellandur_orr',
    'hebbal_flyover',
    'kr_puram',
    'panathur_underpass',
  ];

  for (const id of expectedIds) {
    const bn = BENGALURU_BOTTLENECKS.find((b) => b.id === id);
    assert.ok(bn, `Missing bottleneck ${id}`);
    assert.ok(
      bn.candidates.some((c) => c.verdict === 'verified_bypass'),
      `${id} needs verified_bypass`
    );
    assert.ok(
      bn.candidates.some((c) => c.verdict === 'two_wheeler_only'),
      `${id} needs two_wheeler_only`
    );
    assert.ok(
      bn.candidates.some((c) => c.verdict === 'dead_end'),
      `${id} needs dead_end`
    );
  }
});

test('findNearestBottleneck resolves GPS coordinates to the closest Bengaluru chokepoint', () => {
  const nearHebbal = findNearestBottleneck(13.0355, 77.5968);
  assert.equal(nearHebbal.id, 'hebbal_flyover');

  const nearMarathahalli = findNearestBottleneck(12.9571, 77.7014);
  assert.equal(nearMarathahalli.id, 'marathahalli');

  const nearSilkBoard = findNearestBottleneck(12.918, 77.624);
  assert.equal(nearSilkBoard.id, 'silk_board');
});

test('evaluateSideStreetEscape builds Google Maps api=1 URLs with bypass waypoints on Verified Bypass options', () => {
  const result = evaluateSideStreetEscape({
    bottleneckId: 'marathahalli',
    destinationName: 'Whitefield',
    sideStreetSaturationPct: 52,
    womenSafetyMode: false,
    timeOfDay: 'evening_rush',
    weatherCondition: 'clear',
  });

  const bypass = result.activeCandidates.find(
    (c) => c.id === 'mr-14th-main'
  )!;
  assert.equal(bypass.verdict, 'verified_bypass');
  assert.equal(bypass.carDiversionCapped, false);
  assert.ok(bypass.googleMapsUrl);
  assert.ok(
    bypass.googleMapsUrl.startsWith('https://www.google.com/maps/dir/?api=1')
  );
  assert.ok(bypass.googleMapsUrl.includes('waypoints='));
  assert.ok(bypass.googleMapsUrl.includes('dir_action=navigate'));

  const deadEnd = result.activeCandidates.find((c) => c.verdict === 'dead_end')!;
  assert.equal(deadEnd.googleMapsUrl, null);
});

test('Residential Spillover Cap downgrades car diversions when side-street saturation exceeds 70%', () => {
  const normal = evaluateSideStreetEscape({
    bottleneckId: 'silk_board',
    destinationName: 'Bellandur',
    sideStreetSaturationPct: 65,
    womenSafetyMode: false,
    timeOfDay: 'evening_rush',
    weatherCondition: 'clear',
  });
  assert.equal(normal.spilloverCapActive, false);
  const btmNormal = normal.activeCandidates.find(
    (c) => c.id === 'sb-btm-hsr-cut'
  )!;
  assert.equal(btmNormal.carDiversionCapped, false);
  assert.equal(btmNormal.effectiveSuitability, 'car_auto_2w');

  const highSat = evaluateSideStreetEscape({
    bottleneckId: 'silk_board',
    destinationName: 'Bellandur',
    sideStreetSaturationPct: 78,
    womenSafetyMode: false,
    timeOfDay: 'evening_rush',
    weatherCondition: 'clear',
  });
  assert.equal(highSat.spilloverCapActive, true);
  const btmCapped = highSat.activeCandidates.find(
    (c) => c.id === 'sb-btm-hsr-cut'
  )!;
  assert.equal(btmCapped.carDiversionCapped, true);
  assert.equal(btmCapped.effectiveSuitability, 'two_wheeler_capped');

  // Arterial non-residential bypass stays uncapped
  const madiwala = highSat.activeCandidates.find(
    (c) => c.id === 'sb-madiwala-loop'
  )!;
  assert.equal(madiwala.carDiversionCapped, false);
});

test('Women Safety Mode, Late Night, and Heavy Rain filter out unlit or flood-prone side streets', () => {
  const res = evaluateSideStreetEscape({
    bottleneckId: 'bellandur_orr',
    destinationName: 'Electronic City',
    sideStreetSaturationPct: 50,
    womenSafetyMode: true,
    timeOfDay: 'late_night',
    weatherCondition: 'heavy_rain',
  });

  assert.equal(res.safetyFilterActive, true);
  assert.equal(res.monsoonFilterActive, true);

  // Unlit + flood-prone Bellandur Kodi Tank Bund Link must be filtered out
  assert.ok(
    res.filteredCandidates.some((c) => c.id === 'bl-kodi-tank-bund'),
    'Expected unlit/flood-prone Bellandur Kodi link to be filtered out'
  );
  // Well-lit, patrolled, flood-safe Green Glen Spine must stay active
  assert.ok(
    res.activeCandidates.some((c) => c.id === 'bl-green-glen-spine'),
    'Expected lit & patrolled Green Glen Spine to remain active'
  );
});

test('Side-Street Escape UI & Bottleneck dictionaries are completely translated in all 7 languages', () => {
  const scriptRegex: Record<Exclude<AppLanguage, 'en'>, RegExp> = {
    kn: /[\u0C80-\u0CFF]/,
    te: /[\u0C00-\u0C7F]/,
    hi: /[\u0900-\u097F]/,
    ml: /[\u0D00-\u0D7F]/,
    ta: /[\u0B80-\u0BFF]/,
    mr: /[\u0900-\u097F]/,
  };

  for (const lang of ALL_LANGS) {
    const ui = SIDE_STREET_UI[lang];
    assert.ok(ui.triggerButton.length > 5);
    assert.ok(ui.verdicts.verified_bypass.length > 3);
    assert.ok(ui.verdicts.two_wheeler_only.length > 3);
    assert.ok(ui.verdicts.dead_end.length > 3);
    if (lang !== 'en') {
      assert.match(ui.triggerButton, scriptRegex[lang]);
      assert.match(ui.verdicts.verified_bypass, scriptRegex[lang]);
    }

    for (const bn of BENGALURU_BOTTLENECKS) {
      const locBn = BOTTLENECK_TRANSLATIONS[bn.id][lang];
      assert.ok(locBn.name.length > 2);
      if (lang !== 'en') {
        assert.match(locBn.name, scriptRegex[lang]);
      }
    }
  }

  assert.ok(Object.keys(CANDIDATE_TRANSLATIONS).length >= 4);
});
