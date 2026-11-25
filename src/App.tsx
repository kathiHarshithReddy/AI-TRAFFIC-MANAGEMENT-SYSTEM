import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GreenCorridorView } from './components/GreenCorridorView';
import { Navbar } from './components/Navbar';
import { RoutePlannerView } from './components/RoutePlannerView';
import { SafetyAssistantView } from './components/SafetyAssistantView';
import { SideStreetEscapeScanner } from './components/SideStreetEscapeScanner';
import { SignalControlView } from './components/SignalControlView';
import { SosDispatchBanner } from './components/SosDispatchBanner';
import { SustainabilityAnalyticsView } from './components/SustainabilityAnalyticsView';
import { VoiceAlertBar } from './components/VoiceAlertBar';
import { WeatherWidget } from './components/WeatherWidget';
import {
  BENGALURU_LOCALITIES,
  findLocalityByQuery,
} from './data/bengaluruLocalities';
import { BENGALURU_CORRIDORS } from './data/corridors';
import {
  formatLocalizedIncidentSpeechAlert,
  formatLocalizedLocalityWeatherSpeechAlert,
  formatLocalizedWeatherSpeechAlert,
} from './i18n/domainLocalizers';
import { useLanguage } from './i18n/LanguageContext';
import {
  AppView,
  BottleneckId,
  Corridor,
  DepartureWindow,
  Itinerary,
  Locality,
  RoutePriority,
  SignalMode,
  SosCallMode,
  TrafficAlertIncident,
  TrafficScenario,
  WeatherCondition,
  WeatherTelemetry,
} from './types/traffic';
import {
  buildEmergencyTelUri,
  resolveNearestPoliceForLocalityOrGps,
} from './utils/policeStationEngine';
import { haversineKm } from './utils/routingEngine';
import {
  getCorridorTrafficAlerts,
  selectActiveTrafficAlert,
} from './utils/trafficAlertsEngine';
import {
  AudioAlertEvent,
  buildIncidentDedupeKey,
  buildWeatherDedupeKey,
  isSignificantIncident,
  shouldTriggerSpeechAlert,
  speakAlertText,
  stopSpeechAlerts,
} from './utils/ttsAlertEngine';
import {
  createSimulatedWeather,
  fetchBengaluruLiveWeather,
  getFallbackBengaluruWeather,
  getLocalityMicroWeather,
  WEATHER_IMPACT_CONFIG,
} from './utils/weatherEngine';

