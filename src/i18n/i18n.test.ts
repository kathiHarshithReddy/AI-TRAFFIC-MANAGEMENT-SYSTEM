import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BENGALURU_LOCALITIES, findLocalityByQuery } from '../data/bengaluruLocalities';
import { BENGALURU_CORRIDORS } from '../data/corridors';
import { computeMultiModalItineraries } from '../utils/routingEngine';
import { computeCorridorSnapshot } from '../utils/signalEngine';
import { getCorridorTrafficAlerts } from '../utils/trafficAlertsEngine';
import {
  localizeBengaluruPlaceName,
  localizeMetroLineName,
  METRO_LINE_TRANSLATIONS,
} from './bengaluruTransliterator';
import {
  formatItineraryVoiceReadout,
  formatLocalizedIncidentSpeechAlert,
  formatLocalizedWeatherSpeechAlert,
  localizeItinerary,
  localizeJunction,
  localizeReasoningEntry,
  localizeTrafficAlert,
} from './domainLocalizers';
import { AppLanguage, LANGUAGE_META, LANGUAGE_OPTIONS } from './types';
import { UI_TRANSLATIONS } from './uiTranslations';
import { getFallbackBengaluruWeather, WEATHER_IMPACT_CONFIG } from '../utils/weatherEngine';

const ALL_LANGS: AppLanguage[] = ['en', 'kn', 'te', 'hi', 'ml', 'ta', 'mr'];

const SCRIPT_UNICODE_RANGES: Record<Exclude<AppLanguage, 'en'>, RegExp> = {
  kn: /[\u0C80-\u0CFF]/,
  te: /[\u0C00-\u0C7F]/,
  hi: /[\u0900-\u097F]/,
  ml: /[\u0D00-\u0D7F]/,
  ta: /[\u0B80-\u0BFF]/,
  mr: /[\u0900-\u097F]/,
};

