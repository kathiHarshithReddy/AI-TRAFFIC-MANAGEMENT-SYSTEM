import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Construction,
  RotateCcw,
  ShieldAlert,
  Volume2,
  X,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  SignalMode,
  TrafficAlertIncident,
  TrafficScenario,
  WeatherCondition,
} from '../types/traffic';

interface TrafficAlertBannerProps {
  corridorName: string;
  activeAlert: TrafficAlertIncident;
  activeIndex: number;
  totalCount: number;
  signalMode: SignalMode;
  scenario: TrafficScenario;
  weatherCondition: WeatherCondition;
  isDismissed: boolean;
  onPrevAlert: () => void;
  onNextAlert: () => void;
  onDismiss: () => void;
  onRestore: () => void;
  onSpeakAlert?: () => void;
}

function AlertCategoryIcon({
  category,
  className,
}: {
  category: TrafficAlertIncident['category'];
  className?: string;
}) {
  switch (category) {
    case 'roadwork':
    case 'metro_work':
      return <Construction className={className} aria-hidden="true" />;
    case 'waterlogging':
      return <CloudRain className={className} aria-hidden="true" />;
    case 'emergency_clearance':
      return <ShieldAlert className={className} aria-hidden="true" />;
    default:
      return <AlertTriangle className={className} aria-hidden="true" />;
  }
}

export function TrafficAlertBanner({
  corridorName,
  activeAlert,
  activeIndex,
  totalCount,
  signalMode,
  isDismissed,
  onPrevAlert,
  onNextAlert,
  onDismiss,
  onRestore,
  onSpeakAlert,
}: TrafficAlertBannerProps) {
  const { t } = useLanguage();

  if (isDismissed) {
    return (
      <div
        role="region"
        aria-label={t.alerts.trafficAlert}
        className="rounded-xl border border-slate-800/90 bg-[#0F172A] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <span>
            {t.alerts.mutedFor}{' '}
            <strong className="font-semibold text-slate-200">{corridorName}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {totalCount} {t.alerts.activeIncidents}
          </span>
        </div>
        <button
          type="button"
          onClick={onRestore}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#0B1120] px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-amber-500/50 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          <span>{t.alerts.showAlerts}</span>
        </button>
      </div>
    );
  }

  const isCritical = activeAlert.severity === 'critical';
  const isEmergency = activeAlert.category === 'emergency_clearance';

  const containerTone = isEmergency
    ? 'border-sky-500/40 bg-gradient-to-r from-[#0F172A] via-[#0F1D2E] to-[#0F172A]'
    : isCritical
      ? 'border-rose-500/40 bg-gradient-to-r from-[#0F172A] via-[#1C121D] to-[#0F172A]'
      : 'border-amber-500/40 bg-gradient-to-r from-[#0F172A] via-[#191614] to-[#0F172A]';

  const iconTone = isEmergency
    ? 'text-sky-400'
    : isCritical
      ? 'text-rose-400'
      : 'text-amber-400';

  const labelTone = isEmergency
    ? 'text-sky-400'
    : isCritical
      ? 'text-rose-400'
      : 'text-amber-400';

  const severityText = isEmergency
    ? t.alerts.priorityCorridor
    : t.alerts.severities[activeAlert.severity];

  return (
    <div
      role="region"
      aria-label={t.alerts.trafficAlert}
      data-testid="traffic-alert-banner"
      className={`rounded-xl border ${containerTone} px-4 py-3.5 sm:px-5 transition-colors`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 shrink-0">
            <AlertCategoryIcon category={activeAlert.category} className={`h-4 w-4 ${iconTone}`} />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className={`font-semibold ${labelTone}`}>
                {t.alerts.trafficAlert} · {severityText}
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="font-medium text-slate-200">{activeAlert.categoryLabel}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-300">{activeAlert.junctionName}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono text-slate-400 tabular-nums">
                {t.alerts.reported} {activeAlert.reportedAgo}
              </span>
            </div>

            <h2 className="font-display text-sm font-semibold text-slate-50 sm:text-[15px] leading-snug">
              {activeAlert.headline}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">{activeAlert.details}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs">
              <span className="font-mono font-semibold text-amber-300 tabular-nums">
                +{activeAlert.estDelayMin} min {t.alerts.estDelay}
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-300">{activeAlert.laneImpact}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className={signalMode === 'adaptive' ? 'text-emerald-400 font-medium' : 'text-amber-300'}>
                {activeAlert.aiMitigationNote}
              </span>
            </div>
          </div>
        </div>

        {/* Simulated Feed Navigation & Dismiss Controls */}
        <div className="flex items-center justify-between gap-2 lg:justify-end shrink-0 border-t border-slate-800/80 pt-2.5 lg:border-t-0 lg:pt-0">
          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-[#0B1120] p-1">
            <button
              type="button"
              onClick={onPrevAlert}
              aria-label="Previous corridor alert"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span
              className="px-2 font-mono text-[11px] font-medium text-slate-300 tabular-nums whitespace-nowrap"
              aria-live="polite"
            >
              {t.alerts.incidentCounter} {activeIndex + 1} / {totalCount}
            </span>
            <button
              type="button"
              onClick={onNextAlert}
              aria-label="Next corridor alert"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {onSpeakAlert && (
            <button
              type="button"
              onClick={onSpeakAlert}
              data-testid="speak-incident-btn"
              aria-label={t.alerts.listen}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#0B1120] px-2.5 text-xs font-medium text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
            >
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>{t.alerts.listen}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss traffic alert"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-[#0B1120] text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