export default function App() {
  const { language, meta, t } = useLanguage();
  const [activeView, setActiveView] = useState<AppView>('signals');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeView]);

  // Weather state (live Open-Meteo feed + simulated test conditions)
  const [weatherMode, setWeatherMode] = useState<'live' | 'simulated'>('live');
  const [weather, setWeather] = useState<WeatherTelemetry>(() =>
    getFallbackBengaluruWeather()
  );
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  // Signal Control state
  const [corridorId, setCorridorId] = useState<string>(BENGALURU_CORRIDORS[0].id);
  const [signalMode, setSignalMode] = useState<SignalMode>('adaptive');
  const [scenario, setScenario] = useState<TrafficScenario>('morning_rush');
  const [tickSeconds, setTickSeconds] = useState<number>(12);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [alertOffsetByCorridor, setAlertOffsetByCorridor] = useState<
    Record<string, number>
  >({});

  // Eco-Transit Planner state
  const [origin, setOrigin] = useState<Locality>(
    () => findLocalityByQuery('Hennur')[0] || BENGALURU_LOCALITIES[0]
  );
  const [destination, setDestination] = useState<Locality>(
    () =>
      findLocalityByQuery('Electronic City')[0] || BENGALURU_LOCALITIES[1]
  );
  const [priority, setPriority] = useState<RoutePriority>('lowest_co2');
  const [departure, setDeparture] = useState<DepartureWindow>('now_peak');

  // Hands-free Text-to-Speech (TTS) audio alert state
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lastSpokenAlert, setLastSpokenAlert] = useState<AudioAlertEvent | null>(
    null
  );

  // Persistent Top-Bar SOS Emergency Protocol State
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sosCallMode, setSosCallMode] = useState<SosCallMode>('demo');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // Side-Street Escape & Bottleneck Bypass Scanner state
  const [sideStreetScannerOpen, setSideStreetScannerOpen] =
    useState<boolean>(false);
  const [selectedBottleneckId, setSelectedBottleneckId] =
    useState<BottleneckId>('marathahalli');

  const prevWeatherConditionRef = useRef<WeatherCondition>(weather.condition);
  const prevDestinationIdRef = useRef<string>(destination.id);
  const lastSpokenDedupeKeyRef = useRef<string | null>(null);
  const prevIncidentDedupeKeyRef = useRef<string | null>(null);

  const activeCorridor = useMemo(
    () =>
      BENGALURU_CORRIDORS.find((c) => c.id === corridorId) ||
      BENGALURU_CORRIDORS[0],
    [corridorId]
  );

  const activeIncidentState = useMemo(() => {
    const alerts = getCorridorTrafficAlerts(
      activeCorridor,
      scenario,
      weather.condition,
      tickSeconds,
      signalMode
    );
    return selectActiveTrafficAlert(
      alerts,
      tickSeconds,
      alertOffsetByCorridor[activeCorridor.id] ?? 0
    );
  }, [
    activeCorridor,
    scenario,
    weather.condition,
    tickSeconds,
    signalMode,
    alertOffsetByCorridor,
  ]);

  const dispatchAudioAlert = useCallback(
    (
      alert: Omit<AudioAlertEvent, 'id' | 'createdAt'>,
      options: { forceSpeak?: boolean } = {}
    ) => {
      const targetSpeechLang = alert.speechLang ?? meta.speechLang;
      const event: AudioAlertEvent = {
        ...alert,
        speechLang: targetSpeechLang,
        id: `${alert.type}-${Date.now()}`,
        createdAt: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      lastSpokenDedupeKeyRef.current = alert.dedupeKey;
      setLastSpokenAlert(event);

      if (options.forceSpeak || voiceAlertsEnabled) {
        speakAlertText(event.text, {
          lang: targetSpeechLang,
          interrupt: event.priority === 'urgent',
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    },
    [voiceAlertsEnabled, meta.speechLang]
  );

  const loadLiveWeather = useCallback(async () => {
    setIsWeatherLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 6000);
    try {
      const live = await fetchBengaluruLiveWeather(controller.signal);
      setWeather(live);
    } catch {
      setWeather((prev) =>
        prev.source === 'live' ? prev : getFallbackBengaluruWeather()
      );
    } finally {
      window.clearTimeout(timeoutId);
      setIsWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    if (weatherMode === 'live') {
      void loadLiveWeather();
    }
  }, [weatherMode, loadLiveWeather]);

  const handleSelectWeatherCondition = (choice: WeatherCondition | 'live') => {
    if (choice === 'live') {
      setWeatherMode('live');
      return;
    }
    setWeatherMode('simulated');
    setWeather(createSimulatedWeather(choice));
  };

  // Live 1-second simulation clock for signal phase countdowns
  useEffect(() => {
    if (!isSimRunning) return;
    const timer = window.setInterval(() => {
      setTickSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isSimRunning]);

  // Trigger TTS alert automatically when Bengaluru weather condition changes
  useEffect(() => {
    const prevCondition = prevWeatherConditionRef.current;
    if (prevCondition === weather.condition) return;
    prevWeatherConditionRef.current = weather.condition;

    const activeAlert = activeIncidentState.activeAlert;
    prevIncidentDedupeKeyRef.current = buildIncidentDedupeKey(
      activeCorridor.id,
      activeAlert.id,
      activeAlert.severity
    );

    if (!voiceAlertsEnabled) return;

    const dedupeKey = `${buildWeatherDedupeKey(weather.condition)}:${language}`;
    if (!shouldTriggerSpeechAlert(lastSpokenDedupeKeyRef.current, dedupeKey)) {
      return;
    }

    const impact = WEATHER_IMPACT_CONFIG[weather.condition];
    dispatchAudioAlert({
      type: 'weather',
      dedupeKey,
      label: 'Weather Update',
      text: formatLocalizedWeatherSpeechAlert(weather, impact, language),
      priority:
        weather.condition === 'heavy_rain' || weather.condition === 'morning_fog'
          ? 'urgent'
          : 'normal',
      speechLang: meta.speechLang,
    });
  }, [
    weather,
    voiceAlertsEnabled,
    activeIncidentState.activeAlert,
    activeCorridor.id,
    dispatchAudioAlert,
    language,
    meta.speechLang,
  ]);

  // Trigger TTS alert automatically when a new significant corridor incident appears
  useEffect(() => {
    const incident = activeIncidentState.activeAlert;
    const incidentKey = `${buildIncidentDedupeKey(
      activeCorridor.id,
      incident.id,
      incident.severity
    )}:${language}`;

    if (prevIncidentDedupeKeyRef.current === incidentKey) return;
    prevIncidentDedupeKeyRef.current = incidentKey;

    if (!voiceAlertsEnabled || !isSignificantIncident(incident)) return;
    if (!shouldTriggerSpeechAlert(lastSpokenDedupeKeyRef.current, incidentKey)) {
      return;
    }

    dispatchAudioAlert({
      type: 'incident',
      dedupeKey: incidentKey,
      label: 'Significant Incident',
      text: formatLocalizedIncidentSpeechAlert(
        incident,
        activeCorridor,
        signalMode,
        language
      ),
      priority: incident.severity === 'critical' ? 'urgent' : 'normal',
      speechLang: meta.speechLang,
    });
  }, [
    activeIncidentState.activeAlert,
    activeCorridor,
    signalMode,
    voiceAlertsEnabled,
    dispatchAudioAlert,
    language,
    meta.speechLang,
  ]);

  // Trigger brief route micro-weather alert if commuter picks a waterlogging/rain destination while voice alerts are active
  useEffect(() => {
    if (prevDestinationIdRef.current === destination.id) return;
    prevDestinationIdRef.current = destination.id;

    if (!voiceAlertsEnabled) return;

    const destMicro = getLocalityMicroWeather(destination, weather.condition);
    if (
      !destMicro.waterloggingRisk &&
      destMicro.condition !== 'heavy_downpour' &&
      destMicro.condition !== 'light_drizzle'
    ) {
      return;
    }

    const dedupeKey = `route-weather:${origin.id}:${destination.id}:${destMicro.condition}:${language}`;
    if (!shouldTriggerSpeechAlert(lastSpokenDedupeKeyRef.current, dedupeKey)) {
      return;
    }

    dispatchAudioAlert({
      type: 'route_weather',
      dedupeKey,
      label: 'Route Weather Notice',
      text: formatLocalizedLocalityWeatherSpeechAlert(
        origin.name,
        destination.name,
        destMicro,
        language
      ),
      priority: destMicro.waterloggingRisk ? 'urgent' : 'normal',
      speechLang: meta.speechLang,
    });
  }, [
    destination,
    origin.id,
    origin.name,
    weather.condition,
    voiceAlertsEnabled,
    dispatchAudioAlert,
    language,
    meta.speechLang,
  ]);

  useEffect(() => {
    return () => {
      stopSpeechAlerts();
    };
  }, []);

  const handleToggleVoiceAlerts = () => {
    if (voiceAlertsEnabled) {
      setVoiceAlertsEnabled(false);
      setIsSpeaking(false);
      stopSpeechAlerts();
      return;
    }

    setVoiceAlertsEnabled(true);
    const activeAlert = activeIncidentState.activeAlert;
    const initialText = isSignificantIncident(activeAlert)
      ? formatLocalizedIncidentSpeechAlert(
          activeAlert,
          activeCorridor,
          signalMode,
          language
        )
      : formatLocalizedWeatherSpeechAlert(
          weather,
          WEATHER_IMPACT_CONFIG[weather.condition],
          language
        );

    const dedupeKey = `voice-enabled:${activeCorridor.id}:${activeAlert.id}:${weather.condition}:${language}`;
    prevIncidentDedupeKeyRef.current = `${buildIncidentDedupeKey(
      activeCorridor.id,
      activeAlert.id,
      activeAlert.severity
    )}:${language}`;
    prevWeatherConditionRef.current = weather.condition;

    dispatchAudioAlert(
      {
        type: isSignificantIncident(activeAlert) ? 'incident' : 'weather',
        dedupeKey,
        label: 'Hands-Free Briefing',
        text: initialText,
        priority: 'normal',
        speechLang: meta.speechLang,
      },
      { forceSpeak: true }
    );
  };

  const handleSpeakIncidentOnDemand = (
    incident: TrafficAlertIncident,
    corridor: Corridor
  ) => {
    const dedupeKey = `${buildIncidentDedupeKey(
      corridor.id,
      incident.id,
      incident.severity
    )}:${language}`;
    prevIncidentDedupeKeyRef.current = dedupeKey;

    dispatchAudioAlert(
      {
        type: 'incident',
        dedupeKey,
        label: 'Incident Briefing',
        text: formatLocalizedIncidentSpeechAlert(
          incident,
          corridor,
          signalMode,
          language
        ),
        priority: incident.severity === 'critical' ? 'urgent' : 'normal',
        speechLang: meta.speechLang,
      },
      { forceSpeak: true }
    );
  };

  const handleSpeakItinerary = (route: Itinerary, spokenText: string) => {
    dispatchAudioAlert(
      {
        type: 'route_readout',
        dedupeKey: `route-readout:${route.id}:${origin.id}:${destination.id}:${language}:${Date.now()}`,
        label: t.voiceBar.routeVoiceReadout,
        text: spokenText,
        priority: 'normal',
        speechLang: meta.speechLang,
      },
      { forceSpeak: true }
    );
  };

  const handleReplayLastAlert = () => {
    if (!lastSpokenAlert) return;
    speakAlertText(lastSpokenAlert.text, {
      lang: lastSpokenAlert.speechLang ?? meta.speechLang,
      interrupt: true,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleDismissVoiceBar = () => {
    stopSpeechAlerts();
    setIsSpeaking(false);
    setLastSpokenAlert(null);
  };

  const handleStepAlertOffset = (targetCorridorId: string, delta: number) => {
    setAlertOffsetByCorridor((prev) => ({
      ...prev,
      [targetCorridorId]: (prev[targetCorridorId] ?? 0) + delta,
    }));
  };

  const plannedTripDistanceKm = useMemo(() => {
    const straight = haversineKm(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng
    );
    return Number((straight * 1.28).toFixed(1));
  }, [origin, destination]);

  const handleSwapLocalities = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const sosStationResult = useMemo(
    () => resolveNearestPoliceForLocalityOrGps(gpsCoords, origin),
    [gpsCoords, origin]
  );

  const handleToggleSos = () => {
    if (sosActive) {
      setSosActive(false);
      return;
    }

    setSosActive(true);
    let currentNearest = resolveNearestPoliceForLocalityOrGps(gpsCoords, origin);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setGpsCoords(coords);
          currentNearest = resolveNearestPoliceForLocalityOrGps(coords, origin);
          if (sosCallMode === 'live') {
            window.location.href = buildEmergencyTelUri(
              currentNearest.station.phone
            );
          }
        },
        () => {
          if (sosCallMode === 'live') {
            window.location.href = buildEmergencyTelUri(
              currentNearest.station.phone
            );
          }
        },
        { timeout: 3500 }
      );
      return;
    }

    if (sosCallMode === 'live') {
      window.location.href = buildEmergencyTelUri(currentNearest.station.phone);
    }
  };

  const handleTriggerEcoRoute = () => {
    setActiveView('planner');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      <Navbar
        activeView={activeView}
        onSelectView={setActiveView}
        onTriggerEcoRoute={handleTriggerEcoRoute}
        voiceAlertsEnabled={voiceAlertsEnabled}
        onToggleVoiceAlerts={handleToggleVoiceAlerts}
        sosActive={sosActive}
        onToggleSos={handleToggleSos}
      />

      {sosActive && (
        <SosDispatchBanner
          result={sosStationResult}
          localityName={origin.name}
          callMode={sosCallMode}
          onChangeCallMode={setSosCallMode}
          onCancelSos={() => setSosActive(false)}
        />
      )}

      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <WeatherWidget
          weather={weather}
          isLoading={isWeatherLoading}
          mode={weatherMode}
          onRefreshLive={loadLiveWeather}
          onSelectCondition={handleSelectWeatherCondition}
        />

        {lastSpokenAlert && (
          <VoiceAlertBar
            alert={lastSpokenAlert}
            isSpeaking={isSpeaking}
            voiceAlertsEnabled={voiceAlertsEnabled}
            onReplay={handleReplayLastAlert}
            onDismiss={handleDismissVoiceBar}
          />
        )}

        {activeView === 'signals' && (
          <SignalControlView
            corridorId={corridorId}
            onSelectCorridor={setCorridorId}
            signalMode={signalMode}
            onChangeSignalMode={setSignalMode}
            scenario={scenario}
            onChangeScenario={setScenario}
            weatherCondition={weather.condition}
            tickSeconds={tickSeconds}
            isSimRunning={isSimRunning}
            onToggleSimRunning={() => setIsSimRunning((prev) => !prev)}
            alertOffsetByCorridor={alertOffsetByCorridor}
            onStepAlertOffset={handleStepAlertOffset}
            onSpeakIncidentAlert={handleSpeakIncidentOnDemand}
            onOpenSideStreetScanner={(bottleneckId) => {
              setSelectedBottleneckId(bottleneckId);
              setSideStreetScannerOpen(true);
              setActiveView('planner');
            }}
          />
        )}

        {activeView === 'planner' && (
          <RoutePlannerView
            origin={origin}
            destination={destination}
            onChangeOrigin={setOrigin}
            onChangeDestination={setDestination}
            onSwapLocalities={handleSwapLocalities}
            priority={priority}
            onChangePriority={setPriority}
            departure={departure}
            onChangeDeparture={setDeparture}
            weatherCondition={weather.condition}
            onSpeakItinerary={handleSpeakItinerary}
            sideStreetScannerOpen={sideStreetScannerOpen}
            onToggleSideStreetScanner={setSideStreetScannerOpen}
            selectedBottleneckId={selectedBottleneckId}
            onChangeBottleneckId={setSelectedBottleneckId}
          />
        )}

        {activeView === 'escape' && (
          <SideStreetEscapeScanner
            selectedBottleneckId={selectedBottleneckId}
            onChangeBottleneckId={setSelectedBottleneckId}
            destination={destination}
            travelerProfile="standard"
            timeOfDay="evening_rush"
            weatherCondition={weather.condition}
            onClose={() => setActiveView('signals')}
          />
        )}

        {activeView === 'analytics' && (
          <SustainabilityAnalyticsView
            scenario={scenario}
            onChangeScenario={setScenario}
            signalMode={signalMode}
            onChangeSignalMode={setSignalMode}
            weatherCondition={weather.condition}
            plannedTripDistanceKm={plannedTripDistanceKm}
            originName={origin.name}
            destinationName={destination.name}
          />
        )}

        {activeView === 'corridor' && (
          <GreenCorridorView
            weatherCondition={weather.condition}
            onEmergencyDispatch={() => {
              setScenario('emergency_green_wave');
              setSignalMode('adaptive');
            }}
          />
        )}

        {activeView === 'safety' && <SafetyAssistantView />}
      </main>

      <footer className="border-t border-slate-800/80 bg-[#0B1120]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-medium text-slate-400">{t.footer.title}</span>
          <span>
            {BENGALURU_LOCALITIES.length} {t.footer.summarySuffix}
          </span>
        </div>
      </footer>
    </div>
  );
}
