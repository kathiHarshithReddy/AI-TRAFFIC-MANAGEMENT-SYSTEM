import { MapPin, PhoneCall, Radio, ShieldAlert, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { NearestPoliceResult, SosCallMode } from '../types/traffic';
import { buildEmergencyTelUri } from '../utils/policeStationEngine';

interface SosDispatchBannerProps {
  result: NearestPoliceResult;
  localityName: string;
  callMode: SosCallMode;
  onChangeCallMode: (mode: SosCallMode) => void;
  onCancelSos: () => void;
}

export function SosDispatchBanner({
  result,
  localityName,
  callMode,
  onChangeCallMode,
  onCancelSos,
}: SosDispatchBannerProps) {
  const { t } = useLanguage();
  const stationTelUri = buildEmergencyTelUri(result.station.phone);

  return (
    <section
      role="region"
      aria-label={t.sos.bannerTitle}
      data-testid="sos-dispatch-banner"
      className="border-b border-rose-500/60 bg-gradient-to-r from-rose-950 via-[#2a0a12] to-rose-950 text-rose-50 shadow-lg"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Alert Status + Nearest Police Station Details */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm">
              <ShieldAlert className="h-5 w-5 animate-pulse" aria-hidden="true" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-rose-600 px-2 py-0.5 text-[11px] font-bold tracking-wider text-white uppercase">
                  <Radio className="h-3 w-3 animate-ping" aria-hidden="true" />
                  {t.sos.activeTag}
                </span>
                <h2 className="text-sm font-bold text-white">
                  {t.sos.bannerTitle}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-rose-100">
                <span data-testid="sos-nearest-station" className="font-semibold text-white">
                  {t.sos.nearestStationLabel}: {result.station.name} ({result.distanceKm}{' '}
                  {t.sos.distanceAwaySuffix})
                </span>
                <span className="font-mono text-rose-200">
                  {result.station.phone} · {result.station.division}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-rose-200">
                  <MapPin className="h-3.5 w-3.5 text-rose-300 shrink-0" aria-hidden="true" />
                  {result.usedGps
                    ? t.sos.gpsDetected
                    : `${t.sos.localityFallback}: ${localityName}`}{' '}
                  ({result.coords.lat.toFixed(4)}, {result.coords.lng.toFixed(4)})
                </span>
              </div>

              <p className="text-[11px] text-rose-200/90">
                {t.sos.gpsSharedNotice}{' '}
                {callMode === 'demo' && (
                  <span className="text-amber-300 font-medium">
                    · {t.sos.demoSafetyNote}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Demo/Live Guardrail + Direct Tel Actions + Cancel */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="sos-mode-switch"
              onClick={() =>
                onChangeCallMode(callMode === 'demo' ? 'live' : 'demo')
              }
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                callMode === 'demo'
                  ? 'border-amber-400/60 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
                  : 'border-rose-400/70 bg-rose-600/30 text-white hover:bg-rose-600/45'
              }`}
              title={callMode === 'demo' ? t.sos.switchToLive : t.sos.switchToDemo}
            >
              {callMode === 'demo' ? t.sos.demoModeLabel : t.sos.liveModeLabel} ·{' '}
              <span className="underline">
                {callMode === 'demo' ? t.sos.switchToLive : t.sos.switchToDemo}
              </span>
            </button>

            <a
              href={stationTelUri}
              data-testid="sos-dial-station-link"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors whitespace-nowrap"
            >
              <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
              {t.sos.dialStationBtn} ({result.station.phone})
            </a>

            <a
              href="tel:112"
              data-testid="sos-call-112-link"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 border border-rose-400/50 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors whitespace-nowrap"
            >
              <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
              {t.sos.call112Btn}
            </a>

            <button
              type="button"
              data-testid="sos-cancel-btn"
              onClick={onCancelSos}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300/40 bg-rose-950/80 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-900 transition-colors whitespace-nowrap"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              {t.sos.cancelSosBtn}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
