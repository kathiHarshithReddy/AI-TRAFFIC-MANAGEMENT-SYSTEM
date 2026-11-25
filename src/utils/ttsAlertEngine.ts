import {
  LocalityMicroWeather,
  SignalMode,
  TrafficAlertIncident,
  WeatherCondition,
  WeatherTelemetry,
  WeatherTrafficImpact,
} from '../types/traffic';

export type AudioAlertType =
  | 'incident'
  | 'weather'
  | 'route_weather'
  | 'route_readout'
  | 'system';

export interface AudioAlertEvent {
  id: string;
  type: AudioAlertType;
  dedupeKey: string;
  label: string;
  text: string;
  priority: 'urgent' | 'normal';
  createdAt: string;
  speechLang?: string;
}

export interface SpeechPlaybackOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  interrupt?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Determines whether a corridor incident warrants a hands-free spoken alert.
 * Moderates minor advisories silently so commuters are only interrupted for high-impact events.
 */
export function isSignificantIncident(incident: TrafficAlertIncident): boolean {
  return (
    incident.severity === 'critical' ||
    incident.severity === 'high' ||
    incident.category === 'emergency_clearance' ||
    incident.estDelayMin >= 10
  );
}

/**
 * Formats a concise, hands-free commuter audio briefing for a significant corridor incident.
 */
export function formatIncidentSpeechAlert(
  incident: TrafficAlertIncident,
  corridorShortName: string,
  signalMode: SignalMode
): string {
  const modeClause =
    signalMode === 'adaptive'
      ? 'Adaptive green wave active.'
      : 'Fixed signal timing active.';

  if (incident.category === 'emergency_clearance') {
    return `Priority corridor alert on ${corridorShortName}: Emergency clearance at ${incident.junctionName}. Estimated delay ${incident.estDelayMin} minutes. ${modeClause}`;
  }

  const severityWord =
    incident.severity === 'critical'
      ? 'Critical'
      : incident.severity === 'high'
        ? 'High-impact'
        : 'Advisory';

  return `Traffic AI alert on ${corridorShortName}: ${severityWord} ${incident.categoryLabel.toLowerCase()} at ${incident.junctionName}, plus ${incident.estDelayMin} minutes estimated delay. ${modeClause}`;
}

/**
 * Formats a concise spoken update when Bengaluru weather conditions change.
 */
export function formatWeatherSpeechAlert(
  telemetry: WeatherTelemetry,
  impact: WeatherTrafficImpact
): string {
  const tempRounded = telemetry.temperatureC.toFixed(1);
  if (telemetry.condition === 'clear') {
    return `Bengaluru weather update: ${telemetry.weatherLabel}, ${tempRounded} degrees Celsius. Dry road grip restored and zero-emission Yulu and Metro routing active.`;
  }

  if (telemetry.condition === 'heavy_rain') {
    return `Bengaluru weather alert: ${impact.label}, ${tempRounded} degrees Celsius. Road grip reduced to ${impact.roadFrictionCoeff.toFixed(2)}. Plus 2 second yellow buffer and covered Metro or E-Auto routing active.`;
  }

  if (telemetry.condition === 'light_rain') {
    return `Bengaluru weather update: ${telemetry.weatherLabel}, ${tempRounded} degrees Celsius. Wet-weather penalty active with covered Metro and E-Auto transfers prioritized.`;
  }

  if (telemetry.condition === 'morning_fog') {
    return `Bengaluru visibility alert: ${telemetry.weatherLabel}, ${tempRounded} degrees Celsius. Plus 2 second yellow clearance buffer and grade-separated Metro priority active.`;
  }

  return `Bengaluru heat advisory: ${telemetry.weatherLabel}, ${tempRounded} degrees Celsius. Air-conditioned Metro and BMTC Vajra routes prioritized.`;
}

/**
 * Formats a brief micro-weather warning when a commuter selects a rain/waterlogging destination.
 */
export function formatLocalityWeatherChangeSpeechAlert(
  originName: string,
  destName: string,
  destMicro: LocalityMicroWeather
): string {
  if (destMicro.waterloggingRisk || destMicro.condition === 'heavy_downpour') {
    return `Route weather alert for ${originName} to ${destName}: Waterlogging risk at ${destName}, ${destMicro.temperatureC.toFixed(1)} degrees Celsius. Last-mile switched to covered E-Auto.`;
  }

  if (destMicro.condition === 'light_drizzle') {
    return `Route weather notice for ${destName}: Light drizzle, ${destMicro.rainProbabilityPct} percent rain chance. Covered transit legs recommended.`;
  }

  return `Route weather notice for ${destName}: ${destMicro.label}, ${destMicro.temperatureC.toFixed(1)} degrees Celsius.`;
}

export function buildWeatherDedupeKey(condition: WeatherCondition): string {
  return `weather:${condition}`;
}

export function buildIncidentDedupeKey(
  corridorId: string,
  incidentId: string,
  severity: TrafficAlertIncident['severity']
): string {
  return `incident:${corridorId}:${incidentId}:${severity}`;
}

export function shouldTriggerSpeechAlert(
  lastDedupeKey: string | null,
  nextDedupeKey: string
): boolean {
  return Boolean(nextDedupeKey) && lastDedupeKey !== nextDedupeKey;
}

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

function selectPreferredVoiceForLang(
  synth: SpeechSynthesis,
  targetLang: string
): SpeechSynthesisVoice | null {
  try {
    const voices = synth.getVoices();
    if (!voices || voices.length === 0) return null;
    const normalized = targetLang.toLowerCase();
    const prefix = normalized.split('-')[0];
    return (
      voices.find((v) => v.lang.toLowerCase() === normalized) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(`${prefix}-`)) ||
      voices.find((v) => v.lang.toLowerCase() === prefix) ||
      (prefix === 'en'
        ? voices.find((v) => v.lang.toLowerCase() === 'en-in') ||
          voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
          voices[0]
        : null)
    );
  } catch {
    return null;
  }
}

/**
 * Speaks an alert message using the browser Web Speech API (`window.speechSynthesis`).
 * Returns true if speech playback was dispatched, false if unavailable or empty.
 */
export function speakAlertText(
  text: string,
  options: SpeechPlaybackOptions = {}
): boolean {
  const trimmed = text.trim();
  if (!trimmed || !isSpeechSynthesisSupported()) {
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    if (options.interrupt !== false) {
      synth.cancel();
    }

    const targetLang = options.lang ?? 'en-IN';
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = targetLang;
    utterance.rate = options.rate ?? 1.03;
    utterance.pitch = options.pitch ?? 1.0;

    const preferredVoice = selectPreferredVoiceForLang(synth, targetLang);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeechAlerts(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore browser speech cancellation quirks
  }
}
