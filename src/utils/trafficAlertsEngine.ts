import {
  Corridor,
  SignalMode,
  TrafficAlertIncident,
  TrafficScenario,
  WeatherCondition,
} from '../types/traffic';

interface BaseAlertTemplate {
  id: string;
  corridorId: string;
  junctionName: string;
  category: TrafficAlertIncident['category'];
  categoryLabel: string;
  severity: TrafficAlertIncident['severity'];
  headline: string;
  details: string;
  laneImpact: string;
  baseDelayMin: number;
  adaptiveMitigation: string;
  staticImpactNote: string;
  reportedAgoSec: number;
}

const CORRIDOR_BASE_ALERTS: Record<string, BaseAlertTemplate[]> = {
  'orr-east': [
    {
      id: 'orr-silkboard-bottleneck',
      corridorId: 'orr-east',
      junctionName: 'Central Silk Board Junction',
      category: 'bottleneck',
      categoryLabel: 'Arterial Bottleneck',
      severity: 'critical',
      headline: 'Severe merge bottleneck at Central Silk Board – Hosur Flyover Loop',
      details:
        'Heavy tech-shuttle & BMTC bus convergence from BTM 2nd Stage and HSR Layout choking eastbound ORR service lane.',
      laneImpact: '2 of 3 service lanes congested',
      baseDelayMin: 18,
      adaptiveMitigation:
        'AI Adaptive holding +16s ORR green wave and throttling cross-ramp inflow.',
      staticImpactNote:
        'Fixed 120s timer causing 440m+ upstream queue spillover toward Agara.',
      reportedAgoSec: 90,
    },
    {
      id: 'orr-bellandur-roadwork',
      corridorId: 'orr-east',
      junctionName: 'Bellandur Ecospace Junction',
      category: 'roadwork',
      categoryLabel: 'Utility Roadwork',
      severity: 'high',
      headline: 'BWSSB storm-drain concrete slab replacement near Ecospace Gate 2',
      details:
        'Barricaded outer lane along Bellandur Lake stretch; morning office cabs merging abruptly at Iblur–Ecospace ramp.',
      laneImpact: '1 left lane closed (350m work zone)',
      baseDelayMin: 14,
      adaptiveMitigation:
        'AI Adaptive shifting feeder signal cadence to prevent Ecospace tailback.',
      staticImpactNote:
        'Unadjusted cycle locking Bellandur flyover descent during peak arrivals.',
      reportedAgoSec: 420,
    },
    {
      id: 'orr-krpuram-metro',
      corridorId: 'orr-east',
      junctionName: 'KR Puram Tin Factory',
      category: 'metro_work',
      categoryLabel: 'Metro Interchange Pinch',
      severity: 'high',
      headline: 'Blue Line pier median narrowing at KR Puram Hanging Bridge approach',
      details:
        'Intercity buses stopping near Tin Factory subway ramp restricting throughput toward Mahadevapura & Whitefield.',
      laneImpact: 'Rightmost carriageway narrowed',
      baseDelayMin: 15,
      adaptiveMitigation:
        'AI Adaptive pulsing Whitefield-bound green wave +17s to clear bridge deck.',
      staticImpactNote:
        'Static phase splits leave Old Madras Road merge stalled 98s per cycle.',
      reportedAgoSec: 780,
    },
  ],
  'north-airport': [
    {
      id: 'north-hebbal-bottleneck',
      corridorId: 'north-airport',
      junctionName: 'Hebbal Flyover Loop',
      category: 'bottleneck',
      categoryLabel: 'Arterial Bottleneck',
      severity: 'critical',
      headline: 'Multi-ramp weaving bottleneck at Hebbal Flyover & ORR Trumpet',
      details:
        'Airport Vayu Vajra buses and Tumakuru–KR Puram ORR freight merging simultaneously across 2 elevated lanes.',
      laneImpact: 'All 3 inbound lanes slowing to 9 km/h',
      baseDelayMin: 19,
      adaptiveMitigation:
        'AI Adaptive metering Bellary Rd approach and holding +18s flyover green.',
      staticImpactNote:
        'Fixed timing compounding Estes Nagar–Kodigehalli inbound backlog.',
      reportedAgoSec: 120,
    },
    {
      id: 'north-nagavara-metro',
      corridorId: 'north-airport',
      junctionName: 'Nagavara Manyata Junction',
      category: 'metro_work',
      categoryLabel: 'Metro & Roadwork',
      severity: 'high',
      headline: 'Pink & Blue Line interchange barricade at Nagavara Ring Road',
      details:
        'Sheet-piling and utility shifting near Manyata Tech Park Gate 3 compressing turning radius for outbound traffic.',
      laneImpact: '1 lane diverted to service road',
      baseDelayMin: 13,
      adaptiveMitigation:
        'AI Adaptive prioritizing Manyata exit burst & syncing Hennur cross-phase.',
      staticImpactNote:
        'Static 88s red phase creates 375m queue inside tech park service road.',
      reportedAgoSec: 540,
    },
    {
      id: 'north-yelahanka-roadwork',
      corridorId: 'north-airport',
      junctionName: 'Yelahanka Bypass Circle',
      category: 'roadwork',
      categoryLabel: 'NHAI Resurfacing',
      severity: 'moderate',
      headline: 'Night-to-morning asphalt milling on Yelahanka Bypass service lane',
      details:
        'Heavy machinery clearing near Kogilu Cross ramp; airport expressway main lanes remain open.',
      laneImpact: 'Service road shoulder restricted',
      baseDelayMin: 8,
      adaptiveMitigation:
        'AI Adaptive smoothing Jakkur–Yelahanka green progression.',
      staticImpactNote:
        'Fixed offsets force unnecessary stops at consecutive airport signals.',
      reportedAgoSec: 960,
    },
  ],
  'central-cbd': [
    {
      id: 'cbd-richmond-roadwork',
      corridorId: 'central-cbd',
      junctionName: 'Richmond Circle',
      category: 'roadwork',
      categoryLabel: 'BBMP Roadwork',
      severity: 'high',
      headline: 'BESCOM underground 66kV cable ducting at Richmond – Residency Cross',
      details:
        'Trench plating across eastbound Residency Road approach; double-parking near Richmond flyover ramp.',
      laneImpact: '1 of 2 turning lanes blocked',
      baseDelayMin: 12,
      adaptiveMitigation:
        'AI Adaptive extending Residency–Brigade green clearance by +12s.',
      staticImpactNote:
        'Fixed 90s red causes spillback past Cash Pharmacy junction.',
      reportedAgoSec: 210,
    },
    {
      id: 'cbd-krmarket-bottleneck',
      corridorId: 'central-cbd',
      junctionName: 'KR Market Town Hall Cross',
      category: 'bottleneck',
      categoryLabel: 'Market Chokepoint',
      severity: 'critical',
      headline: 'Wholesale freight unloading & BMTC feeder spillover at KR Market',
      details:
        'Dense pedestrian crossings and slow-moving goods autos beneath Mysuru Road flyover ramp.',
      laneImpact: 'Curbside lane obstructed',
      baseDelayMin: 16,
      adaptiveMitigation:
        'AI Adaptive batching Green Line pedestrian bursts with bus bay release.',
      staticImpactNote:
        'Rigid cycle leaves Mysuru flyover descent jammed for two full cycles.',
      reportedAgoSec: 360,
    },
    {
      id: 'cbd-trinity-bottleneck',
      corridorId: 'central-cbd',
      junctionName: 'Trinity Circle',
      category: 'bottleneck',
      categoryLabel: 'Intersection Surge',
      severity: 'moderate',
      headline: 'MG Road – Ulsoor arterial surge compressing Trinity rotary merge',
      details:
        'High office shuttle volume entering from Old Airport Road toward Anil Kumble Circle.',
      laneImpact: 'Rotary outer lane congested',
      baseDelayMin: 9,
      adaptiveMitigation:
        'AI Adaptive holding MG Road green wave to keep Trinity rotary clear.',
      staticImpactNote:
        'Uncoordinated timing stalls cross-traffic inside Trinity Circle.',
      reportedAgoSec: 690,
    },
  ],
  'south-tech': [
    {
      id: 'south-jayadeva-metro',
      corridorId: 'south-tech',
      junctionName: 'Jayadeva Interchange Signal',
      category: 'metro_work',
      categoryLabel: 'Metro & Flyover Work',
      severity: 'critical',
      headline: 'Yellow–Pink Line multi-level ramp finishing at Jayadeva Circle',
      details:
        'Construction barricades around Ragigudda double-decker ramp narrowing Bannerghatta–BTM merge.',
      laneImpact: '2 lanes merged to 1 at rotary',
      baseDelayMin: 17,
      adaptiveMitigation:
        'AI Adaptive synchronizing Ragigudda flyover release with BTM phase.',
      staticImpactNote:
        'Fixed 92s cross-red backs up vehicles toward Dairy Circle.',
      reportedAgoSec: 150,
    },
    {
      id: 'south-bommanahalli-bottleneck',
      corridorId: 'south-tech',
      junctionName: 'Bommanahalli Hosur Signal',
      category: 'bottleneck',
      categoryLabel: 'Expressway Ramp Pinch',
      severity: 'high',
      headline: 'Electronic City Elevated Toll ramp bottleneck at Bommanahalli',
      details:
        'Interstate heavy trucks and IT buses converging onto Hosur Road surface carriageway.',
      laneImpact: 'Surface slip-road saturated',
      baseDelayMin: 14,
      adaptiveMitigation:
        'AI Adaptive balancing surface vs ramp green windows (-54% wait).',
      staticImpactNote:
        'Fixed signal holds Hosur Road queues past Roopena Agrahara.',
      reportedAgoSec: 480,
    },
    {
      id: 'south-hulimavu-roadwork',
      corridorId: 'south-tech',
      junctionName: 'Hulimavu Meenakshi Junction',
      category: 'roadwork',
      categoryLabel: 'Waterline Roadwork',
      severity: 'moderate',
      headline: 'Cauvery Stage V pipeline valve inspection on Bannerghatta Road',
      details:
        'Single-lane diversion near Meenakshi Mall U-turn bay affecting Gottigere-bound buses.',
      laneImpact: 'U-turn bay partially restricted',
      baseDelayMin: 10,
      adaptiveMitigation:
        'AI Adaptive shortening opposing U-turn phase to keep arterial flowing.',
      staticImpactNote:
        'Unadjusted timer amplifies queue buildup toward Arekere Gate.',
      reportedAgoSec: 840,
    },
  ],
  'west-industrial': [
    {
      id: 'west-gorguntepalya-bottleneck',
      corridorId: 'west-industrial',
      junctionName: 'Gorguntepalya ORR Junction',
      category: 'bottleneck',
      categoryLabel: 'Freight Bottleneck',
      severity: 'critical',
      headline: 'NH-48 Tumakuru freight & ORR merge gridlock at Gorguntepalya',
      details:
        'Multi-axle trucks exiting Peenya Industrial Estate competing with Yeshwanthpur-bound Metro feeders.',
      laneImpact: '2 outer freight lanes stalled',
      baseDelayMin: 18,
      adaptiveMitigation:
        'AI Adaptive extending Tumakuru–ORR green clearance +16s.',
      staticImpactNote:
        'Static 96s red phase backs up trucks past Jalahalli Cross.',
      reportedAgoSec: 110,
    },
    {
      id: 'west-yeshwanthpur-roadwork',
      corridorId: 'west-industrial',
      junctionName: 'Yeshwanthpur Circle',
      category: 'roadwork',
      categoryLabel: 'Rail Forecourt Work',
      severity: 'high',
      headline: 'Railway station multimodal plaza cabling near Yeshwanthpur Flyover',
      details:
        'Auto-rickshaw bay relocation squeezing Mathikere–Chord Road approach.',
      laneImpact: '1 station-side lane closed',
      baseDelayMin: 12,
      adaptiveMitigation:
        'AI Adaptive syncing Green Line exit surges with Chord Road green wave.',
      staticImpactNote:
        'Fixed splits create persistent congestion under Yeshwanthpur flyover.',
      reportedAgoSec: 510,
    },
    {
      id: 'west-peenya-roadwork',
      corridorId: 'west-industrial',
      junctionName: 'Peenya 2nd Stage Cross',
      category: 'roadwork',
      categoryLabel: 'Culvert Repair',
      severity: 'moderate',
      headline: 'Stormwater culvert grating replacement near Peenya Industrial Gate',
      details:
        'Steel plates over outer carriageway slowing industrial shift buses.',
      laneImpact: 'Speed-restricted 150m zone',
      baseDelayMin: 8,
      adaptiveMitigation:
        'AI Adaptive maintaining steady 28+ km/h industrial progression.',
      staticImpactNote:
        'Fixed cycles interrupt freight platoon momentum at every cross.',
      reportedAgoSec: 900,
    },
  ],
  'southwest-mysuru': [
    {
      id: 'sw-nayandahalli-bottleneck',
      corridorId: 'southwest-mysuru',
      junctionName: 'Nayandahalli Ring Rd Cross',
      category: 'bottleneck',
      categoryLabel: 'Ring Road Bottleneck',
      severity: 'critical',
      headline: 'NICE Link & Outer Ring Road merge congestion at Nayandahalli',
      details:
        'KSRTC Mysuru express buses and ORR heavy vehicles converging beneath Purple Line viaduct.',
      laneImpact: '2 arterial lanes heavily slowed',
      baseDelayMin: 16,
      adaptiveMitigation:
        'AI Adaptive pulsing Mysuru Rd green wave and clearing ORR slip ramp.',
      staticImpactNote:
        'Fixed 92s cross-red stalls vehicles back to Deepanjali Nagar.',
      reportedAgoSec: 140,
    },
    {
      id: 'sw-rrnagar-roadwork',
      corridorId: 'southwest-mysuru',
      junctionName: 'RR Nagar Arch Gate',
      category: 'roadwork',
      categoryLabel: 'White-Topping Work',
      severity: 'high',
      headline: 'BBMP white-topping curing barricade near RR Nagar Arch entry',
      details:
        'Right-turn pocket toward BEML Layout narrowed during concrete curing window.',
      laneImpact: '1 turning lane barricaded',
      baseDelayMin: 11,
      adaptiveMitigation:
        'AI Adaptive reallocating green seconds to Mysuru Road straight-through flow.',
      staticImpactNote:
        'Fixed phase wastes 24s on blocked right-turn pocket.',
      reportedAgoSec: 570,
    },
    {
      id: 'sw-kengeri-bottleneck',
      corridorId: 'southwest-mysuru',
      junctionName: 'Kengeri Bus Terminal Signal',
      category: 'bottleneck',
      categoryLabel: 'Intercity Bus Surge',
      severity: 'moderate',
      headline: 'Satellite bus terminal exit queues merging onto Mysuru Expressway',
      details:
        'Peak intercity departures slowing inbound & outbound service road ramps.',
      laneImpact: 'Terminal exit lane congested',
      baseDelayMin: 9,
      adaptiveMitigation:
        'AI Adaptive coordinating Purple Line feeder egress with NICE ramp.',
      staticImpactNote:
        'Static 72s red traps KSRTC coaches inside terminal exit.',
      reportedAgoSec: 780,
    },
  ],
};

