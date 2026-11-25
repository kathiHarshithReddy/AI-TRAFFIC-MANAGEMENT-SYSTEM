import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BENGALURU_LOCALITIES } from '../data/bengaluruLocalities';
import { DASHBOARD_UI } from '../i18n/dashboardTranslations';
import { AppLanguage } from '../i18n/types';
import { createInitialEmergencyFleet } from './greenCorridorEngine';
import {
  buildLiveActivityFeed,
  computeDashboardKpis,
  computeMajorJunctionStatuses,
  formatTwoDigitCount,
  ISOMETRIC_SAFE_HAVEN_PINS,
} from './dashboardEngine';

const ALL_LANGS: AppLanguage[] = ['en', 'kn', 'te', 'hi', 'ml', 'ta', 'mr'];

describe('Smart City 3D Command Center Dashboard Engine', () => {
  it('formats KPI counters cleanly with two-digit zero padding', () => {
    assert.equal(formatTwoDigitCount(4), '04');
    assert.equal(formatTwoDigitCount(12), '12');
    assert.equal(formatTwoDigitCount(-2), '00');
  });

  it('computes 4 dashboard KPIs cleanly from emergency fleet & adaptive signal state', () => {
    const fleet = createInitialEmergencyFleet(BENGALURU_LOCALITIES, 'clear');
    const kpis = computeDashboardKpis(fleet, 'adaptive', 'clear');
    assert.ok(Number(kpis.activeEmergencies) >= 4);
    assert.ok(Number(kpis.greenSignals) >= 12);
    assert.ok(Number(kpis.activeCorridors) >= 8);
    assert.ok(Number(kpis.timeSavedMin) >= 6);
  });

  it('exposes all 6 Safe Haven / Transit pin categories on the 3D isometric map', () => {
    const categories = new Set(ISOMETRIC_SAFE_HAVEN_PINS.map((p) => p.category));
    assert.ok(categories.has('hospital'));
    assert.ok(categories.has('police'));
    assert.ok(categories.has('fire'));
    assert.ok(categories.has('pharmacy'));
    assert.ok(categories.has('women_help'));
    assert.ok(categories.has('metro'));
  });

  it('produces status pills for all 5 major Bengaluru junctions and live activity events', () => {
    const junctions = computeMajorJunctionStatuses(10, 'adaptive', 'emergency_green_wave', 'en');
    assert.equal(junctions.length, 5);
    assert.ok(junctions.some((j) => j.name.includes('Silk Board')));
    assert.ok(junctions.some((j) => j.status === 'GREEN'));

    const feed = buildLiveActivityFeed('heavy_rain', 'adaptive', false, 'en');
    assert.equal(feed.length, 4);
  });

  it('provides full 7-language UI copy for dashboard sidebar, header, KPIs, and 3D map legend', () => {
    for (const lang of ALL_LANGS) {
      const copy = DASHBOARD_UI[lang];
      assert.ok(copy.headerTitle.length > 10);
      assert.ok(copy.systemOnline.length > 2);
      assert.ok(copy.sidebar.dashboard.length > 2);
      assert.ok(copy.map3d.legend.hospital.length > 1);
      assert.ok(copy.map3d.legend.womenHelp.length > 1);
      assert.ok(copy.map3d.legend.metro.length > 1);
    }
  });
});