describe('Multi-Lingual Accessibility & Screen Translation Engine', () => {
  it('supports all 7 required languages with native script labels and BCP-47 speech tags', () => {
    assert.equal(LANGUAGE_OPTIONS.length, 7);
    for (const lang of ALL_LANGS) {
      assert.ok(LANGUAGE_META[lang], `Missing meta for ${lang}`);
      assert.ok(UI_TRANSLATIONS[lang], `Missing dictionary for ${lang}`);
      assert.ok(LANGUAGE_META[lang].speechLang.endsWith('-IN'));
    }
    assert.equal(LANGUAGE_META.kn.nativeLabel, 'ಕನ್ನಡ');
    assert.equal(LANGUAGE_META.te.nativeLabel, 'తెలుగు');
    assert.equal(LANGUAGE_META.hi.nativeLabel, 'हिन्दी');
    assert.equal(LANGUAGE_META.ml.nativeLabel, 'മലയാളം');
    assert.equal(LANGUAGE_META.ta.nativeLabel, 'தமிழ்');
    assert.equal(LANGUAGE_META.mr.nativeLabel, 'मराठी');
  });

  it('provides non-empty localized translations across all 6 Indic scripts for UI & Metro lines', () => {
    const lines = ['Purple', 'Green', 'Yellow', 'Pink'] as const;
    for (const line of lines) {
      for (const lang of ALL_LANGS) {
        const label = localizeMetroLineName(line, lang);
        assert.ok(label.length > 2, `Empty metro line translation for ${line}/${lang}`);
        assert.equal(label, METRO_LINE_TRANSLATIONS[line][lang]);
        if (lang !== 'en') {
          assert.match(label, SCRIPT_UNICODE_RANGES[lang]);
        }
      }
    }
  });

  it('transliterates all 161 Bengaluru localities cleanly into Kannada, Telugu, Hindi, Malayalam, Tamil & Marathi', () => {
    assert.ok(BENGALURU_LOCALITIES.length >= 161);
    for (const loc of BENGALURU_LOCALITIES) {
      for (const lang of ALL_LANGS) {
        const localized = localizeBengaluruPlaceName(loc.name, lang);
        assert.ok(localized.length > 0, `Empty localization for ${loc.name} in ${lang}`);
        if (lang !== 'en') {
          assert.match(
            localized,
            SCRIPT_UNICODE_RANGES[lang],
            `Expected ${lang} script characters for ${loc.name}, got "${localized}"`
          );
        }
      }
    }
  });

  it('localizes signal junction telemetry, AI reasoning log, and corridor traffic alerts across all 7 languages', () => {
    const corridor = BENGALURU_CORRIDORS[0];
    const snapshot = computeCorridorSnapshot(
      corridor,
      'adaptive',
      'morning_rush',
      15,
      'heavy_rain'
    );
    const alerts = getCorridorTrafficAlerts(
      corridor,
      'morning_rush',
      'heavy_rain',
      15,
      'adaptive'
    );

    for (const lang of ALL_LANGS) {
      const locJx = localizeJunction(
        snapshot.intersections[0],
        'adaptive',
        'morning_rush',
        'heavy_rain',
        lang
      );
      const locReason = localizeReasoningEntry(
        snapshot.reasoningLog[0],
        snapshot.intersections[0],
        'adaptive',
        'morning_rush',
        'heavy_rain',
        lang
      );
      const locAlert = localizeTrafficAlert(alerts[0], corridor, 'adaptive', lang);

      assert.ok(locJx.aiActionNote.length > 10);
      assert.ok(locReason.action.length > 10);
      assert.ok(locAlert.headline.length > 8);
      if (lang !== 'en') {
        assert.match(locJx.aiActionNote, SCRIPT_UNICODE_RANGES[lang]);
        assert.match(locAlert.headline, SCRIPT_UNICODE_RANGES[lang]);
      }
    }
  });

  it('localizes multi-modal transit itineraries & builds spoken step-by-step TTS readouts in all 7 languages', () => {
    const origin = findLocalityByQuery('Hennur')[0];
    const dest = findLocalityByQuery('Electronic City')[0];
    const itineraries = computeMultiModalItineraries(
      origin,
      dest,
      'lowest_co2',
      'now_peak',
      'heavy_rain'
    );
    const eco = itineraries.find((i) => i.category === 'eco_hybrid')!;

    for (const lang of ALL_LANGS) {
      const localized = localizeItinerary(
        eco,
        origin,
        dest,
        'lowest_co2',
        'heavy_rain',
        lang
      );
      assert.equal(localized.legs.length, eco.legs.length);
      const origLocalized = localizeBengaluruPlaceName(origin.name, lang);
      const destLocalized = localizeBengaluruPlaceName(destinationNameOrFallback(dest.name), lang);
      const speech = formatItineraryVoiceReadout(
        localized,
        origLocalized,
        destLocalized,
        lang
      );

      assert.ok(speech.includes(localized.title));
      assert.ok(speech.includes(origLocalized));
      if (lang !== 'en') {
        assert.match(speech, SCRIPT_UNICODE_RANGES[lang]);
        assert.match(localized.legs[0].modeLabel, SCRIPT_UNICODE_RANGES[lang]);
      }
    }
  });

  it('generates localized automatic weather & incident speech alerts in all 7 languages', () => {
    const weather = getFallbackBengaluruWeather();
    const corridor = BENGALURU_CORRIDORS[0];
    const alert = getCorridorTrafficAlerts(
      corridor,
      'morning_rush',
      'heavy_rain',
      10,
      'adaptive'
    )[0];

    for (const lang of ALL_LANGS) {
      const wSpeech = formatLocalizedWeatherSpeechAlert(
        { ...weather, condition: 'heavy_rain' },
        WEATHER_IMPACT_CONFIG.heavy_rain,
        lang
      );
      const iSpeech = formatLocalizedIncidentSpeechAlert(
        alert,
        corridor,
        'adaptive',
        lang
      );
      assert.ok(wSpeech.length > 20);
      assert.ok(iSpeech.length > 20);
      if (lang !== 'en') {
        assert.match(wSpeech, SCRIPT_UNICODE_RANGES[lang]);
        assert.match(iSpeech, SCRIPT_UNICODE_RANGES[lang]);
      }
    }
  });
});

function destinationNameOrFallback(name: string): string {
  return name || 'Electronic City';
}