function formatReportedAgo(baseSec: number, tickSeconds: number): string {
  const dynamicSec = (baseSec + tickSeconds) % 1200;
  if (dynamicSec < 60) return `${dynamicSec}s ago`;
  const mins = Math.floor(dynamicSec / 60);
  return `${mins}m ago`;
}

export function getCorridorTrafficAlerts(
  corridor: Corridor,
  scenario: TrafficScenario,
  weatherCondition: WeatherCondition,
  tickSeconds: number,
  signalMode: SignalMode
): TrafficAlertIncident[] {
  const templates =
    CORRIDOR_BASE_ALERTS[corridor.id] || CORRIDOR_BASE_ALERTS['orr-east'];
  const isAdaptive = signalMode === 'adaptive';

  const scenarioFactor =
    scenario === 'off_peak'
      ? 0.55
      : scenario === 'evening_gridlock'
        ? 1.32
        : scenario === 'emergency_green_wave'
          ? 0.72
          : 1.0;

  const weatherExtraMin =
    weatherCondition === 'heavy_rain'
      ? 7
      : weatherCondition === 'light_rain'
        ? 3
        : weatherCondition === 'morning_fog'
          ? 3
          : weatherCondition === 'extreme_heat'
            ? 2
            : 0;

  const mapped: TrafficAlertIncident[] = templates.map((tpl) => {
    const rawDelay = Math.round(tpl.baseDelayMin * scenarioFactor + weatherExtraMin);
    const estDelayMin = Math.max(
      2,
      isAdaptive ? Math.round(rawDelay * 0.45) : rawDelay
    );

    const elevatedSeverity: TrafficAlertIncident['severity'] =
      weatherCondition === 'heavy_rain' || scenario === 'evening_gridlock'
        ? tpl.severity === 'moderate'
          ? 'high'
          : 'critical'
        : tpl.severity;

    return {
      id: tpl.id,
      corridorId: tpl.corridorId,
      junctionName: tpl.junctionName,
      category: tpl.category,
      categoryLabel: tpl.categoryLabel,
      severity: elevatedSeverity,
      headline: tpl.headline,
      details: tpl.details,
      laneImpact: tpl.laneImpact,
      estDelayMin,
      aiMitigationNote: isAdaptive
        ? tpl.adaptiveMitigation
        : tpl.staticImpactNote,
      reportedAgo: formatReportedAgo(tpl.reportedAgoSec, tickSeconds),
    };
  });

  // Dynamically inject condition-specific simulated feed alerts at the front
  if (weatherCondition === 'heavy_rain') {
    const leadJunction = corridor.intersections[0];
    mapped.unshift({
      id: `${corridor.id}-rain-waterlogging`,
      corridorId: corridor.id,
      junctionName: leadJunction.name,
      category: 'waterlogging',
      categoryLabel: 'Weather Waterlogging',
      severity: 'critical',
      headline: `Stormwater pooling & low friction (0.68) at ${leadJunction.name}`,
      details: `Heavy monsoon downpour (22mm/hr) reducing discharge rate by 32% along ${corridor.shortName} near ${leadJunction.landmark}; Panathur Underpass & Silk Board pumps active.`,
      laneImpact: 'Curbside lane waterlogged (0.3m depth)',
      estDelayMin: isAdaptive ? 9 : 21,
      aiMitigationNote: isAdaptive
        ? 'AI Adaptive extended Yellow +2s wet-braking buffer & lengthened drainage corridor green wave.'
        : 'Static fixed timer cannot clear waterlogged tailback; queues growing rapidly.',
      reportedAgo: formatReportedAgo(24, tickSeconds),
    });
  } else if (weatherCondition === 'morning_fog') {
    const leadJunction = corridor.intersections[0];
    mapped.unshift({
      id: `${corridor.id}-morning-fog`,
      corridorId: corridor.id,
      junctionName: leadJunction.name,
      category: 'bottleneck',
      categoryLabel: 'Low-Visibility Fog',
      severity: 'high',
      headline: `Dense early-morning mist (<180m visibility) at ${leadJunction.name}`,
      details: `Reduced braking sight distance along ${corridor.shortName}; cautious approach platoons slowing merge points.`,
      laneImpact: 'Speed-advised 25 km/h visibility zone',
      estDelayMin: isAdaptive ? 4 : 11,
      aiMitigationNote: isAdaptive
        ? 'AI Adaptive added +2s Yellow safety buffer & smoothed green-wave progression.'
        : 'Static timer forces abrupt braking cycles under dense morning mist.',
      reportedAgo: formatReportedAgo(35, tickSeconds),
    });
  }

  if (scenario === 'emergency_green_wave') {
    const hubJunction =
      corridor.intersections[Math.min(1, corridor.intersections.length - 1)];
    mapped.unshift({
      id: `${corridor.id}-emergency-priority`,
      corridorId: corridor.id,
      junctionName: hubJunction.name,
      category: 'emergency_clearance',
      categoryLabel: 'Emergency Corridor Priority',
      severity: 'critical',
      headline: `108 Ambulance & BMTC priority corridor clearance active via ${hubJunction.name}`,
      details: `All cross-street phases preempted along ${corridor.shortName} to keep emergency spine unobstructed.`,
      laneImpact: 'Right arterial lane reserved for emergency wave',
      estDelayMin: isAdaptive ? 2 : 11,
      aiMitigationNote: isAdaptive
        ? 'AI Green-Wave lock holding 70s+ continuous green across all corridor signals.'
        : 'Manual traffic marshal clearance required; static timers uncoordinated.',
      reportedAgo: formatReportedAgo(12, tickSeconds),
    });
  }

  return mapped;
}

export function selectActiveTrafficAlert(
  alerts: TrafficAlertIncident[],
  tickSeconds: number,
  manualOffset: number = 0,
  autoRotateSec: number = 12
): {
  activeAlert: TrafficAlertIncident;
  activeIndex: number;
  totalCount: number;
} {
  const totalCount = alerts.length;
  const autoIndex = Math.floor(tickSeconds / autoRotateSec);
  const normalized =
    (((autoIndex + manualOffset) % totalCount) + totalCount) % totalCount;

  return {
    activeAlert: alerts[normalized],
    activeIndex: normalized,
    totalCount,
  };
}
