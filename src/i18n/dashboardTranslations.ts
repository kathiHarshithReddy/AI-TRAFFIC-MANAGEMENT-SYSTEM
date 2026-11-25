import { AppLanguage } from './types';

export interface DashboardUiCopy {
  brandTitle: string;
  brandTagline: string;
  promoTitle: string;
  promoSubtitle: string;
  headerTitle: string;
  systemOnline: string;
  sidebar: {
    dashboard: string;
    signals: string;
    planner: string;
    safety: string;
    escape: string;
    weather: string;
    analytics: string;
    corridor: string;
  };
  kpis: {
    activeEmergencies: string;
    activeEmergenciesSub: string;
    greenSignals: string;
    greenSignalsSub: string;
    activeCorridors: string;
    activeCorridorsSub: string;
    timeSaved: string;
    timeSavedSub: string;
    minUnit: string;
  };
  map3d: {
    title: string;
    subtitle: string;
    corridorBadge: string;
    liveMotion: string;
    pausedMotion: string;
    simulateBypass: string;
    bypassActive: string;
    etaLabel: string;
    distanceLabel: string;
    routeProgressLabel: string;
    selectedPinLabel: string;
    legend: {
      hospital: string;
      police: string;
      fire: string;
      pharmacy: string;
      womenHelp: string;
      metro: string;
    };
  };
  rightPanel: {
    vehicleTitle: string;
    vehicleSub: string;
    currentJunction: string;
    destinationLabel: string;
    etaLabel: string;
    trackLiveBtn: string;
    openCorridorDispatch: string;
    signalStatusTitle: string;
    signalStatusSub: string;
    statusGreen: string;
    statusPreparing: string;
  };
  bottomRow: {
    routeOptionsTitle: string;
    routeOptionsSub: string;
    fastestRoute: string;
    saferRoute: string;
    sideStreetBypass: string;
    safetyLabel: string;
    costLabel: string;
    comfortLabel: string;
    useRouteBtn: string;
    openFullPlannerBtn: string;
    activityTitle: string;
    activitySub: string;
    insightsTitle: string;
    insightsSub: string;
    responseTimeDrop: string;
    flowEfficiencyGain: string;
    insightsCaption: string;
  };
  weatherPage: {
    title: string;
    subtitle: string;
    localityMatrixTitle: string;
    localityMatrixSub: string;
  };
  escapePage: {
    title: string;
    subtitle: string;
  };
}

