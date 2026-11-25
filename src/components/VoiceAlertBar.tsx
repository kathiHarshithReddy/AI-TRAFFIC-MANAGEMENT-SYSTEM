import { RotateCcw, Volume2, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { AudioAlertEvent } from '../utils/ttsAlertEngine';

interface VoiceAlertBarProps {
  alert: AudioAlertEvent;
  isSpeaking: boolean;
  voiceAlertsEnabled: boolean;
  onReplay: () => void;
  onDismiss: () => void;
}

export function VoiceAlertBar({
  alert,
  isSpeaking,
  voiceAlertsEnabled,
  onReplay,
  onDismiss,
}: VoiceAlertBarProps) {
  const { t } = useLanguage();
  const isWeather = alert.type === 'weather' || alert.type === 'route_weather';

  const borderTone = isWeather
    ? 'border-sky-500/40 bg-[#0F172A]'
    : alert.priority === 'urgent'
      ? 'border-amber-500/40 bg-[#0F172A]'
      : 'border-emerald-500/40 bg-[#0F172A]';

  const labelTone = isWeather
    ? 'text-sky-400'
    : alert.priority === 'urgent'
      ? 'text-amber-400'
      : 'text-emerald-400';

  const localizedBadgeLabel =
    alert.type === 'weather'
      ? t.voiceBar.weatherUpdate
      : alert.type === 'route_weather'
        ? t.voiceBar.routeWeatherNotice
        : alert.type === 'route_readout'
          ? t.voiceBar.routeVoiceReadout
          : alert.label === 'Significant Incident'
            ? t.voiceBar.significantIncident
            : alert.label === 'Incident Briefing'
              ? t.voiceBar.incidentBriefing
              : alert.label === 'Hands-Free Briefing'
                ? t.voiceBar.handsFreeBriefing
                : alert.label;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="tts-live-banner"
      className={`rounded-xl border ${borderTone} px-4 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <Volume2
          className={`h-4 w-4 shrink-0 mt-0.5 sm:mt-0 ${labelTone}`}
          aria-hidden="true"
        />
        <div className="min-w-0 text-xs leading-relaxed">
          <span className={`font-semibold ${labelTone} mr-2`}>
            {localizedBadgeLabel}
            {isSpeaking
              ? ` · ${t.voiceBar.speaking}`
              : voiceAlertsEnabled || alert.type === 'route_readout'
                ? ` · ${t.voiceBar.spoken}`
                : ''}
          </span>
          <span className="text-slate-200">{alert.text}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={onReplay}
          data-testid="tts-replay-btn"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#0B1120] px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-slate-600 hover:text-slate-50 transition-colors whitespace-nowrap"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          <span>{t.voiceBar.replay}</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t.voiceBar.dismissAria}
          data-testid="tts-dismiss-btn"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700/80 bg-[#0B1120] text-slate-400 hover:border-slate-600 hover:text-slate-100 transition-colors"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