export const DASHBOARD_UI: Record<AppLanguage, DashboardUiCopy> = {
  en: {
    brandTitle: 'TRAFFIC AI',
    brandTagline: 'Smarter. Safer. Greener.',
    promoTitle: 'Safer City, Happier Citizens',
    promoSubtitle: 'Hyper-local AI signals & safe transit across 161 Bengaluru zones',
    headerTitle: 'AI Smart Traffic Management — Bengaluru Smart City Command Centre',
    systemOnline: 'System Online',
    sidebar: {
      dashboard: 'Dashboard',
      signals: 'Live 3D Traffic Map',
      planner: 'Multi-Modal Route Planner',
      safety: "Women's Safety & SOS",
      escape: 'Side-Street Escape',
      weather: 'Hyper-Local Weather',
      analytics: 'Sustainability Analytics',
      corridor: 'Green Corridor Dispatch',
    },
    kpis: {
      activeEmergencies: 'Active Emergencies',
      activeEmergenciesSub: 'Code-1 Priority Corridors',
      greenSignals: 'Green Signals',
      greenSignalsSub: 'Synchronized Green Wave',
      activeCorridors: 'Active Corridors',
      activeCorridorsSub: 'Across Bengaluru Zones',
      timeSaved: 'Time Saved',
      timeSavedSub: 'Avg Emergency & Transit Gain',
      minUnit: 'min',
    },
    map3d: {
      title: 'Interactive 3D Isometric Bengaluru Corridor Map',
      subtitle: 'Live Emerald Green Corridor, emergency telemetry & verified Safe Haven pins',
      corridorBadge: 'Emerald Green Corridor Active',
      liveMotion: 'Live 3D Flow',
      pausedMotion: 'Paused',
      simulateBypass: 'Simulate Roadblock Bypass',
      bypassActive: 'AI Bypass Active',
      etaLabel: 'ETA',
      distanceLabel: 'Distance',
      routeProgressLabel: 'Route Progress',
      selectedPinLabel: 'Selected Safe Haven',
      legend: {
        hospital: 'Hospital',
        police: 'Police Station',
        fire: 'Fire Station',
        pharmacy: 'Pharmacy',
        womenHelp: 'Women Help Centre',
        metro: 'Namma Metro',
      },
    },
    rightPanel: {
      vehicleTitle: 'Live Emergency & Transit Tracking',
      vehicleSub: 'Active Green Wave Telemetry',
      currentJunction: 'Current Junction',
      destinationLabel: 'Destination',
      etaLabel: 'Live ETA',
      trackLiveBtn: 'Track Live / Navigate in Google Maps',
      openCorridorDispatch: 'Open Full Dispatch Control',
      signalStatusTitle: 'Traffic Signal Status',
      signalStatusSub: 'Major Bengaluru Arterial Junctions',
      statusGreen: 'GREEN',
      statusPreparing: 'PREPARING',
    },
    bottomRow: {
      routeOptionsTitle: 'AI Route Options & Side-Street Escape',
      routeOptionsSub: 'Cost, Comfort, Time & Women Safety Compare',
      fastestRoute: 'Fastest Route',
      saferRoute: 'AI Safer Route',
      sideStreetBypass: 'Side-Street Bypass',
      safetyLabel: 'Safety',
      costLabel: 'Cost',
      comfortLabel: 'Comfort',
      useRouteBtn: 'Use This Route (Google Maps)',
      openFullPlannerBtn: 'Compare All 7 Modes',
      activityTitle: 'Live Activity Feed',
      activitySub: 'Signals, Weather, Safety & Green Wave Events',
      insightsTitle: 'Key Insights',
      insightsSub: 'Bengaluru Smart City AI Impact',
      responseTimeDrop: 'Emergency Response Time',
      flowEfficiencyGain: 'Traffic Flow Efficiency',
      insightsCaption: 'Adaptive 3D signal synchronization reduces arterial gridlock.',
    },
    weatherPage: {
      title: 'Hyper-Local Bengaluru Micro-Weather Engine',
      subtitle: 'Live ward-level temperature, rain grip, and waterlogging risk matrix across key transit corridors.',
      localityMatrixTitle: 'Corridor Micro-Climate & Road Grip Matrix',
      localityMatrixSub: 'Automatically adjusts signal yellow buffers and sheltered transit recommendations.',
    },
    escapePage: {
      title: 'Side-Street Escape & Bottleneck Bypass Scanner',
      subtitle: 'Evaluate parallel cross-roads around Bengaluru chokepoints with safety and monsoon guardrails.',
    },
  },
  kn: {
    brandTitle: 'TRAFFIC AI',
    brandTagline: 'ಚುರುಕು. ಸುರಕ್ಷಿತ. ಹಸಿರು.',
    promoTitle: 'ಸುರಕ್ಷಿತ ನಗರ, ಸಂತೋಷದ ನಾಗರಿಕರು',
    promoSubtitle: '161 ಬೆಂಗಳೂರು ಪ್ರದೇಶಗಳಲ್ಲಿ ಹೈಪರ್-ಲೋಕಲ್ AI ಸಿಗ್ನಲ್ ಮತ್ತು ಸುರಕ್ಷಿತ ಸಾರಿಗೆ',
    headerTitle: 'AI ಸ್ಮಾರ್ಟ್ ಟ್ರಾಫಿಕ್ ನಿರ್ವಹಣೆ — ಬೆಂಗಳೂರು ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಕಮಾಂಡ್ ಸೆಂಟರ್',
    systemOnline: 'ಸಿಸ್ಟಮ್ ಆನ್‌ಲೈನ್',
    sidebar: {
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      signals: 'ಲೈವ್ 3D ಟ್ರಾಫಿಕ್ ನಕ್ಷೆ',
      planner: 'ಬಹು-ಮಾದರಿ ಮಾರ್ಗ ಯೋಜಕ',
      safety: 'ಮಹಿಳಾ ಸುರಕ್ಷತೆ ಮತ್ತು SOS',
      escape: 'ಸೈಡ್-ಸ್ಟ್ರೀಟ್ ಬೈಪಾಸ್',
      weather: 'ಸ್ಥಳೀಯ ಹವಾಮಾನ',
      analytics: 'ಸುಸ್ಥಿರತೆ ವಿಶ್ಲೇಷಣೆ',
      corridor: 'ಗ್ರೀನ್ ಕಾರಿಡಾರ್ ರವಾನೆ',
    },
    kpis: {
      activeEmergencies: 'ಸಕ್ರಿಯ ತುರ್ತುಸ್ಥಿತಿಗಳು',
      activeEmergenciesSub: 'ಕೋಡ್-1 ಆದ್ಯತಾ ಕಾರಿಡಾರ್‌ಗಳು',
      greenSignals: 'ಹಸಿರು ಸಿಗ್ನಲ್‌ಗಳು',
      greenSignalsSub: 'ಸಿಂಕ್ರೊನೈಸ್ಡ್ ಗ್ರೀನ್ ವೇವ್',
      activeCorridors: 'ಸಕ್ರಿಯ ಕಾರಿಡಾರ್‌ಗಳು',
      activeCorridorsSub: 'ಬೆಂಗಳೂರು ವಲಯಗಳಲ್ಲಿ',
      timeSaved: 'ಉಳಿಸಿದ ಸಮಯ',
      timeSavedSub: 'ಸರಾಸರಿ ತುರ್ತು ಮತ್ತು ಪ್ರಯಾಣ ಲಾಭ',
      minUnit: 'ನಿಮಿಷ',
    },
    map3d: {
      title: 'ಸಂವಾದಾತ್ಮಕ 3D ಐಸೋಮೆಟ್ರಿಕ್ ಬೆಂಗಳೂರು ಕಾರಿಡಾರ್ ನಕ್ಷೆ',
      subtitle: 'ಲೈವ್ ಎಮರಾಲ್ಡ್ ಗ್ರೀನ್ ಕಾರಿಡಾರ್ ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಸುರಕ್ಷಿತ ಸ್ಥಳಗಳು',
      corridorBadge: 'ಎಮರಾಲ್ಡ್ ಗ್ರೀನ್ ಕಾರಿಡಾರ್ ಸಕ್ರಿಯ',
      liveMotion: 'ಲೈವ್ 3D ಚಲನೆ',
      pausedMotion: 'ವಿರಾಮಗೊಂಡಿದೆ',
      simulateBypass: 'ರಸ್ತೆ ತಡೆ ಬೈಪಾಸ್ ಪರೀಕ್ಷಿಸಿ',
      bypassActive: 'AI ಬೈಪಾಸ್ ಸಕ್ರಿಯ',
      etaLabel: 'ತಲುಪುವ ಸಮಯ',
      distanceLabel: 'ದೂರ',
      routeProgressLabel: 'ಮಾರ್ಗ ಪ್ರಗತಿ',
      selectedPinLabel: 'ಆಯ್ಕೆಯ ಸುರಕ್ಷಿತ ಸ್ಥಳ',
      legend: {
        hospital: 'ಆಸ್ಪತ್ರೆ',
        police: 'ಪೊಲೀಸ್ ಠಾಣೆ',
        fire: 'ಅಗ್ನಿಶಾಮಕ ಠಾಣೆ',
        pharmacy: 'ಫಾರ್ಮಸಿ',
        womenHelp: 'ಮಹಿಳಾ ಸಹಾಯ ಕೇಂದ್ರ',
        metro: 'ನಮ್ಮ ಮೆಟ್ರೋ',
      },
    },
    rightPanel: {
      vehicleTitle: 'ಲೈವ್ ತುರ್ತು ಮತ್ತು ಸಾರಿಗೆ ಟ್ರ್ಯಾಕಿಂಗ್',
      vehicleSub: 'ಸಕ್ರಿಯ ಗ್ರೀನ್ ವೇವ್ ಟೆಲಿಮೆಟ್ರಿ',
      currentJunction: 'ಪ್ರಸ್ತುತ ಜಂಕ್ಷನ್',
      destinationLabel: 'ಗಮ್ಯಸ್ಥಾನ',
      etaLabel: 'ಲೈವ್ ETA',
      trackLiveBtn: 'ಲೈವ್ ಟ್ರ್ಯಾಕ್ / Google Maps ನ್ಯಾವಿಗೇಟ್',
      openCorridorDispatch: 'ಪೂರ್ಣ ರವಾನೆ ನಿಯಂತ್ರಣ ತೆರೆಯಿರಿ',
      signalStatusTitle: 'ಟ್ರಾಫಿಕ್ ಸಿಗ್ನಲ್ ಸ್ಥಿತಿ',
      signalStatusSub: 'ಪ್ರಮುಖ ಬೆಂಗಳೂರು ಜಂಕ್ಷನ್‌ಗಳು',
      statusGreen: 'ಹಸಿರು',
      statusPreparing: 'ಸಿದ್ಧವಾಗುತ್ತಿದೆ',
    },
    bottomRow: {
      routeOptionsTitle: 'AI ಮಾರ್ಗ ಆಯ್ಕೆಗಳು ಮತ್ತು ಸೈಡ್-ಸ್ಟ್ರೀಟ್ ಬೈಪಾಸ್',
      routeOptionsSub: 'ವೆಚ್ಚ, ಆರಾಮ, ಸಮಯ ಮತ್ತು ಮಹಿಳಾ ಸುರಕ್ಷತೆ ಹೋಲಿಕೆ',
      fastestRoute: 'ವೇಗದ ಮಾರ್ಗ',
      saferRoute: 'AI ಸುರಕ್ಷಿತ ಮಾರ್ಗ',
      sideStreetBypass: 'ಸೈಡ್-ಸ್ಟ್ರೀಟ್ ಬೈಪಾಸ್',
      safetyLabel: 'ಸುರಕ್ಷತೆ',
      costLabel: 'ವೆಚ್ಚ',
      comfortLabel: 'ಆರಾಮ',
      useRouteBtn: 'ಈ ಮಾರ್ಗ ಬಳಸಿ (Google Maps)',
      openFullPlannerBtn: 'ಎಲ್ಲಾ 7 ವಿಧಾನಗಳನ್ನು ಹೋಲಿಸಿ',
      activityTitle: 'ಲೈವ್ ಚಟುವಟಿಕೆ ಫೀಡ್',
      activitySub: 'ಸಿಗ್ನಲ್, ಹವಾಮಾನ, ಸುರಕ್ಷತೆ ಮತ್ತು ಗ್ರೀನ್ ವೇವ್ ಘಟನೆಗಳು',
      insightsTitle: 'ಪ್ರಮುಖ ಒಳನೋಟಗಳು',
      insightsSub: 'ಬೆಂಗಳೂರು ಸ್ಮಾರ್ಟ್ ಸಿಟಿ AI ಪ್ರಭಾವ',
      responseTimeDrop: 'ತುರ್ತು ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ',
      flowEfficiencyGain: 'ಟ್ರಾಫಿಕ್ ಹರಿವು ದಕ್ಷತೆ',
      insightsCaption: 'ಅಡಾಪ್ಟಿವ್ 3D ಸಿಗ್ನಲ್ ಸಮನ್ವಯವು ಜಂಕ್ಷನ್ ದಟ್ಟಣೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.',
    },
    weatherPage: {
      title: 'ಹೈಪರ್-ಲೋಕಲ್ ಬೆಂಗಳೂರು ಸೂಕ್ಷ್ಮ-ಹವಾಮಾನ ಎಂಜಿನ್',
      subtitle: 'ಪ್ರಮುಖ ಸಾರಿಗೆ ಕಾರಿಡಾರ್‌ಗಳಲ್ಲಿ ವಾರ್ಡ್ ಮಟ್ಟದ ತಾಪಮಾನ ಮತ್ತು ಮಳೆ ಗ್ರಿಪ್ ಮಾಹಿತಿ.',
      localityMatrixTitle: 'ಕಾರಿಡಾರ್ ಸೂಕ್ಷ್ಮ-ಹವಾಮಾನ ಮತ್ತು ರಸ್ತೆ ಗ್ರಿಪ್',
      localityMatrixSub: 'ಹಳದಿ ಸಿಗ್ನಲ್ ಬಫರ್ ಮತ್ತು ಸುರಕ್ಷಿತ ಸಾರಿಗೆ ಶಿಫಾರಸುಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹೊಂದಿಸುತ್ತದೆ.',
    },
    escapePage: {
      title: 'ಸೈಡ್-ಸ್ಟ್ರೀಟ್ ಎಸ್ಕೇಪ್ ಮತ್ತು ಬಾಟಲ್‌ನೆಕ್ ಬೈಪಾಸ್ ಸ್ಕ್ಯಾನರ್',
      subtitle: 'ಸುರಕ್ಷತೆ ಮತ್ತು ಮಳೆಗಾಲದ ಮಾರ್ಗದರ್ಶಿಗಳೊಂದಿಗೆ ಸಮಾನಾಂತರ ರಸ್ತೆಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ.',
    },
  },
  te: {
    brandTitle: 'TRAFFIC AI',
    brandTagline: 'తెలివైన. సురక్షితమైన. హరిత.',
    promoTitle: 'సురక్షిత నగరం, సంతోషకర పౌరులు',
    promoSubtitle: '161 బెంగళూరు ప్రాంతాల్లో హైపర్-లోకల్ AI సిగ్నల్స్ మరియు సురక్షిత ప్రయాణం',
    headerTitle: 'AI స్మార్ట్ ట్రాఫిక్ మేనేజ్‌మెంట్ — బెంగళూరు స్మార్ట్ సిటీ కమాండ్ సెంటర్',
    systemOnline: 'సిస్టమ్ ఆన్‌లైన్',
    sidebar: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      signals: 'లైవ్ 3D ట్రాఫిక్ మ్యాప్',
      planner: 'మల్టీ-మోడల్ రూట్ ప్లానర్',
      safety: 'మహిళా భద్రత & SOS',
      escape: 'సైడ్-స్ట్రీట్ బైపాస్',
      weather: 'హైపర్-లోకల్ వాతావరణం',
      analytics: 'సుస్థిరత విశ్లేషణ',
      corridor: 'గ్రీన్ కారిడార్ డిస్పాచ్',
    },
    kpis: {
      activeEmergencies: 'యాక్టివ్ ఎమర్జెన్సీలు',
      activeEmergenciesSub: 'కోడ్-1 ప్రియారిటీ కారిడార్లు',
      greenSignals: 'గ్రీన్ సిగ్నల్స్',
      greenSignalsSub: 'సింక్రనైజ్డ్ గ్రీన్ వేవ్',
      activeCorridors: 'యాక్టివ్ కారిడార్లు',
      activeCorridorsSub: 'బెంగళూరు జోన్లలో',
      timeSaved: 'ఆదా అయిన సమయం',
      timeSavedSub: 'సగటు అత్యవసర & ప్రయాణ లాభం',
      minUnit: 'నిమి',
    },
    map3d: {
      title: 'ఇంటరాక్టివ్ 3D ఐసోమెట్రిక్ బెంగళూరు కారిడార్ మ్యాప్',
      subtitle: 'లైవ్ ఎమరాల్డ్ గ్రీన్ కారిడార్ & సేఫ్ హెవెన్ పిన్స్',
      corridorBadge: 'ఎమరాల్డ్ గ్రీన్ కారిడార్ యాక్టివ్',
      liveMotion: 'లైవ్ 3D ఫ్లో',
      pausedMotion: 'నిలిపివేయబడింది',
      simulateBypass: 'రోడ్‌బ్లాక్ బైపాస్ అనుకరించండి',
      bypassActive: 'AI బైపాస్ యాక్టివ్',
      etaLabel: 'ETA',
      distanceLabel: 'దూరం',
      routeProgressLabel: 'రూట్ ప్రోగ్రెస్',
      selectedPinLabel: 'ఎంచుకున్న సేఫ్ హెవెన్',
      legend: {
        hospital: 'ఆసుపత్రి',
        police: 'పోలీస్ స్టేషన్',
        fire: 'ఫైర్ స్టేషన్',
        pharmacy: 'ఫార్మసీ',
        womenHelp: 'మహిళా సహాయ కేంద్రం',
        metro: 'నమ్మ మెట్రో',
      },
    },
    rightPanel: {
      vehicleTitle: 'లైవ్ ఎమర్జెన్సీ & ట్రాన్సిట్ ట్రాకింగ్',
      vehicleSub: 'యాక్టివ్ గ్రీన్ వేవ్ టెలిమెట్రీ',
      currentJunction: 'ప్రస్తుత జంక్షన్',
      destinationLabel: 'గమ్యస్థానం',
      etaLabel: 'లైవ్ ETA',
      trackLiveBtn: 'లైవ్ ట్రాక్ / Google Maps నావిగేషన్',
      openCorridorDispatch: 'పూర్తి డిస్పాచ్ కంట్రోల్ తెరవండి',
      signalStatusTitle: 'ట్రాఫిక్ సిగ్నల్ స్థితి',
      signalStatusSub: 'ప్రధాన బెంగళూరు జంక్షన్లు',
      statusGreen: 'గ్రీన్',
      statusPreparing: 'సిద్ధమవుతోంది',
    },
    bottomRow: {
      routeOptionsTitle: 'AI రూట్ ఆప్షన్లు & సైడ్-స్ట్రీట్ బైపాస్',
      routeOptionsSub: 'ధర, సౌకర్యం, సమయం & మహిళా భద్రత పోలిక',
      fastestRoute: 'వేగవంతమైన మార్గం',
      saferRoute: 'AI సురక్షిత మార్గం',
      sideStreetBypass: 'సైడ్-స్ట్రీట్ బైపాస్',
      safetyLabel: 'భద్రత',
      costLabel: 'ఖర్చు',
      comfortLabel: 'సౌకర్యం',
      useRouteBtn: 'ఈ మార్గం ఉపయోగించండి (Google Maps)',
      openFullPlannerBtn: 'అన్ని 7 మోడ్‌లు పోల్చండి',
      activityTitle: 'లైవ్ యాక్టివిటీ ఫీడ్',
      activitySub: 'సిగ్నల్స్, వాతావరణం & గ్రీన్ వేవ్ ఈవెంట్లు',
      insightsTitle: 'ముఖ్య అంతర్దృష్టులు',
      insightsSub: 'బెంగళూరు స్మార్ట్ సిటీ AI ప్రభావం',
      responseTimeDrop: 'ఎమర్జెన్సీ స్పందన సమయం',
      flowEfficiencyGain: 'ట్రాఫిక్ ఫ్లో సామర్థ్యం',
      insightsCaption: 'అడాప్టివ్ 3D సిగ్నల్ సమన్వయం ట్రాఫిక్ రద్దీని తగ్గిస్తుంది.',
    },
    weatherPage: {
      title: 'హైపర్-లోకల్ బెంగళూరు మైక్రో-వెదర్ ఇంజిన్',
      subtitle: 'ప్రధాన కారిడార్లలో ఉష్ణోగ్రత, వర్షం గ్రిప్ మరియు వాటర్‌లాగింగ్ సమాచారం.',
      localityMatrixTitle: 'కారిడార్ మైక్రో-క్లైమేట్ & రోడ్ గ్రిప్',
      localityMatrixSub: 'సిగ్నల్ బఫర్లు మరియు సురక్షిత ప్రయాణ సూచనలను స్వయంచాలకంగా సర్దుబాటు చేస్తుంది.',
    },
    escapePage: {
      title: 'సైడ్-స్ట్రీట్ ఎస్కేప్ & బాటిల్‌నెక్ బైపాస్ స్కానర్',
      subtitle: 'భద్రత మరియు వర్షాకాల నియమాలతో సమాంతర రహదారులను తనిఖీ చేయండి.',
    },
  },
  hi: {
    brandTitle: 'TRAFFIC AI',
    brandTagline: 'स्मार्ट. सुरक्षित. हरित.',
    promoTitle: 'सुरक्षित शहर, खुशहाल नागरिक',
    promoSubtitle: '161 बेंगलुरु क्षेत्रों में हाइपर-लोकल AI सिग्नल और सुरक्षित परिवहन',
    headerTitle: 'AI स्मार्ट ट्रैफिक प्रबंधन — बेंगलुरु स्मार्ट सिटी कमांड सेंटर',
    systemOnline: 'सिस्टम ऑनलाइन',
    sidebar: {
      dashboard: 'डैशबोर्ड',
      signals: 'लाइव 3D ट्रैफिक मैप',
      planner: 'मल्टी-मॉडल रूट प्लानर',
      safety: 'महिला सुरक्षा और SOS',
      escape: 'साइड-स्ट्रीट बाईपास',
      weather: 'स्थानीय मौसम',
      analytics: 'सस्टेनेबिलिटी एनालिटिक्स',
      corridor: 'ग्रीन कॉरिडोर डिस्पैच',
    },
    kpis: {
      activeEmergencies: 'सक्रिय आपातकाल',
      activeEmergenciesSub: 'कोड-1 प्राथमिकता कॉरिडोर',
      greenSignals: 'ग्रीन सिग्नल',
      greenSignalsSub: 'सिंक्रोनाइज्ड ग्रीन वेव',
      activeCorridors: 'सक्रिय कॉरिडोर',
      activeCorridorsSub: 'बेंगलुरु ज़ोन में',
      timeSaved: 'बचाया गया समय',
      timeSavedSub: 'औसत आपात व यात्रा बचत',
      minUnit: 'मिनट',
    },
    map3d: {
      title: 'इंटरैक्टिव 3D आइसोमेट्रिक बेंगलुरु कॉरिडोर मैप',
      subtitle: 'लाइव एमराल्ड ग्रीन कॉरिडोर और सत्यापित सेफ हेवन पिन',
      corridorBadge: 'एमराल्ड ग्रीन कॉरिडोर सक्रिय',
      liveMotion: 'लाइव 3D फ्लो',
      pausedMotion: 'रुका हुआ',
      simulateBypass: 'रोडब्लॉक बाईपास टेस्ट करें',
      bypassActive: 'AI बाईपास सक्रिय',
      etaLabel: 'ETA',
      distanceLabel: 'दूरी',
      routeProgressLabel: 'रूट प्रगति',
      selectedPinLabel: 'चयनित सेफ हेवन',
      legend: {
        hospital: 'अस्पताल',
        police: 'पुलिस स्टेशन',
        fire: 'फायर स्टेशन',
        pharmacy: 'फार्मेसी',
        womenHelp: 'महिला सहायता केंद्र',
        metro: 'नम्मा मेट्रो',
      },
    },
    rightPanel: {
      vehicleTitle: 'लाइव आपातकालीन और ट्रांज़िट ट्रैकिंग',
      vehicleSub: 'सक्रिय ग्रीन वेव टेलीमेट्री',
      currentJunction: 'वर्तमान जंक्शन',
      destinationLabel: 'गंतव्य',
      etaLabel: 'लाइव ETA',
      trackLiveBtn: 'लाइव ट्रैक / Google Maps नेविगेट',
      openCorridorDispatch: 'पूर्ण डिस्पैच नियंत्रण खोलें',
      signalStatusTitle: 'ट्रैफिक सिग्नल स्थिति',
      signalStatusSub: 'प्रमुख बेंगलुरु जंक्शन',
      statusGreen: 'ग्रीन',
      statusPreparing: 'तैयार हो रहा है',
    },
    bottomRow: {
      routeOptionsTitle: 'AI रूट विकल्प और साइड-स्ट्रीट बाईपास',
      routeOptionsSub: 'लागत, आराम, समय और महिला सुरक्षा तुलना',
      fastestRoute: 'सबसे तेज़ रूट',
      saferRoute: 'AI सुरक्षित रूट',
      sideStreetBypass: 'साइड-स्ट्रीट बाईपास',
      safetyLabel: 'सुरक्षा',
      costLabel: 'लागत',
      comfortLabel: 'आराम',
      useRouteBtn: 'यह रूट उपयोग करें (Google Maps)',
      openFullPlannerBtn: 'सभी 7 मोड तुलना करें',
      activityTitle: 'लाइव गतिविधि फ़ीड',
      activitySub: 'सिग्नल, मौसम, सुरक्षा और ग्रीन वेव इवेंट',
      insightsTitle: 'मुख्य अंतर्दृष्टि',
      insightsSub: 'बेंगलुरु स्मार्ट सिटी AI प्रभाव',
      responseTimeDrop: 'आपातकालीन प्रतिक्रिया समय',
      flowEfficiencyGain: 'ट्रैफिक प्रवाह दक्षता',
      insightsCaption: 'अडैप्टिव 3D सिग्नल समन्वय जंक्शन जाम कम करता है।',
    },
    weatherPage: {
      title: 'हाइपर-लोकल बेंगलुरु माइक्रो-वेदर इंजन',
      subtitle: 'प्रमुख कॉरिडोर पर वार्ड-स्तरीय तापमान, बारिश ग्रिप और जलभराव जोखिम मैट्रिक्स।',
      localityMatrixTitle: 'कॉरिडोर माइक्रो-क्लाइमेट और रोड ग्रिप',
      localityMatrixSub: 'सिग्नल येलो बफर और सुरक्षित ट्रांज़िट सुझाव स्वतः समायोजित करता है।',
    },
    escapePage: {
      title: 'साइड-स्ट्रीट एस्केप और बॉटलनेक बाईपास स्कैनर',
      subtitle: 'सुरक्षा और मानसून दिशानिर्देशों के साथ समानांतर सड़कों का मूल्यांकन करें।',
    },
  },
  ml: {
    brandTitle: 'TRAFFIC AI',
    brandTagline: 'സ്മാർട്ട്. സുരക്ഷിതം. ഹരിതം.',
    promoTitle: 'സുരക്ഷിത നഗരം, സന്തോഷമുള്ള പൗരന്മാർ',
    promoSubtitle: '161 ബെംഗളൂരു മേഖലകളിൽ ഹൈപ്പർ-ലോക്കൽ AI സിഗ്നലുകളും സുരക്ഷിത യാത്രയും',
    headerTitle: 'AI സ്മാർട്ട് ട്രാഫിക് മാനേജ്മെന്റ് — ബെംഗളൂരു സ്മാർട്ട് സിറ്റി കമാൻഡ് സെന്റർ',
    systemOnline: 'സിസ്റ്റം ഓൺലൈൻ',
    sidebar: {
      dashboard: 'ഡാഷ്ബോർഡ്',
      signals: 'ലൈവ് 3D ട്രാഫിക് മാപ്പ്',
      planner: 'മൾട്ടി-മോഡൽ റൂട്ട് പ്ലാനർ',
      safety: 'വനിതാ സുരക്ഷയും SOS-ഉം',
      escape: 'സൈഡ്-സ്ട്രീറ്റ് ബൈപാസ്',
      weather: 'പ്രാദേശിക കാലാവസ്ഥ',
      analytics: 'സുസ്ഥിരതാ അനലിറ്റിക്സ്',
      corridor: 'ഗ്രീൻ കോറിഡോർ ഡിസ്പാച്ച്',
    },
    kpis: {
      activeEmergencies: 'സജീവ അടിയന്തരാവസ്ഥകൾ',
      activeEmergenciesSub: 'കോഡ്-1 മുൻഗണനാ കോറിഡോറുകൾ',
      greenSignals: 'ഗ്രീൻ സിഗ്നലുകൾ',
      greenSignalsSub: 'സിൻക്രൊണൈസ്ഡ് ഗ്രീൻ വേവ്',
      activeCorridors: 'സജീവ കോറിഡോറുകൾ',
      activeCorridorsSub: 'ബെംഗളൂരു സോണുകളിൽ',
      timeSaved: 'ലാഭിച്ച സമയം',
      timeSavedSub: 'ശരാശരി അടിയന്തര & യാത്രാ ലാഭം',
      minUnit: 'മിനിറ്റ്',
    },
    map3d: {
      title: 'ഇന്ററാക്ടീവ് 3D ഐസോമെട്രിക് ബെംഗളൂരു കോറിഡോർ മാപ്പ്',
      subtitle: 'ലൈവ് എമറാൾഡ് ഗ്രീൻ കോറിഡോറും സുരക്ഷിത കേന്ദ്രങ്ങളും',
      corridorBadge: 'എമറാൾഡ് ഗ്രീൻ കോറിഡോർ സജീവം',
      liveMotion: 'ലൈവ് 3D ഫ്ലോ',
      pausedMotion: 'താൽക്കാലികമായി നിർത്തി',
      simulateBypass: 'റോഡ്‌ബ്ലോക്ക് ബൈപാസ് പരീക്ഷിക്കുക',
      bypassActive: 'AI ബൈപാസ് സജീവം',
      etaLabel: 'ETA',
      distanceLabel: 'ദൂരം',
      routeProgressLabel: 'റൂട്ട് പുരോഗതി',
      selectedPinLabel: 'തിരഞ്ഞെടുത്ത സുരക്ഷിത കേന്ദ്രം',
      legend: {
        hospital: 'ആശുപത്രി',
        police: 'പോലീസ് സ്റ്റേഷൻ',
        fire: 'ഫയർ സ്റ്റേഷൻ',
        pharmacy: 'ഫാർമസി',
        womenHelp: 'വനിതാ സഹായ കേന്ദ്രം',
        metro: 'നമ്മ മെട്രോ',
      },
    },
    rightPanel: {
      vehicleTitle: 'ലൈവ് എമർജൻസി & ട്രാൻസിറ്റ് ട്രാക്കിംഗ്',
      vehicleSub: 'സജീവ ഗ്രീൻ വേവ് ടെലിമെട്രി',
      currentJunction: 'നിലവിലെ ജംഗ്ഷൻ',
      destinationLabel: 'ലക്ഷ്യസ്ഥാനം',
      etaLabel: 'ലൈവ് ETA',
      trackLiveBtn: 'ലൈവ് ട്രാക്ക് / Google Maps നാവിഗേഷൻ',
      openCorridorDispatch: 'പൂർണ്ണ ഡിസ്പാച്ച് കൺട്രോൾ തുറക്കുക',
      signalStatusTitle: 'ട്രാഫിക് സിഗ്നൽ നില',
      signalStatusSub: 'പ്രധാന ബെംഗളൂരു ജംഗ്ഷനുകൾ',
      statusGreen: 'ഗ്രീൻ',
      statusPreparing: 'തയ്യാറാകുന്നു',
    },
    bottomRow: {
      routeOptionsTitle: 'AI റൂട്ട് ഓപ്ഷനുകളും സൈഡ്-സ്ട്രീറ്റ് ബൈപാസും',
      routeOptionsSub: 'ചെലവ്, സൗകര്യം, സമയം & വനിതാ സുരക്ഷാ താരതമ്യം',
      fastestRoute: 'വേഗമേറിയ റൂട്ട്',
      saferRoute: 'AI സുരക്ഷിത റൂട്ട്',
      sideStreetBypass: 'സൈഡ്-സ്ട്രീറ്റ് ബൈപാസ്',
      safetyLabel: 'സുരക്ഷ',
      costLabel: 'ചെലവ്',
      comfortLabel: 'സൗകര്യം',
      useRouteBtn: 'ഈ റൂട്ട് ഉപയോഗിക്കുക (Google Maps)',
      openFullPlannerBtn: 'എല്ലാ 7 മോഡുകളും താരതമ്യം ചെയ്യുക',
      activityTitle: 'ലൈവ് ആക്റ്റിവിറ്റി ഫീഡ്',
      activitySub: 'സിഗ്നൽ, കാലാവസ്ഥ, സുരക്ഷാ & ഗ്രീൻ വേവ് ഇവന്റുകൾ',
      insightsTitle: 'പ്രധാന ഉൾക്കാഴ്ചകൾ',
      insightsSub: 'ബെംഗളൂരു സ്മാർട്ട് സിറ്റി AI സ്വാധീനം',
      responseTimeDrop: 'അടിയന്തര പ്രതികരണ സമയം',
      flowEfficiencyGain: 'ട്രാഫിക് ഫ്ലോ കാര്യക്ഷമത',
      insightsCaption: 'അഡാപ്റ്റീവ് 3D സിഗ്നൽ ഏകോപനം ഗതാഗതക്കുരുക്ക് കുറയ്ക്കുന്നു.',
    },
    weatherPage: {
      title: 'ഹൈപ്പർ-ലോക്കൽ ബെംഗളൂരു മൈക്രോ-വെതർ എഞ്ചിൻ',
      subtitle: 'പ്രധാന കോറിഡോറുകളിലെ താപനില, മഴ ഗ്രിപ്പ്, വെള്ളക്കെട്ട് സാധ്യതകൾ.',
      localityMatrixTitle: 'കോറിഡോർ മൈക്രോ-ക്ലൈമറ്റും റോഡ് ഗ്രിപ്പും',
      localityMatrixSub: 'സിഗ്നൽ ബഫറുകളും സുരക്ഷിത യാത്രാ നിർദ്ദേശങ്ങളും സ്വയമേവ ക്രമീകരിക്കുന്നു.',
    },
    escapePage: {
      title: 'സൈഡ്-സ്ട്രീറ്റ് എസ്കേപ്പ് & ബോട്ടിൽനെക്ക് ബൈപാസ് സ്കാനർ',
      subtitle: 'സുരക്ഷയും മഴക്കാല മാർഗ്ഗനിർദ്ദേശങ്ങളും പാലിച്ച് സമാന്തര റോഡുകൾ പരിശോധിക്കുക.',
    },
  },
  ta: {
    brandTitle: 'TRAFFIC AI',
    brandTagline: 'புத்திசாலி. பாதுகாப்பான. பசுமை.',
    promoTitle: 'பாதுகாப்பான நகரம், மகிழ்ச்சியான குடிமக்கள்',
    promoSubtitle: '161 பெங்களூரு பகுதிகளில் ஹைப்பர்-லோக்கல் AI சிக்னல் மற்றும் பாதுகாப்பான பயணம்',
    headerTitle: 'AI ஸ்மார்ட் போக்குவரத்து மேலாண்மை — பெங்களூரு ஸ்மார்ட் சிட்டி கமாண்ட் சென்டர்',
    systemOnline: 'சிஸ்டம் ஆன்லைன்',
    sidebar: {
      dashboard: 'டாஷ்போர்டு',
      signals: 'லைவ் 3D போக்குவரத்து வரைபடம்',
      planner: 'பல-முறை வழித்தட திட்டமிடல்',
      safety: 'பெண்கள் பாதுகாப்பு & SOS',
      escape: 'பக்கவாட்டு சாலை பைபாஸ்',
      weather: 'உள்ளூர் வானிலை',
      analytics: 'நிலைத்தன்மை பகுப்பாய்வு',
      corridor: 'கிரீன் காரிடார் அனுப்புகை',
    },
    kpis: {
      activeEmergencies: 'செயலில் உள்ள அவசரநிலைகள்',
      activeEmergenciesSub: 'கோட்-1 முன்னுரிமை வழித்தடங்கள்',
      greenSignals: 'பச்சை சிக்னல்கள்',
      greenSignalsSub: 'ஒருங்கிணைந்த பச்சை அலை',
      activeCorridors: 'செயலில் உள்ள காரிடார்கள்',
      activeCorridorsSub: 'பெங்களூரு மண்டலங்களில்',
      timeSaved: 'சேமித்த நேரம்',
      timeSavedSub: 'சராசரி அவசர & பயண சேமிப்பு',
      minUnit: 'நிமி',
    },
    map3d: {
      title: 'ஊடாடும் 3D ஐசோமெட்ரிக் பெங்களூரு காரிடார் வரைபடம்',
      subtitle: 'நேரடி எமரால்டு கிரீன் காரிடார் & பாதுகாப்பான இடங்கள்',
      corridorBadge: 'எமரால்டு கிரீன் காரிடார் செயல்பாட்டில்',
      liveMotion: 'லைவ் 3D இயக்கம்',
      pausedMotion: 'நிறுத்தப்பட்டது',
      simulateBypass: 'சாலை தடை பைபாஸ் சோதிக்கவும்',
      bypassActive: 'AI பைபாஸ் செயல்பாட்டில்',
      etaLabel: 'ETA',
      distanceLabel: 'தூரம்',
      routeProgressLabel: 'வழி முன்னேற்றம்',
      selectedPinLabel: 'தேர்ந்தெடுக்கப்பட்ட பாதுகாப்பு இடம்',
      legend: {
        hospital: 'மருத்துவமனை',
        police: 'காவல் நிலையம்',
        fire: 'தீயணைப்பு நிலையம்',
        pharmacy: 'மருந்தகம்',
        womenHelp: 'பெண்கள் உதவி மையம்',
        metro: 'நம்ம மெட்ரோ',
      },
    },
    rightPanel: {
      vehicleTitle: 'நேரடி அவசர & போக்குவரத்து கண்காணிப்பு',
      vehicleSub: 'செயலில் உள்ள கிரீன் வேவ் டெலிமெட்ரி',
      currentJunction: 'தற்போதைய சந்திப்பு',
      destinationLabel: 'சேருமிடம்',
      etaLabel: 'நேரடி ETA',
      trackLiveBtn: 'நேரடி கண்காணிப்பு / Google Maps',
      openCorridorDispatch: 'முழு அனுப்புகை கட்டுப்பாட்டைத் திற',
      signalStatusTitle: 'போக்குவரத்து சிக்னல் நிலை',
      signalStatusSub: 'முக்கிய பெங்களூரு சந்திப்புகள்',
      statusGreen: 'பச்சை',
      statusPreparing: 'தயாராகிறது',
    },
    bottomRow: {
      routeOptionsTitle: 'AI வழித்தட விருப்பங்கள் & பக்கவாட்டு பைபாஸ்',
      routeOptionsSub: 'செலவு, வசதி, நேரம் & பெண்கள் பாதுகாப்பு ஒப்பீடு',
      fastestRoute: 'வேகமான வழி',
      saferRoute: 'AI பாதுகாப்பான வழி',
      sideStreetBypass: 'பக்கவாட்டு பைபாஸ்',
      safetyLabel: 'பாதுகாப்பு',
      costLabel: 'செலவு',
      comfortLabel: 'வசதி',
      useRouteBtn: 'இந்த வழியைப் பயன்படுத்து (Google Maps)',
      openFullPlannerBtn: 'அனைத்து 7 முறைகளையும் ஒப்பிடு',
      activityTitle: 'நேரடி செயல்பாட்டு ஊட்டம்',
      activitySub: 'சிக்னல்கள், வானிலை & கிரீன் வேவ் நிகழ்வுகள்',
      insightsTitle: 'முக்கிய நுண்ணறிவுகள்',
      insightsSub: 'பெங்களூரு ஸ்மார்ட் சிட்டி AI தாக்கம்',
      responseTimeDrop: 'அவசர பதில் நேரம்',
      flowEfficiencyGain: 'போக்குவரத்து ஓட்ட திறன்',
      insightsCaption: 'அடாப்டிவ் 3D சிக்னல் ஒருங்கிணைப்பு நெரிசலைக் குறைக்கிறது.',
    },
    weatherPage: {
      title: 'ஹைப்பர்-லோக்கல் பெங்களூரு நுண்-வானிலை இயந்திரம்',
      subtitle: 'முக்கிய வழித்தடங்களில் வெப்பநிலை, மழை பிடிப்பு மற்றும் நீர் தேங்கல் அபாய விவரம்.',
      localityMatrixTitle: 'வழித்தட நுண்-வானிலை & சாலை பிடிப்பு',
      localityMatrixSub: 'சிக்னல் இடைவெளி மற்றும் பாதுகாப்பான பயண பரிந்துரைகளை தானாக அமைக்கிறது.',
    },
    escapePage: {
      title: 'பக்கவாட்டு சாலை தப்பிப்பு & நெரிசல் பைபாஸ் ஸ்கேனர்',
      subtitle: 'பாதுகாப்பு மற்றும் பருவமழை வழிகாட்டுதல்களுடன் இணை சாலைகளை மதிப்பீடு செய்யுங்கள்.',
    },
  },
  mr: {
    brandTitle: 'TRAFFIC AI',
    brandTagline: 'स्मार्ट. सुरक्षित. हरित.',
    promoTitle: 'सुरक्षित शहर, आनंदी नागरिक',
    promoSubtitle: '161 बेंगळुरू भागांत हायपर-लोकल AI सिग्नल आणि सुरक्षित प्रवास',
    headerTitle: 'AI स्मार्ट ट्रॅफिक व्यवस्थापन — बेंगळुरू स्मार्ट सिटी कमांड सेंटर',
    systemOnline: 'सिस्टम ऑनलाइन',
    sidebar: {
      dashboard: 'डॅशबोर्ड',
      signals: 'लाइव्ह 3D ट्रॅफिक मॅप',
      planner: 'मल्टी-मॉडल रूट प्लॅनर',
      safety: 'महिला सुरक्षा आणि SOS',
      escape: 'साइड-स्ट्रीट बायपास',
      weather: 'स्थानिक हवामान',
      analytics: 'शाश्वतता विश्लेषण',
      corridor: 'ग्रीन कॉरिडॉर डिस्पॅच',
    },
    kpis: {
      activeEmergencies: 'सक्रिय आणीबाणी',
      activeEmergenciesSub: 'कोड-1 प्राधान्य कॉरिडॉर',
      greenSignals: 'ग्रीन सिग्नल',
      greenSignalsSub: 'सिंक्रोनाइज्ड ग्रीन वेव्ह',
      activeCorridors: 'सक्रिय कॉरिडॉर',
      activeCorridorsSub: 'बेंगळुरू झोनमध्ये',
      timeSaved: 'वाचवलेला वेळ',
      timeSavedSub: 'सरासरी आणीबाणी व प्रवास बचत',
      minUnit: 'मिनिटे',
    },
    map3d: {
      title: 'इंटरअॅक्टिव्ह 3D आयसोमेट्रिक बेंगळुरू कॉरिडॉर मॅप',
      subtitle: 'लाइव्ह एमराल्ड ग्रीन कॉरिडॉर आणि सत्यापित सेफ हेवन पिन',
      corridorBadge: 'एमराल्ड ग्रीन कॉरिडॉर सक्रिय',
      liveMotion: 'लाइव्ह 3D फ्लो',
      pausedMotion: 'थांबवले',
      simulateBypass: 'रोडब्लॉक बायपास तपासा',
      bypassActive: 'AI बायपास सक्रिय',
      etaLabel: 'ETA',
      distanceLabel: 'अंतर',
      routeProgressLabel: 'मार्ग प्रगती',
      selectedPinLabel: 'निवडलेले सुरक्षित ठिकाण',
      legend: {
        hospital: 'रुग्णालय',
        police: 'पोलीस स्टेशन',
        fire: 'अग्निशमन केंद्र',
        pharmacy: 'फार्मसी',
        womenHelp: 'महिला मदत केंद्र',
        metro: 'नम्मा मेट्रो',
      },
    },
    rightPanel: {
      vehicleTitle: 'लाइव्ह आणीबाणी आणि ट्रान्झिट ट्रॅकिंग',
      vehicleSub: 'सक्रिय ग्रीन वेव्ह टेलीमेट्री',
      currentJunction: 'सध्याचे जंक्शन',
      destinationLabel: 'गंतव्यस्थान',
      etaLabel: 'लाइव्ह ETA',
      trackLiveBtn: 'लाइव्ह ट्रॅक / Google Maps नेव्हिगेट',
      openCorridorDispatch: 'संपूर्ण डिस्पॅच नियंत्रण उघडा',
      signalStatusTitle: 'ट्रॅफिक सिग्नल स्थिती',
      signalStatusSub: 'प्रमुख बेंगळुरू जंक्शन्स',
      statusGreen: 'ग्रीन',
      statusPreparing: 'तयारी सुरू',
    },
    bottomRow: {
      routeOptionsTitle: 'AI मार्ग पर्याय आणि साइड-स्ट्रीट बायपास',
      routeOptionsSub: 'खर्च, आराम, वेळ आणि महिला सुरक्षा तुलना',
      fastestRoute: 'सर्वात वेगवान मार्ग',
      saferRoute: 'AI सुरक्षित मार्ग',
      sideStreetBypass: 'साइड-स्ट्रीट बायपास',
      safetyLabel: 'सुरक्षा',
      costLabel: 'खर्च',
      comfortLabel: 'आराम',
      useRouteBtn: 'हा मार्ग वापरा (Google Maps)',
      openFullPlannerBtn: 'सर्व 7 पर्याय पहा',
      activityTitle: 'लाइव्ह अ‍ॅक्टिव्हिटी फीड',
      activitySub: 'सिग्नल, हवामान, सुरक्षा आणि ग्रीन वेव्ह घडामोडी',
      insightsTitle: 'मुख्य निष्कर्ष',
      insightsSub: 'बेंगळुरू स्मार्ट सिटी AI प्रभाव',
      responseTimeDrop: 'आणीबाणी प्रतिसाद वेळ',
      flowEfficiencyGain: 'ट्रॅफिक प्रवाह कार्यक्षमता',
      insightsCaption: 'अडॅप्टिव्ह 3D सिग्नल समन्वयामुळे वाहतूक कोंडी कमी होते.',
    },
    weatherPage: {
      title: 'हायपर-लोकल बेंगळुरू मायक्रो-वेदर इंजिन',
      subtitle: 'प्रमुख कॉरिडॉरवरील तापमान, पावसाची पकड आणि पाणी साचण्याचा धोका.',
      localityMatrixTitle: 'कॉरिडॉर मायक्रो-क्लायमेट आणि रोड ग्रिप',
      localityMatrixSub: 'सिग्नल बफर आणि सुरक्षित प्रवास शिफारसी आपोआप जुळवून घेते.',
    },
    escapePage: {
      title: 'साइड-स्ट्रीट एस्केप आणि बॉटलनेक बायपास स्कॅनर',
      subtitle: 'सुरक्षा आणि पावसाळी मार्गदर्शक तत्त्वांसह समांतर रस्त्यांचे मूल्यांकन करा.',
    },
  },
};
