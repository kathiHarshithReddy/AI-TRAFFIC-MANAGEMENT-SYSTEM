import {
  BottleneckId,
  SideStreetFilterReason,
  SideStreetVerdict,
  VehicleSuitability,
} from '../types/traffic';
import { localizeBengaluruPlaceName } from './bengaluruTransliterator';
import { AppLanguage } from './types';

export interface SideStreetUiCopy {
  triggerButton: string;
  triggerHint: string;
  title: string;
  subtitle: string;
  selectBottleneck: string;
  useLiveGps: string;
  gpsActiveLabel: string;
  gpsUnavailableFallback: string;
  blockedArterialLabel: string;
  destinationLabel: string;
  schematicHeading: string;
  youAreHere: string;
  gridlockLabel: string;
  rejoinAheadLabel: string;
  saturationLabel: string;
  spilloverCapTitle: string;
  spilloverCapDesc: string;
  simulateHighSatBtn: string;
  resetSatBtn: string;
  womenSafetySyncLabel: string;
  safetyMonsoonActiveTitle: string;
  safetyMonsoonActiveDesc: string;
  filteredHeader: string;
  verdicts: Record<SideStreetVerdict, string>;
  suitabilityLabels: Record<VehicleSuitability, string>;
  filterReasonLabels: Record<SideStreetFilterReason, string>;
  timeSavedSuffix: string;
  roadWidthLabel: string;
  rejoinsPrefix: string;
  escapeGoogleMapsBtn: string;
  carCappedNotice: string;
  litPatrolledTag: string;
  unlitTag: string;
  floodProneTag: string;
  closeScanner: string;
}

export interface LocalizedBottleneckText {
  name: string;
  blockedRoadName: string;
}

export interface LocalizedSideStreetText {
  name: string;
  rejoinLandmark: string;
  turnCue: string;
  warningNote: string;
}

export const SIDE_STREET_UI: Record<AppLanguage, SideStreetUiCopy> = {
  en: {
    triggerButton: 'Stuck in Gridlock? Scan Side-Street Escape',
    triggerHint: 'Bypass Silk Board, Marathahalli, Bellandur, Hebbal, KR Puram & Panathur',
    title: 'Side-Street Escape & Bottleneck Bypass Scanner',
    subtitle: 'Evaluates parallel cross-roads beside your active bottleneck with width checks, anti-spillover caps & safety filtering.',
    selectBottleneck: 'Active Bottleneck',
    useLiveGps: 'Use Live GPS',
    gpsActiveLabel: 'GPS Lock Active',
    gpsUnavailableFallback: 'Using selected Bengaluru bottleneck',
    blockedArterialLabel: 'Blocked Main Arterial',
    destinationLabel: 'Target Destination',
    schematicHeading: 'Parallel Side-Street Schematic',
    youAreHere: 'You',
    gridlockLabel: 'GRIDLOCK',
    rejoinAheadLabel: 'Rejoin Ahead',
    saturationLabel: 'Side-Street Saturation',
    spilloverCapTitle: 'Residential Spillover Cap Active (>70%)',
    spilloverCapDesc: 'Car diversions through inner residential layouts are capped to prevent neighbourhood gridlock.',
    simulateHighSatBtn: 'Test >70% Spillover Cap',
    resetSatBtn: 'Normal Saturation',
    womenSafetySyncLabel: "Women's Safety Guardrail",
    safetyMonsoonActiveTitle: 'Safety & Monsoon Filter Active',
    safetyMonsoonActiveDesc: 'Unlit, unpatrolled or waterlogged lanes are automatically filtered out.',
    filteredHeader: 'Filtered Out by Safety / Monsoon Guardrails',
    verdicts: {
      verified_bypass: 'VERIFIED BYPASS',
      two_wheeler_only: 'NARROW / 2-WHEELER ONLY',
      dead_end: 'DEAD END / NO OUTLET',
    },
    suitabilityLabels: {
      car_auto_2w: 'Car / Auto / 2-Wheeler',
      two_wheeler_only: '2-Wheeler & Yulu Only',
      two_wheeler_capped: 'Capped: 2-Wheeler / Auto Only',
      not_passable: 'Blocked — Do Not Enter',
    },
    filterReasonLabels: {
      unlit_night_women: "Filtered: Unlit / unpatrolled (Women's Safety / Nighttime)",
      waterlogged_monsoon: 'Filtered: Waterlogging risk (Heavy Rain)',
    },
    timeSavedSuffix: 'min saved',
    roadWidthLabel: 'Width',
    rejoinsPrefix: 'Rejoins ahead at',
    escapeGoogleMapsBtn: 'Escape via Google Maps ↗',
    carCappedNotice: 'Car diversion capped (>70% side-street saturation) — protects residential block.',
    litPatrolledTag: 'Lit · Police Patrolled',
    unlitTag: 'Unlit Lane',
    floodProneTag: 'Waterlogging Prone',
    closeScanner: 'Hide Scanner',
  },
  kn: {
    triggerButton: 'ಟ್ರಾಫಿಕ್‌ನಲ್ಲಿ ಸಿಲುಕಿದ್ದೀರಾ? ಅಡ್ಡರಸ್ತೆ ಪರ್ಯಾಯ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    triggerHint: 'ಸಿಲ್ಕ್ ಬೋರ್ಡ್, ಮಾರತಹಳ್ಳಿ, ಬೆಳ್ಳಂದೂರು, ಹೆಬ್ಬಾಳ, ಕೆ.ಆರ್. ಪುರಂ ಮತ್ತು ಪಣತ್ತೂರು ಬೈಪಾಸ್',
    title: 'ಅಡ್ಡರಸ್ತೆ ಪರ್ಯಾಯ ಮತ್ತು ದಟ್ಟಣೆ ಬೈಪಾಸ್ ಸ್ಕ್ಯಾನರ್',
    subtitle: 'ನಿಮ್ಮ ದಟ್ಟಣೆ ಸ್ಥಳದ ಪಕ್ಕದ ಅಡ್ಡರಸ್ತೆಗಳನ್ನು ರಸ್ತೆ ಅಗಲ, ವಸತಿ ಮಿತಿ ಮತ್ತು ಸುರಕ್ಷತೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸುತ್ತದೆ.',
    selectBottleneck: 'ಸಕ್ರಿಯ ದಟ್ಟಣೆ ಸ್ಥಳ',
    useLiveGps: 'ಲೈವ್ GPS ಬಳಸಿ',
    gpsActiveLabel: 'GPS ಸಕ್ರಿಯವಾಗಿದೆ',
    gpsUnavailableFallback: 'ಆಯ್ದ ಬೆಂಗಳೂರು ದಟ್ಟಣೆ ಕೇಂದ್ರ ಬಳಸಲಾಗಿದೆ',
    blockedArterialLabel: 'ತಡೆಹಿಡಿಯಲ್ಪಟ್ಟ ಮುಖ್ಯ ರಸ್ತೆ',
    destinationLabel: 'ಗಮ್ಯಸ್ಥಾನ',
    schematicHeading: 'ಸಮಾನಾಂತರ ಅಡ್ಡರಸ್ತೆ ನಕ್ಷೆ',
    youAreHere: 'ನೀವು',
    gridlockLabel: 'ದಟ್ಟಣೆ',
    rejoinAheadLabel: 'ಮುಂದೆ ಸೇರಿಕೆ',
    saturationLabel: 'ಅಡ್ಡರಸ್ತೆ ದಟ್ಟಣೆ ಮಟ್ಟ',
    spilloverCapTitle: 'ವಸತಿ ಪ್ರದೇಶ ದಟ್ಟಣೆ ತಡೆ ಮಿತಿ (>70%)',
    spilloverCapDesc: 'ಒಳಗಿನ ವಸತಿ ಬಡಾವಣೆಗಳು ಜಾಮ್ ಆಗದಂತೆ ಕಾರು ತಿರುಗಿಸುವಿಕೆಯನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ.',
    simulateHighSatBtn: '>70% ಮಿತಿ ಪರೀಕ್ಷಿಸಿ',
    resetSatBtn: 'ಸಾಮಾನ್ಯ ಮಟ್ಟ',
    womenSafetySyncLabel: 'ಮಹಿಳಾ ಸುರಕ್ಷತಾ ಕವಚ',
    safetyMonsoonActiveTitle: 'ಸುರಕ್ಷತೆ ಮತ್ತು ಮಳೆ ಫಿಲ್ಟರ್ ಸಕ್ರಿಯ',
    safetyMonsoonActiveDesc: 'ಬೆಳಕಿಲ್ಲದ ಅಥವಾ ನೀರು ನಿಂತಿರುವ ಅಡ್ಡರಸ್ತೆಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.',
    filteredHeader: 'ಸುರಕ್ಷತೆ / ಮಳೆ ನಿಯಮದಿಂದ ತಡೆಹಿಡಿದ ರಸ್ತೆಗಳು',
    verdicts: {
      verified_bypass: 'ದೃಢೀಕೃತ ಬೈಪಾಸ್',
      two_wheeler_only: 'ಕಿರಿದಾದ / ದ್ವಿಚಕ್ರ ವಾಹನ ಮಾತ್ರ',
      dead_end: 'ಮುಂದೆ ದಾರಿ ಇಲ್ಲ / ಬಂದ್',
    },
    suitabilityLabels: {
      car_auto_2w: 'ಕಾರು / ಆಟೋ / ದ್ವಿಚಕ್ರ',
      two_wheeler_only: 'ದ್ವಿಚಕ್ರ & ಯುಲು ಮಾತ್ರ',
      two_wheeler_capped: 'ಮಿತಿ: ದ್ವಿಚಕ್ರ / ಆಟೋ ಮಾತ್ರ',
      not_passable: 'ಬಂದ್ — ಪ್ರವೇಶಿಸಬೇಡಿ',
    },
    filterReasonLabels: {
      unlit_night_women: 'ಫಿಲ್ಟರ್: ಬೆಳಕಿಲ್ಲದ ರಸ್ತೆ (ಮಹಿಳಾ ಸುರಕ್ಷತೆ / ರಾತ್ರಿ)',
      waterlogged_monsoon: 'ಫಿಲ್ಟರ್: ನೀರು ನಿಲ್ಲುವ ಅಪಾಯ (ಭಾರೀ ಮಳೆ)',
    },
    timeSavedSuffix: 'ನಿಮಿಷ ಉಳಿತಾಯ',
    roadWidthLabel: 'ಅಗಲ',
    rejoinsPrefix: 'ಮುಂದೆ ಸೇರುವ ಸ್ಥಳ:',
    escapeGoogleMapsBtn: 'Google Maps ಮೂಲಕ ಪರ್ಯಾಯ ದಾರಿ ↗',
    carCappedNotice: 'ವಸತಿ ಬಡಾವಣೆ ರಕ್ಷಣೆಗಾಗಿ ಕಾರು ತಿರುಗಿಸುವಿಕೆ ತಡೆಯಲಾಗಿದೆ (>70% ದಟ್ಟಣೆ).',
    litPatrolledTag: 'ದೀಪ · ಪೊಲೀಸ್ ಗಸ್ತು',
    unlitTag: 'ದೀಪವಿಲ್ಲದ ರಸ್ತೆ',
    floodProneTag: 'ನೀರು ನಿಲ್ಲುವ ಸ್ಥಳ',
    closeScanner: 'ಮುಚ್ಚಿ',
  },
  te: {
    triggerButton: 'ట్రాఫిక్‌లో చిక్కుకున్నారా? సైడ్-స్ట్రీట్ బైపాస్ స్కాన్ చేయండి',
    triggerHint: 'సిల్క్ బోర్డ్, మారతహళ్లి, బెళ్లందూరు, హెబ్బాళ్, కె.ఆర్. పురం & పనత్తూరు బైపాస్',
    title: 'సైడ్-స్ట్రీట్ ఎస్కేప్ & బాటిల్‌నెక్ బైపాస్ స్కానర్',
    subtitle: 'మీ ముందున్న అడ్డంకి పక్కనున్న సమాంతర రహదారులను వెడల్పు, సాచురేషన్ & భద్రత ఆధారంగా విశ్లేషిస్తుంది.',
    selectBottleneck: 'ట్రాఫిక్ అడ్డంకి స్థలం',
    useLiveGps: 'లైవ్ GPS వాడండి',
    gpsActiveLabel: 'GPS లాక్ సక్రియం',
    gpsUnavailableFallback: 'ఎంచుకున్న బెంగళూరు బాటిల్‌నెక్ వినియోగంలో ఉంది',
    blockedArterialLabel: 'నిలిచిపోయిన ప్రధాన రహదారి',
    destinationLabel: 'గమ్యస్థానం',
    schematicHeading: 'సమాంతర సైడ్-స్ట్రీట్ స్కీమాటిక్',
    youAreHere: 'మీరు',
    gridlockLabel: 'గ్రిడ్‌లాక్',
    rejoinAheadLabel: 'ముందు కలుస్తుంది',
    saturationLabel: 'సైడ్-స్ట్రీట్ రద్దీ స్థాయి',
    spilloverCapTitle: 'నివాస ప్రాంత రద్దీ నియంత్రణ (>70%)',
    spilloverCapDesc: 'నివాస కాలనీలు జామ్ కాకుండా కార్ల మళ్లింపును పరిమితం చేయడం జరిగింది.',
    simulateHighSatBtn: '>70% పరిమితి పరీక్ష',
    resetSatBtn: 'సాధారణ స్థాయి',
    womenSafetySyncLabel: 'మహిళా భద్రతా కవచం',
    safetyMonsoonActiveTitle: 'భద్రత & వర్షపు ఫిల్టర్ సక్రియం',
    safetyMonsoonActiveDesc: 'లైట్లు లేని లేదా నీరు నిలిచిన సందులను స్వయంచాలకంగా తొలగించబడింది.',
    filteredHeader: 'భద్రత / వర్షపు నిబంధనలతో తొలగించిన మార్గాలు',
    verdicts: {
      verified_bypass: 'ధృవీకరించబడిన బైపాస్',
      two_wheeler_only: 'ఇరుకైనది / 2-వీలర్ మాత్రమే',
      dead_end: 'డెడ్ ఎండ్ / దారి మూసివేత',
    },
    suitabilityLabels: {
      car_auto_2w: 'కారు / ఆటో / 2-వీలర్',
      two_wheeler_only: '2-వీలర్ & యులు మాత్రమే',
      two_wheeler_capped: 'పరిమితం: 2-వీలర్ / ఆటో మాత్రమే',
      not_passable: 'మూసివేయబడింది — వెళ్లవద్దు',
    },
    filterReasonLabels: {
      unlit_night_women: 'ఫిల్టర్: లైట్లు లేని మార్గం (మహిళా భద్రత / రాత్రి)',
      waterlogged_monsoon: 'ఫిల్టర్: నీరు నిలిచే ప్రమాదం (భారీ వర్షం)',
    },
    timeSavedSuffix: 'నిమిషాలు ఆదా',
    roadWidthLabel: 'వెడల్పు',
    rejoinsPrefix: 'ముందు కలిసే స్థలం:',
    escapeGoogleMapsBtn: 'Google Maps ద్వారా బైపాస్ ↗',
    carCappedNotice: 'నివాస ప్రాంత రక్షణ కోసం కారు మళ్లింపు పరిమితం చేయబడింది (>70% రద్దీ).',
    litPatrolledTag: 'లైట్లు · పోలీస్ గస్తీ',
    unlitTag: 'చీకటి సందు',
    floodProneTag: 'నీరు నిలిచే ప్రాంతం',
    closeScanner: 'మూసివేయి',
  },
  hi: {
    triggerButton: 'ट्रैफ़िक में फंसे हैं? साइड-स्ट्रीट बायपास स्कैन करें',
    triggerHint: 'सिल्क बोर्ड, मराठाहल्ली, बेलंदूर, हेब्बाल, के.आर. पुरम व पनाथुर बायपास',
    title: 'साइड-स्ट्रीट एस्केप व बॉटलनेक बायपास स्कैनर',
    subtitle: 'आपके जाम बिंदु के बगल की समानांतर गलियों को सड़क चौड़ाई, आवासीय सीमा और सुरक्षा नियमों से परखता है।',
    selectBottleneck: 'सक्रिय जाम बिंदु',
    useLiveGps: 'लाइव GPS उपयोग करें',
    gpsActiveLabel: 'GPS लॉक सक्रिय',
    gpsUnavailableFallback: 'चयनित बेंगलुरु जाम बिंदु उपयोग में',
    blockedArterialLabel: 'अवरुद्ध मुख्य मार्ग',
    destinationLabel: 'गंतव्य स्थान',
    schematicHeading: 'समानांतर साइड-स्ट्रीट मानचित्र',
    youAreHere: 'आप',
    gridlockLabel: 'भीषण जाम',
    rejoinAheadLabel: 'आगे मुख्य मार्ग',
    saturationLabel: 'साइड-स्ट्रीट संतृप्ति',
    spilloverCapTitle: 'आवासीय स्पिलओवर कैप सक्रिय (>70%)',
    spilloverCapDesc: 'आवासीय कॉलोनियों को जाम से बचाने हेतु कार डायवर्जन सीमित किया गया है।',
    simulateHighSatBtn: '>70% कैप जाँचें',
    resetSatBtn: 'सामान्य स्तर',
    womenSafetySyncLabel: 'महिला सुरक्षा गार्डरेल',
    safetyMonsoonActiveTitle: 'सुरक्षा व मानसून फ़िल्टर सक्रिय',
    safetyMonsoonActiveDesc: 'अंधेरी, बिना गश्त वाली या जलभराव वाली गलियां स्वतः हटाई गई हैं।',
    filteredHeader: 'सुरक्षा / मानसून नियमों से हटाए गए मार्ग',
    verdicts: {
      verified_bypass: 'सत्यापित बायपास',
      two_wheeler_only: 'संकीर्ण / केवल दोपहिया',
      dead_end: 'बंद गली / आगे रास्ता नहीं',
    },
    suitabilityLabels: {
      car_auto_2w: 'कार / ऑटो / दोपहिया',
      two_wheeler_only: 'केवल दोपहिया व यूलू',
      two_wheeler_capped: 'सीमित: केवल दोपहिया / ऑटो',
      not_passable: 'अवरुद्ध — प्रवेश न करें',
    },
    filterReasonLabels: {
      unlit_night_women: 'फ़िल्टर: अंधेरा / बिना गश्त मार्ग (महिला सुरक्षा / रात्रि)',
      waterlogged_monsoon: 'फ़िल्टर: जलभराव जोखिम (भारी बारिश)',
    },
    timeSavedSuffix: 'मिनट बचत',
    roadWidthLabel: 'चौड़ाई',
    rejoinsPrefix: 'आगे जुड़ता है:',
    escapeGoogleMapsBtn: 'Google Maps से बायपास जाएं ↗',
    carCappedNotice: 'आवासीय ब्लॉक की सुरक्षा हेतु कार डायवर्जन रोका गया (>70% दबाव)।',
    litPatrolledTag: 'रोशनी · पुलिस गश्त',
    unlitTag: 'अंधेरी गली',
    floodProneTag: 'जलभराव संभावित',
    closeScanner: 'बंद करें',
  },
  ml: {
    triggerButton: 'ഗതാഗതക്കുരുക്കിലാണോ? സൈഡ്-സ്ട്രീറ്റ് ബൈപാസ് സ്കാൻ ചെയ്യൂ',
    triggerHint: 'സിൽക്ക് ബോർഡ്, മാരത്തഹള്ളി, ബെല്ലന്ദൂർ, ഹെബ്ബാൾ, കെ.ആർ. പുരം & പനത്തൂർ',
    title: 'സൈഡ്-സ്ട്രീറ്റ് എസ്കേപ്പ് & ബൈപാസ് സ്കാനർ',
    subtitle: 'തടസ്സപ്പെട്ട റോഡിന് സമാന്തരമായ ഇടവഴികൾ വീതി, ജനവാസ മേഖല നിയന്ത്രണം, സുരക്ഷ എന്നിവയോടെ പരിശോധിക്കുന്നു.',
    selectBottleneck: 'ഗതാഗത തടസ്സ കേന്ദ്രം',
    useLiveGps: 'തത്സമയ GPS',
    gpsActiveLabel: 'GPS സജീവം',
    gpsUnavailableFallback: 'തിരഞ്ഞെടുത്ത ബെംഗളൂരു ജംഗ്ഷൻ ഉപയോഗിക്കുന്നു',
    blockedArterialLabel: 'തടസ്സപ്പെട്ട പ്രധാന റോഡ്',
    destinationLabel: 'ലക്ഷ്യസ്ഥാനം',
    schematicHeading: 'സമാന്തര ഇടവഴി രേഖാചിത്രം',
    youAreHere: 'നിങ്ങൾ',
    gridlockLabel: 'ഗതാഗതക്കുരുക്ക്',
    rejoinAheadLabel: 'മുന്നിൽ ചേരുന്നു',
    saturationLabel: 'ഇടവഴി തിരക്ക് നിരക്ക്',
    spilloverCapTitle: 'താമസമേഖലാ തിരക്ക് നിയന്ത്രണം (>70%)',
    spilloverCapDesc: 'ഉൾപ്രദേശങ്ങളിൽ കുരുക്കുണ്ടാകാതിരിക്കാൻ കാർ വഴിതിരിച്ചുവിടൽ നിയന്ത്രിച്ചിരിക്കുന്നു.',
    simulateHighSatBtn: '>70% നിയന്ത്രണം പരീക്ഷിക്കുക',
    resetSatBtn: 'സാധാരണ നില',
    womenSafetySyncLabel: 'വനിതാ സുരക്ഷാ കവചം',
    safetyMonsoonActiveTitle: 'സുരക്ഷ & മഴ ഫിൽട്ടർ സജീവം',
    safetyMonsoonActiveDesc: 'വെളിച്ചമില്ലാത്തതോ വെള്ളക്കെട്ടുള്ളതോ ആയ ഇടവഴികൾ സ്വയം ഒഴിവാക്കി.',
    filteredHeader: 'സുരക്ഷ / മഴ നിയന്ത്രണം മൂലം ഒഴിവാക്കിയവ',
    verdicts: {
      verified_bypass: 'അംഗീകൃത ബൈപാസ്',
      two_wheeler_only: 'ഇടുങ്ങിയത് / ഇരുചക്രവാഹനം മാത്രം',
      dead_end: 'വഴിയില്ല / അടഞ്ഞ ഇടവഴി',
    },
    suitabilityLabels: {
      car_auto_2w: 'കാർ / ഓട്ടോ / 2-വീലർ',
      two_wheeler_only: '2-വീലർ & യൂലു മാത്രം',
      two_wheeler_capped: 'നിയന്ത്രിതം: 2-വീലർ / ഓട്ടോ മാത്രം',
      not_passable: 'അടഞ്ഞു — പ്രവേശിക്കരുത്',
    },
    filterReasonLabels: {
      unlit_night_women: 'ഒഴിവാക്കി: വെളിച്ചമില്ലാത്ത ഇടവഴി (വനിതാ സുരക്ഷ / രാത്രി)',
      waterlogged_monsoon: 'ഒഴിവാക്കി: വെള്ളക്കെട്ട് സാധ്യത (കനത്ത മഴ)',
    },
    timeSavedSuffix: 'മിനിറ്റ് ലാഭം',
    roadWidthLabel: 'വീതി',
    rejoinsPrefix: 'മുന്നിൽ ചേരുന്ന സ്ഥലം:',
    escapeGoogleMapsBtn: 'Google Maps വഴി ബൈപാസ് ↗',
    carCappedNotice: 'താമസമേഖലയെ സംരക്ഷിക്കാൻ കാർ വഴിതിരിക്കൽ നിയന്ത്രിച്ചു (>70% തിരക്ക്).',
    litPatrolledTag: 'വെളിച്ചം · പോലീസ് പട്രോൾ',
    unlitTag: 'വെളിച്ചമില്ലാത്തത്',
    floodProneTag: 'വെള്ളക്കെട്ട് സാധ്യത',
    closeScanner: 'അടയ്ക്കുക',
  },
  ta: {
    triggerButton: 'போக்குவரத்தில் சிக்கியுள்ளீர்களா? பக்கவாட்டு மாற்றுப் பாதை ஸ்கேன்',
    triggerHint: 'சில்க் போர்டு, மாரத்தஹள்ளி, பெல்லந்தூர், ஹெப்பால், கே.ஆர். புரம் & பனத்தூர்',
    title: 'பக்கவாட்டுச் சாலை & நெரிசல் மாற்றுப் பாதை ஸ்கேனர்',
    subtitle: 'நெரிசலான சாலைக்கு அருகிலுள்ள மாற்றுச் சாலைகளை அகலம், குடியிருப்பு வரம்பு & பாதுகாப்புடன் ஆய்வு செய்கிறது.',
    selectBottleneck: 'நெரிசல் சந்திப்பு',
    useLiveGps: 'நேரலை GPS',
    gpsActiveLabel: 'GPS இணைக்கப்பட்டது',
    gpsUnavailableFallback: 'தேர்ந்தெடுக்கப்பட்ட பெங்களூரு சந்திப்பு பயன்பாட்டில்',
    blockedArterialLabel: 'தடைபட்ட முதன்மை சாலை',
    destinationLabel: 'சேருமிடம்',
    schematicHeading: 'இணை பக்கவாட்டுச் சாலை வரைபடம்',
    youAreHere: 'நீங்கள்',
    gridlockLabel: 'நெரிசல்',
    rejoinAheadLabel: 'முன்னால் இணையும்',
    saturationLabel: 'பக்கவாட்டுச் சாலை நெரிசல்',
    spilloverCapTitle: 'குடியிருப்பு நெரிசல் வரம்பு (>70%)',
    spilloverCapDesc: 'குடியிருப்புப் பகுதிகள் நெரிசலாவதைத் தடுக்க கார் திருப்பம் கட்டுப்படுத்தப்பட்டுள்ளது.',
    simulateHighSatBtn: '>70% வரம்பு சோதனை',
    resetSatBtn: 'இயல்பு நிலை',
    womenSafetySyncLabel: 'பெண்கள் பாதுகாப்பு கவசம்',
    safetyMonsoonActiveTitle: 'பாதுகாப்பு & மழை வடிகட்டி செயலில்',
    safetyMonsoonActiveDesc: 'விளக்கில்லாத அல்லது மழைநீர் தேங்கும் குறுக்குத் தெருக்கள் தானாக நீக்கப்பட்டன.',
    filteredHeader: 'பாதுகாப்பு / மழை விதிகளால் நீக்கப்பட்ட பாதைகள்',
    verdicts: {
      verified_bypass: 'உறுதிசெய்யப்பட்ட மாற்றுப் பாதை',
      two_wheeler_only: 'குறுகியது / இருசக்கர வாகனம் மட்டும்',
      dead_end: 'முடிவுப் பாதை / வழியில்லை',
    },
    suitabilityLabels: {
      car_auto_2w: 'கார் / ஆட்டோ / இருசக்கர வாகனம்',
      two_wheeler_only: 'இருசக்கர & யூலு மட்டும்',
      two_wheeler_capped: 'வரம்பு: இருசக்கர / ஆட்டோ மட்டும்',
      not_passable: 'அடைப்பு — நுழைய வேண்டாம்',
    },
    filterReasonLabels: {
      unlit_night_women: 'நீக்கப்பட்டது: விளக்கில்லாத தெரு (பெண்கள் பாதுகாப்பு / இரவு)',
      waterlogged_monsoon: 'நீக்கப்பட்டது: நீர் தேங்கும் அபாயம் (கனமழை)',
    },
    timeSavedSuffix: 'நிமிடம் சேமிப்பு',
    roadWidthLabel: 'அகலம்',
    rejoinsPrefix: 'முன்னால் இணையும் இடம்:',
    escapeGoogleMapsBtn: 'Google Maps வழியாக மாற்றுப் பாதை ↗',
    carCappedNotice: 'குடியிருப்புப் பகுதியைக் காக்க கார் திருப்பம் நிறுத்தப்பட்டது (>70% நெரிசல்).',
    litPatrolledTag: 'விளக்கு · காவலர் ரோந்து',
    unlitTag: 'விளக்கில்லாத சந்து',
    floodProneTag: 'நீர் தேங்கும் பகுதி',
    closeScanner: 'மூடு',
  },
  mr: {
    triggerButton: 'ट्रॅफिकमध्ये अडकला आहात? साइड-स्ट्रीट बायपास स्कॅन करा',
    triggerHint: 'सिल्क बोर्ड, मराठाहल्ली, बेलंदूर, हेब्बाल, के.आर. पुरम व पनाथूर बायपास',
    title: 'साइड-स्ट्रीट एस्केप व बॉटलनेक बायपास स्कॅनर',
    subtitle: 'तुमच्या कोंडीजवळील समांतर उपमार्गांची रस्ता रुंदी, निवासी मर्यादा आणि सुरक्षिततेनुसार तपासणी करते.',
    selectBottleneck: 'सक्रिय कोंडी ठिकाण',
    useLiveGps: 'लाइव्ह GPS वापरा',
    gpsActiveLabel: 'GPS सक्रिय',
    gpsUnavailableFallback: 'निवडलेले बंगळुरू कोंडी ठिकाण सक्रिय',
    blockedArterialLabel: 'कोंडी झालेला मुख्य रस्ता',
    destinationLabel: 'गंतव्य स्थान',
    schematicHeading: 'समांतर साइड-स्ट्रीट आराखडा',
    youAreHere: 'तुम्ही',
    gridlockLabel: 'कोंडी',
    rejoinAheadLabel: 'पुढे जोडते',
    saturationLabel: 'साइड-स्ट्रीट गर्दी पातळी',
    spilloverCapTitle: 'निवासी भागातील गर्दी मर्यादा (>70%)',
    spilloverCapDesc: 'निवासी कॉलनीत कोंडी होऊ नये म्हणून कार वळवण्यास मर्यादा घातली आहे.',
    simulateHighSatBtn: '>70% मर्यादा तपासा',
    resetSatBtn: 'सामान्य पातळी',
    womenSafetySyncLabel: 'महिला सुरक्षा कवच',
    safetyMonsoonActiveTitle: 'सुरक्षा व पावसाळा फिल्टर सक्रिय',
    safetyMonsoonActiveDesc: 'अंधारे, गस्त नसलेले किंवा पाणी साचणारे मार्ग आपोआप वगळले आहेत.',
    filteredHeader: 'सुरक्षा / पावसाळा नियमांमुळे वगळलेले मार्ग',
    verdicts: {
      verified_bypass: 'प्रमाणित बायपास',
      two_wheeler_only: 'अरुंद / फक्त दुचाकी',
      dead_end: 'बंद गल्ली / पुढे रस्ता नाही',
    },
    suitabilityLabels: {
      car_auto_2w: 'कार / रिक्षा / दुचाकी',
      two_wheeler_only: 'फक्त दुचाकी व युलू',
      two_wheeler_capped: 'मर्यादित: फक्त दुचाकी / रिक्षा',
      not_passable: 'बंद — प्रवेश करू नका',
    },
    filterReasonLabels: {
      unlit_night_women: 'वगळले: अंधारा मार्ग (महिला सुरक्षा / रात्र)',
      waterlogged_monsoon: 'वगळले: पाणी साचण्याचा धोका (मुसळधार पाऊस)',
    },
    timeSavedSuffix: 'मिनिटे बचत',
    roadWidthLabel: 'रुंदी',
    rejoinsPrefix: 'पुढे जोडण्याचे ठिकाण:',
    escapeGoogleMapsBtn: 'Google Maps द्वारे बायपास ↗',
    carCappedNotice: 'निवासी भाग सुरक्षित ठेवण्यासाठी कार वळवणे थांबवले आहे (>70% गर्दी).',
    litPatrolledTag: 'प्रकाश · पोलीस गस्त',
    unlitTag: 'अंधारी गल्ली',
    floodProneTag: 'पाणी साचणारे क्षेत्र',
    closeScanner: 'बंद करा',
  },
};

export const BOTTLENECK_TRANSLATIONS: Record<
  BottleneckId,
  Record<AppLanguage, LocalizedBottleneckText>
> = {
  silk_board: {
    en: { name: 'Silk Board Junction', blockedRoadName: 'Hosur Rd & Central Silk Board Flyover Loop' },
    kn: { name: 'ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಜಂಕ್ಷನ್', blockedRoadName: 'ಹೊಸೂರು ರಸ್ತೆ ಮತ್ತು ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಫ್ಲೈಓವರ್' },
    te: { name: 'సిల్క్ బోర్డ్ జంక్షన్', blockedRoadName: 'హోసూరు రోడ్ & సిల్క్ బోర్డ్ ఫ్లైఓవర్' },
    hi: { name: 'सिल्क बोर्ड जंक्शन', blockedRoadName: 'होसूर रोड व सिल्क बोर्ड फ्लाईओवर लूप' },
    ml: { name: 'സിൽക്ക് ബോർഡ് ജംഗ്ഷൻ', blockedRoadName: 'ഹോസൂർ റോഡ് & സിൽക്ക് ബോർഡ് ഫ്ലൈഓവർ' },
    ta: { name: 'சில்க் போர்டு சந்திப்பு', blockedRoadName: 'ஓசூர் சாலை & சில்க் போர்டு மேம்பாலம்' },
    mr: { name: 'सिल्क बोर्ड जंक्शन', blockedRoadName: 'होसूर रोड व सिल्क बोर्ड फ्लायओव्हर लूप' },
  },
  marathahalli: {
    en: { name: 'Marathahalli Bridge', blockedRoadName: 'ORR Marathahalli Bridge & Flyover Loop' },
    kn: { name: 'ಮಾರತಹಳ್ಳಿ ಸೇತುವೆ', blockedRoadName: 'ORR ಮಾರತಹಳ್ಳಿ ಸೇತುವೆ ಮತ್ತು ಫ್ಲೈಓವರ್' },
    te: { name: 'మారతహళ్లి వంతెన', blockedRoadName: 'ORR మారతహళ్లి వంతెన & ఫ్లైఓవర్' },
    hi: { name: 'मराठाहल्ली ब्रिज', blockedRoadName: 'ORR मराठाहल्ली ब्रिज व फ्लाईओवर' },
    ml: { name: 'മാരത്തഹള്ളി പാലം', blockedRoadName: 'ORR മാരത്തഹള്ളി പാലവും ഫ്ലൈഓവറും' },
    ta: { name: 'மாரத்தஹள்ளி பாலம்', blockedRoadName: 'ORR மாரத்தஹள்ளி பாலம் & மேம்பாலம்' },
    mr: { name: 'मराठाहल्ली पूल', blockedRoadName: 'ORR मराठाहल्ली पूल व फ्लायओव्हर' },
  },
  bellandur_orr: {
    en: { name: 'Bellandur ORR', blockedRoadName: 'ORR Bellandur Ecospace Main Carriageway' },
    kn: { name: 'ಬೆಳ್ಳಂದೂರು ORR', blockedRoadName: 'ORR ಬೆಳ್ಳಂದೂರು ಇಕೋಸ್ಪೇಸ್ ಮುಖ್ಯ ರಸ್ತೆ' },
    te: { name: 'బెళ్లందూరు ORR', blockedRoadName: 'ORR బెళ్లందూరు ఎకోస్పేస్ ప్రధాన మార్గం' },
    hi: { name: 'बेलंदूर ORR', blockedRoadName: 'ORR बेलंदूर इकोस्पेस मुख्य मार्ग' },
    ml: { name: 'ബെല്ലന്ദൂർ ORR', blockedRoadName: 'ORR ബെല്ലന്ദൂർ ഇക്കോസ്പേസ് പ്രധാന പാത' },
    ta: { name: 'பெல்லந்தூர் ORR', blockedRoadName: 'ORR பெல்லந்தூர் எக்கோஸ்பேஸ் முதன்மை சாலை' },
    mr: { name: 'बेलंदूर ORR', blockedRoadName: 'ORR बेलंदूर इकोस्पेस मुख्य रस्ता' },
  },
  hebbal_flyover: {
    en: { name: 'Hebbal Flyover', blockedRoadName: 'NH-44 Hebbal Flyover Ramp & Bellary Rd Merge' },
    kn: { name: 'ಹೆಬ್ಬಾಳ ಫ್ಲೈಓವರ್', blockedRoadName: 'NH-44 ಹೆಬ್ಬಾಳ ಫ್ಲೈಓವರ್ ರ‍್ಯಾಂಪ್' },
    te: { name: 'హెబ్బాళ్ ఫ్లైఓవర్', blockedRoadName: 'NH-44 హెబ్బాళ్ ఫ్లైఓవర్ రాంప్' },
    hi: { name: 'हेब्बाल फ्लाईओवर', blockedRoadName: 'NH-44 हेब्बाल फ्लाईओवर रैंप व बेल्लारी रोड' },
    ml: { name: 'ഹെബ്ബാൾ ഫ്ലൈഓവർ', blockedRoadName: 'NH-44 ഹെബ്ബാൾ ഫ്ലൈഓവർ റാമ്പ്' },
    ta: { name: 'ஹெப்பால் மேம்பாலம்', blockedRoadName: 'NH-44 ஹெப்பால் மேம்பாலம் & பெல்லாரி சாலை' },
    mr: { name: 'हेब्बाल फ्लायओव्हर', blockedRoadName: 'NH-44 हेब्बाल फ्लायओव्हर रॅम्प' },
  },
  kr_puram: {
    en: { name: 'K.R. Puram Tin Factory', blockedRoadName: 'Old Madras Rd & Tin Factory Cable-Stayed Bridge' },
    kn: { name: 'ಕೆ.ಆರ್. ಪುರಂ ಟಿನ್ ಫ್ಯಾಕ್ಟರಿ', blockedRoadName: 'ಹಳೆ ಮದ್ರಾಸ್ ರಸ್ತೆ ಮತ್ತು ಟಿನ್ ಫ್ಯಾಕ್ಟರಿ ಸೇತುವೆ' },
    te: { name: 'కె.ఆర్. పురం టిన్ ఫ్యాక్టరీ', blockedRoadName: 'ఓల్డ్ మద్రాస్ రోడ్ & టిన్ ఫ్యాక్టరీ వంతెన' },
    hi: { name: 'के.आर. पुरम टिन फैक्ट्री', blockedRoadName: 'ओल्ड मद्रास रोड व टिन फैक्ट्री केबल ब्रिज' },
    ml: { name: 'കെ.ആർ. പുരം ടിൻ ഫാക്ടറി', blockedRoadName: 'ഓൾഡ് മദ്രാസ് റോഡ് & ടിൻ ഫാക്ടറി പാലം' },
    ta: { name: 'கே.ஆர். புரம் டின் ஃபேக்டரி', blockedRoadName: 'பழைய மெட்ராஸ் சாலை & டின் ஃபேக்டரி பாலம்' },
    mr: { name: 'के.आर. पुरम टिन फॅक्टरी', blockedRoadName: 'ओल्ड मद्रास रोड व टिन फॅक्टरी केबल पूल' },
  },
  panathur_underpass: {
    en: { name: 'Panathur Underpass', blockedRoadName: 'Panathur Railway S-Cross Underpass & Balagere Bottleneck' },
    kn: { name: 'ಪಣತ್ತೂರು ಅಂಡರ್‌ಪಾಸ್', blockedRoadName: 'ಪಣತ್ತೂರು ರೈಲ್ವೆ ಎಸ್-ಕ್ರಾಸ್ ಅಂಡರ್‌ಪಾಸ್' },
    te: { name: 'పనత్తూరు అండర్‌పాస్', blockedRoadName: 'పనత్తూరు రైల్వే ఎస్-క్రాస్ అండర్‌పాస్' },
    hi: { name: 'पनाथुर अंडरपास', blockedRoadName: 'पनाथुर रेलवे एस-क्रॉस अंडरपास' },
    ml: { name: 'പനത്തൂർ അണ്ടർപാസ്', blockedRoadName: 'പനത്തൂർ റെയിൽവേ എസ്-ക്രോസ് അണ്ടർപാസ്' },
    ta: { name: 'பனத்தூர் சுரங்கப்பாதை', blockedRoadName: 'பனத்தூர் ரயில்வே எஸ்-கிராஸ் சுரங்கப்பாதை' },
    mr: { name: 'पनाथूर अंडरपास', blockedRoadName: 'पनाथूर रेल्वे एस-क्रॉस अंडरपास' },
  },
};

export const CANDIDATE_TRANSLATIONS: Record<
  string,
  Record<Exclude<AppLanguage, 'en'>, Partial<LocalizedSideStreetText>>
> = {
  'sb-btm-hsr-cut': {
    kn: {
      name: '29ನೇ ಮುಖ್ಯ ರಸ್ತೆ BTM ಕ್ರಾಸ್ → HSR ಸೆಕ್ಟರ್ 6 ಕಟ್',
      rejoinLandmark: 'HSR ಸೆಕ್ಟರ್ 6 ORR ಜಂಕ್ಷನ್',
      turnCue: '29ನೇ ಮುಖ್ಯ BTM ಕ್ರಾಸ್ ತೆಗೆದುಕೊಳ್ಳಿ → HSR ಸೆಕ್ಟರ್ 6 17ನೇ ಕ್ರಾಸ್ ಸೇರಿ → ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ದಾಟಿದ 1.6 ಕಿ.ಮೀ ಮುಂದೆ ORR ಸೇರುತ್ತದೆ',
    },
    te: {
      name: '29వ మెయిన్ BTM క్రాస్ → HSR సెక్టార్ 6 కట్',
      rejoinLandmark: 'HSR సెక్టార్ 6 ORR జంక్షన్',
      turnCue: '29వ మెయిన్ BTM క్రాస్ తీసుకోండి → HSR 17వ క్రాస్ కలపండి → సిల్క్ బోర్డ్ దాటి 1.6 కి.మీ ముందు ORRలో కలుస్తుంది',
    },
    hi: {
      name: '29वीं मेन BTM क्रॉस → HSR सेक्टर 6 सर्विस कट',
      rejoinLandmark: 'HSR सेक्टर 6 ORR जंक्शन',
      turnCue: '29वीं मेन BTM क्रॉस लें → HSR सेक्टर 6, 17वीं क्रॉस जुड़ें → सिल्क बोर्ड के 1.6 किमी आगे ORR पर मिलें',
    },
    ml: {
      name: '29-ാം മെയിൻ BTM ക്രോസ് → HSR സെക്ടർ 6 കട്ട്',
      rejoinLandmark: 'HSR സെക്ടർ 6 ORR ജംഗ്ഷൻ',
      turnCue: '29-ാം മെയിൻ BTM ക്രോസ് തിരിയുക → സിൽക്ക് ബോർഡ് കഴിഞ്ഞ് 1.6 കി.മീ മുന്നിൽ ORR-ൽ ചേരുന്നു',
    },
    ta: {
      name: '29வது மெயின் BTM கிராஸ் → HSR செக்டர் 6 கட்',
      rejoinLandmark: 'HSR செக்டர் 6 ORR சந்திப்பு',
      turnCue: '29வது மெயின் BTM கிராஸ் வழியாக → சில்க் போர்டைத் தாண்டி 1.6 கி.மீ முன்னால் ORR-இல் இணையும்',
    },
    mr: {
      name: '२९वी मेन BTM क्रॉस → HSR सेक्टर ६ कट',
      rejoinLandmark: 'HSR सेक्टर ६ ORR जंक्शन',
      turnCue: '२९वी मेन BTM क्रॉस घ्या → सिल्क बोर्ड पुढे १.६ किमी ORR ला जोडते',
    },
  },
  'sb-madiwala-loop': {
    kn: {
      name: 'ಮಡಿವಾಳ ಚೆಕ್‌ಪೋಸ್ಟ್ ಸೇವಾ ಕಟ್ → ರೂಪೇನ ಅಗ್ರಹಾರ',
      rejoinLandmark: 'ಬೊಮ್ಮನಹಳ್ಳಿ ಹೊಸೂರು ರಸ್ತೆ ರ‍್ಯಾಂಪ್',
      turnCue: 'ಮಡಿವಾಳ ಸೇವಾ ರಸ್ತೆ ಹಿಡಿಯಿರಿ → ರೂಪೇನ ಅಗ್ರಹಾರ ಲಿಂಕ್ → 1.4 ಕಿ.ಮೀ ಮುಂದೆ ಹೊಸೂರು ರಸ್ತೆ ಸೇರುತ್ತದೆ',
    },
    te: {
      name: 'మడివాళ చెక్‌పోస్ట్ సర్వీస్ కట్ → రూపేన అగ్రహార',
      rejoinLandmark: 'బొమ్మనహళ్లి హోసూరు రోడ్ రాంప్',
      turnCue: 'మడివాళ సర్వీస్ లేన్ తీసుకోండి → 1.4 కి.మీ ముందు హోసూరు రోడ్డులో కలుస్తుంది',
    },
    hi: {
      name: 'मडीवाला चेकपोस्ट सर्विस कट → रूपेना अग्रहारा',
      rejoinLandmark: 'बोम्मनहल्ली होसूर रोड रैंप',
      turnCue: 'मडीवाला सर्विस लेन लें → 1.4 किमी आगे होसूर रोड पर जुड़ें',
    },
    ml: {
      name: 'മഡിവാള ചെക്ക്പോസ്റ്റ് സർവീസ് കട്ട് → രൂപേന അഗ്രഹാര',
      rejoinLandmark: 'ബൊമ്മനഹള്ളി ഹോസൂർ റോഡ്',
      turnCue: 'മഡിവാള സർവീസ് ലെയ്ൻ വഴി 1.4 കി.മീ മുന്നിൽ ഹോസൂർ റോഡിൽ ചേരുന്നു',
    },
    ta: {
      name: 'மடிவாளா செக்போஸ்ட் சர்வீஸ் கட் → ரூபேன அக்ரஹாரா',
      rejoinLandmark: 'பொம்மனஹள்ளி ஓசூர் சாலை',
      turnCue: 'மடிவாளா சர்வீஸ் சாலை வழியாக 1.4 கி.மீ முன்னால் ஓசூர் சாலையில் இணையும்',
    },
    mr: {
      name: 'मडीवाळा चेकपोस्ट सर्व्हिस कट → रूपेना अग्रहारा',
      rejoinLandmark: 'बोम्मनहल्ली होसूर रोड रॅम्प',
      turnCue: 'मडीवाळा सर्व्हिस लेनने १.४ किमी पुढे होसूर रोडला जोडते',
    },
  },
  'mr-14th-main': {
    kn: {
      name: '14ನೇ ಮುಖ್ಯ ಕ್ರಾಸ್ → ಸ್ಪೈಸ್ ಗಾರ್ಡನ್ ORR ಲಿಂಕ್',
      rejoinLandmark: 'ಕಾರ್ತಿಕ್ ನಗರ ORR',
      turnCue: '14ನೇ ಮುಖ್ಯ ಕ್ರಾಸ್ ತೆಗೆದುಕೊಳ್ಳಿ → ಮಾರತಹಳ್ಳಿ ಸೇತುವೆ ದಾಟಿದ 1.8 ಕಿ.ಮೀ ಮುಂದೆ ORR ಸೇರುತ್ತದೆ',
    },
    te: {
      name: '14వ మెయిన్ క్రాస్ → స్పైస్ గార్డెన్ ORR లింక్',
      rejoinLandmark: 'కార్తీక్ నగర్ ORR',
      turnCue: '14వ మెయిన్ క్రాస్ తీసుకోండి → మారతహళ్లి బ్రిడ్జ్ దాటి 1.8 కి.మీ ముందు ORRలో కలుస్తుంది',
    },
    hi: {
      name: '14वीं मेन क्रॉस → स्पाइस गार्डन ORR लिंक',
      rejoinLandmark: 'कार्तिक नगर ORR',
      turnCue: '14वीं मेन क्रॉस लें → मराठाहल्ली ब्रिज के 1.8 किमी आगे ORR पर मिलें',
    },
    ml: {
      name: '14-ാം മെയിൻ ക്രോസ് → സ്പൈസ് ഗാർഡൻ ORR ലിങ്ക്',
      rejoinLandmark: 'കാർത്തിക് നഗർ ORR',
      turnCue: '14-ാം മെയിൻ ക്രോസ് വഴി മാരത്തഹള്ളി പാലം കഴിഞ്ഞ് 1.8 കി.മീ മുന്നിൽ ORR-ൽ ചേരുന്നു',
    },
    ta: {
      name: '14வது மெயின் கிராஸ் → ஸ்பைஸ் கார்டன் ORR இணைப்பு',
      rejoinLandmark: 'கார்த்திக் நகர் ORR',
      turnCue: '14வது மெயின் கிராஸ் செல்லுங்கள் → மாரத்தஹள்ளி பாலத்தைத் தாண்டி 1.8 கி.மீ முன்னால் ORR-இல் இணையும்',
    },
    mr: {
      name: '१४वी मेन क्रॉस → स्पाइस गार्डन ORR लिंक',
      rejoinLandmark: 'कार्तिक नगर ORR',
      turnCue: '१४वी मेन क्रॉस घ्या → मराठाहल्ली पुलापुढे १.८ किमी ORR ला जोडते',
    },
  },
  'mr-hal-kundalahalli': {
    kn: {
      name: 'HAL ಹಳೆ ವಿಮಾನ ನಿಲ್ದಾಣ ಸೇವಾ ರಸ್ತೆ → ಕುಂದಲಹಳ್ಳಿ ಗೇಟ್',
      rejoinLandmark: 'ದೊಡ್ಡನೆಕ್ಕುಂದಿ ORR ಜಂಕ್ಷನ್',
      turnCue: 'HAL ಸೇವಾ ರ‍್ಯಾಂಪ್ ಬಳಸಿ → ಕುಂದಲಹಳ್ಳಿ ಗೇಟ್ ಸಮಾನಾಂತರ ರಸ್ತೆ → 2.2 ಕಿ.ಮೀ ಮುಂದೆ ORR ಸೇರುತ್ತದೆ',
    },
    te: {
      name: 'HAL ఓల్డ్ ఎయిర్‌పోర్ట్ సర్వీస్ రోడ్ → కుందలహళ్లి గేట్',
      rejoinLandmark: 'దొడ్డనెక్కుంది ORR జంక్షన్',
      turnCue: 'HAL సర్వీస్ రాంప్ ద్వారా కుందలహళ్లి గేట్ మీదుగా 2.2 కి.మీ ముందు ORRలో కలుస్తుంది',
    },
    hi: {
      name: 'HAL ओल्ड एयरपोर्ट सर्विस रोड → कुंदलाहल्ली गेट',
      rejoinLandmark: 'दोड्डनेक्कुंडी ORR जंक्शन',
      turnCue: 'HAL सर्विस रैंप से कुंदलाहल्ली गेट समानांतर मार्ग लें → 2.2 किमी आगे ORR से जुड़ें',
    },
    ml: {
      name: 'HAL പഴയ എയർപോർട്ട് സർവീസ് റോഡ് → കുന്ദലഹള്ളി ഗേറ്റ്',
      rejoinLandmark: 'ദൊഡ്ഡനെക്കുന്ദി ORR',
      turnCue: 'HAL സർവീസ് റാമ്പ് വഴി 2.2 കി.മീ മുന്നിൽ ORR-ൽ ചേരുന്നു',
    },
    ta: {
      name: 'HAL பழைய விமான நிலைய சர்வீஸ் சாலை → குந்தலஹள்ளி கேட்',
      rejoinLandmark: 'தொட்டநெக்குந்தி ORR சந்திப்பு',
      turnCue: 'HAL சர்வீஸ் சாலை வழியாக 2.2 கி.மீ முன்னால் ORR-இல் இணையும்',
    },
    mr: {
      name: 'HAL जुने विमानतळ सर्व्हिस रोड → कुंदलाहल्ली गेट',
      rejoinLandmark: 'दोड्डनेक्कुंडी ORR जंक्शन',
      turnCue: 'HAL सर्व्हिस रॅम्पमधून कुंदलाहल्ली गेटमार्गे २.२ किमी पुढे ORR ला जोडते',
    },
  },
  'bl-green-glen-spine': {
    kn: {
      name: 'ಗ್ರೀನ್ ಗ್ಲೆನ್ ಲೇಔಟ್ ಸ್ಪೈನ್ → ಇಕೋಸ್ಪೇಸ್ ರಿಯರ್ ಕಟ್',
      rejoinLandmark: 'ಇಬ್ಬಲೂರು ಗೇಟ್ ORR',
      turnCue: 'ಗ್ರೀನ್ ಗ್ಲೆನ್ ಲೇಔಟ್ ಮುಖ್ಯ ರಸ್ತೆ ಹಿಡಿಯಿರಿ → ಬೆಳ್ಳಂದೂರು ಫ್ಲೈಓವರ್ ದಾಟಿದ 1.7 ಕಿ.ಮೀ ಮುಂದೆ ORR ಸೇರುತ್ತದೆ',
    },
    te: {
      name: 'గ్రీన్ గ్లెన్ లేఅవుట్ స్పైన్ → ఎకోస్పేస్ రియర్ కట్',
      rejoinLandmark: 'ఇబ్లూరు గేట్ ORR',
      turnCue: 'గ్రీన్ గ్లెన్ లేఅవుట్ ప్రధాన మార్గం తీసుకోండి → బెళ్లందూరు ఫ్లైఓవర్ దాటి 1.7 కి.మీ ముందు ORRలో కలుస్తుంది',
    },
    hi: {
      name: 'ग्रीन ग्लेन लेआउट स्पाइन → इकोस्पेस रियर कट',
      rejoinLandmark: 'इबलुर गेट ORR',
      turnCue: 'ग्रीन ग्लेन लेआउट मुख्य मार्ग लें → बेलंदूर फ्लाईओवर के 1.7 किमी आगे ORR से जुड़ें',
    },
    ml: {
      name: 'ഗ്രീൻ ഗ്ലെൻ ലേഔട്ട് സ്പൈൻ → ഇക്കോസ്പേസ് റിയർ കട്ട്',
      rejoinLandmark: 'ഇബ്ലൂർ ഗേറ്റ് ORR',
      turnCue: 'ഗ്രീൻ ഗ്ലെൻ ലേഔട്ട് വഴി ബെല്ലന്ദൂർ ഫ്ലൈഓവർ കഴിഞ്ഞ് 1.7 കി.മീ മുന്നിൽ ORR-ൽ ചേരുന്നു',
    },
    ta: {
      name: 'கிரீன் கிளென் லேஅவுட் → எக்கோஸ்பேஸ் பின்வழி',
      rejoinLandmark: 'இப்லூர் கேட் ORR',
      turnCue: 'கிரீன் கிளென் பிரதான சாலை வழியாக → பெல்லந்தூர் மேம்பாலத்தைத் தாண்டி 1.7 கி.மீ முன்னால் ORR-இல் இணையும்',
    },
    mr: {
      name: 'ग्रीन ग्लेन लेआउट स्पाइन → इकोस्पेस मागील कट',
      rejoinLandmark: 'इबलूर गेट ORR',
      turnCue: 'ग्रीन ग्लेन लेआउट मुख्य मार्गाने बेलंदूर फ्लायओव्हरपुढे १.७ किमी ORR ला जोडते',
    },
  },
  'hb-sahakara-60ft': {
    kn: {
      name: 'ಸಹಕಾರ ನಗರ 60 ಅಡಿ ಸಮಾನಾಂತರ → ಕೊಡಿಗೆಹಳ್ಳಿ ಲೂಪ್',
      rejoinLandmark: 'ಕೊಡಿಗೆಹಳ್ಳಿ NH-44 ಗೇಟ್',
      turnCue: 'ಎಸ್ಟೀಮ್ ಮಾಲ್ ಎಡ ತಿರುವು ತೆಗೆದುಕೊಳ್ಳಿ → ಸಹಕಾರ ನಗರ 60 ಅಡಿ ರಸ್ತೆ → 2.1 ಕಿ.ಮೀ ಮುಂದೆ NH-44 ಸೇರುತ್ತದೆ',
    },
    te: {
      name: 'సహకార నగర్ 60 అడుగుల సమాంతర మార్గం → కొడిగెహళ్లి లూప్',
      rejoinLandmark: 'కొడిగెహళ్లి NH-44 గೇట్',
      turnCue: 'ఎస్టీమ్ మాల్ ఎడమ మలుపు తీసుకోండి → సహకార నగర్ 60ft రోడ్ → 2.1 కి.మీ ముందు NH-44 లో కలుస్తుంది',
    },
    hi: {
      name: 'सहकार नगर 60 फीट समानांतर → कोडिगेहल्ली लूप',
      rejoinLandmark: 'कोडिगेहल्ली NH-44 गेट',
      turnCue: 'एस्टीम मॉल बायां मोड़ लें → सहकार नगर 60ft रोड → हेब्बाल रैंप के 2.1 किमी आगे NH-44 से जुड़ें',
    },
    ml: {
      name: 'സഹകാര നഗർ 60 അടി സമാന്തര പാത → കൊഡിഗെഹള്ളി ലൂപ്പ്',
      rejoinLandmark: 'കൊഡിഗെഹള്ളി NH-44 ഗേറ്റ്',
      turnCue: 'എസ്റ്റീം മാൾ ഇടതുവശം തിരിയുക → സഹകാര നഗർ വഴി 2.1 കി.മീ മുന്നിൽ NH-44-ൽ ചേരുന്നു',
    },
    ta: {
      name: 'சஹகாரா நகர் 60 அடி இணைச் சாலை → கொடிகேஹள்ளி லூப்',
      rejoinLandmark: 'கொடிகேஹள்ளி NH-44 கேட்',
      turnCue: 'எஸ்டீம் மால் இடது திருப்பம் வழியாக → சஹகாரா நகர் 60ft சாலை → 2.1 கி.மீ முன்னால் NH-44-இல் இணையும்',
    },
    mr: {
      name: 'सहकार नगर ६० फूट समांतर मार्ग → कोडिगेहल्ली लूप',
      rejoinLandmark: 'कोडिगेहल्ली NH-44 गेट',
      turnCue: 'एस्टीम मॉल डावे वळण घ्या → सहकार नगर ६०ft रोड → २.१ किमी पुढे NH-44 ला जोडते',
    },
  },
  'kr-kasturi-nagar': {
    kn: {
      name: 'ಕಸ್ತೂರಿ ನಗರ 2ನೇ ಮುಖ್ಯ ರಸ್ತೆ → ಬೆನ್ನಿಗಾನಹಳ್ಳಿ ಮೆಟ್ರೋ ಕಟ್',
      rejoinLandmark: 'ರಾಮಮೂರ್ತಿ ನಗರ ORR',
      turnCue: 'ಕಸ್ತೂರಿ ನಗರ 2ನೇ ಮುಖ್ಯ ರಸ್ತೆ ಬಳಸಿ → ಟಿನ್ ಫ್ಯಾಕ್ಟರಿ ದಾಟಿದ 1.9 ಕಿ.ಮೀ ಮುಂದೆ ORR ಸೇರುತ್ತದೆ',
    },
    te: {
      name: 'కస్తూరి నగర్ 2వ మెయిన్ → బెన్నిగానహళ్లి మెట్రో కట్',
      rejoinLandmark: 'రామమూర్తి నగర్ ORR',
      turnCue: 'కస్తూరి నగర్ 2వ మెయిన్ ద్వారా → టిన్ ఫ్యాక్టరీ దాటి 1.9 కి.మీ ముందు ORRలో కలుస్తుంది',
    },
    hi: {
      name: 'कस्तूरी नगर 2nd मेन → बेन्निगनाहल्ली मेट्रो कट',
      rejoinLandmark: 'राममूर्ति नगर ORR',
      turnCue: 'कस्तूरी नगर 2nd मेन समानांतर लें → टिन फैक्ट्री के 1.9 किमी आगे ORR से जुड़ें',
    },
    ml: {
      name: 'കസ്തൂരി നഗർ 2-ാം മെയിൻ → ബെന്നിഗാനഹള്ളി മെട്രോ കട്ട്',
      rejoinLandmark: 'രാമമൂർത്തി നഗർ ORR',
      turnCue: 'കസ്തൂരി നഗർ 2-ാം മെയിൻ വഴി ടിൻ ഫാക്ടറി കഴിഞ്ഞ് 1.9 കി.മീ മുന്നിൽ ORR-ൽ ചേരുന്നു',
    },
    ta: {
      name: 'கஸ்தூரி நகர் 2வது மெயின் → பென்னிகானஹள்ளி மெட்ரோ கட்',
      rejoinLandmark: 'ராமமூர்த்தி நகர் ORR',
      turnCue: 'கஸ்தூரி நகர் வழியாக → டின் ஃபேக்டரியைத் தாண்டி 1.9 கி.மீ முன்னால் ORR-இல் இணையும்',
    },
    mr: {
      name: 'कस्तूरी नगर २री मेन → बेन्निगनाहल्ली मेट्रो कट',
      rejoinLandmark: 'राममूर्ती नगर ORR',
      turnCue: 'कस्तूरी नगर २री मेनमार्गे टिन फॅक्टरीपुढे १.९ किमी ORR ला जोडते',
    },
  },
  'pn-balagere-80ft': {
    kn: {
      name: 'ಬಳಗೆರೆ 80 ಅಡಿ ಕಲೆಕ್ಟರ್ → ವರ್ತೂರು ಕೋಡಿ ಬೈಪಾಸ್',
      rejoinLandmark: 'ವರ್ತೂರು ಕೋಡಿ ವೈಟ್‌ಫೀಲ್ಡ್ ಲಿಂಕ್',
      turnCue: 'ಬಳಗೆರೆ 80 ಅಡಿ ರಸ್ತೆ ಮೂಲಕ ತಿರುಗಿ → ವರ್ತೂರು ಮುಖ್ಯ ರಸ್ತೆ → 2.3 ಕಿ.ಮೀ ಮುಂದೆ ವೈಟ್‌ಫೀಲ್ಡ್ ಲಿಂಕ್ ಸೇರುತ್ತದೆ',
    },
    te: {
      name: 'బళగెరె 80 అడుగుల కలెక్టర్ → వర్తూర్ కోడి బైపాస్',
      rejoinLandmark: 'వర్తూర్ కోడి వైట్‌ఫీల్డ్ లింక్',
      turnCue: 'బళగెరె 80ft రోడ్ ద్వారా తిరగండి → 2.3 కి.మీ ముందు వైట్‌ఫీల్డ్ లింక్‌లో కలుస్తుంది',
    },
    hi: {
      name: 'बालागेरे 80 फीट कलेक्टर → वर्तूर कोडी बायपास',
      rejoinLandmark: 'वर्तूर कोडी व्हाइटफील्ड लिंक',
      turnCue: 'बालागेरे 80ft कलेक्टर लें → वर्तूर मेन स्पाइन → 2.3 किमी आगे व्हाइटफील्ड लिंक से जुड़ें',
    },
    ml: {
      name: 'ബാലഗെരെ 80 അടി റോഡ് → വർത്തൂർ കോടി ബൈപാസ്',
      rejoinLandmark: 'വർത്തൂർ കോടി വൈറ്റ്ഫീൽഡ് ലിങ്ക്',
      turnCue: 'ബാലഗെരെ 80ft റോഡ് വഴി 2.3 കി.മീ മുന്നിൽ വൈറ്റ്ഫീൽഡ് ലിങ്കിൽ ചേരുന്നു',
    },
    ta: {
      name: 'பாலகெரே 80 அடி சாலை → வர்த்தூர் கோடி பைபாஸ்',
      rejoinLandmark: 'வர்த்தூர் கோடி வைட்ஃபீல்டு இணைப்பு',
      turnCue: 'பாலகெரே 80ft சாலை வழியாக 2.3 கி.மீ முன்னால் வைட்ஃபீல்டு இணைப்பில் சேரும்',
    },
    mr: {
      name: 'बालागेरे ८० फूट कलेक्टर → वर्तूर कोडी बायपास',
      rejoinLandmark: 'वर्तूर कोडी व्हाइटफील्ड लिंक',
      turnCue: 'बालागेरे ८०ft रोडने वर्तूर मुख्य मार्गे २.३ किमी पुढे व्हाइटफील्ड लिंकला जोडते',
    },
  },
  'bl-lake-marsh-gate': {
    kn: {
      name: 'ಬೆಳ್ಳಂದೂರು ಕೆರೆ ಜೌಗು ಗೇಟ್ (ಮುಂದೆ ದಾರಿ ಇಲ್ಲ)',
      rejoinLandmark: 'ಬಂದ್ ಆದ ಕೆರೆ ಬೇಲಿ ಗೇಟ್',
      turnCue: 'ಬೇಲಿ ಹಾಕಿದ ಬೆಳ್ಳಂದೂರು ಕೆರೆ ಅಂಚಿನಲ್ಲಿ ರಸ್ತೆ ಅಂತ್ಯಗೊಳ್ಳುತ್ತದೆ',
    },
    te: {
      name: 'బెళ్లందూరు చెరువు మార్ష్ గేట్ (దారి మూసివేత)',
      rejoinLandmark: 'మూసిన చెరువు గేట్',
      turnCue: 'బెళ్లందూరు చెరువు కంచె వద్ద ఈ రహదారి ముగుస్తుంది',
    },
    hi: {
      name: 'बेलंदूर झील मार्श नो-आउटलेट गेट',
      rejoinLandmark: 'बंद झील परिधि गेट',
      turnCue: 'बेलंदूर झील की बाड़ वाले गेट पर मार्ग समाप्त होता है',
    },
    ml: {
      name: 'ബെല്ലന്ദൂർ തടാക മാർഷ് ഗേറ്റ് (വഴിയില്ല)',
      rejoinLandmark: 'അടച്ച തടാക ഗേറ്റ്',
      turnCue: 'വേലികെട്ടിയ ബെല്ലന്ദൂർ തടാക ഗേറ്റിൽ വഴി അവസാനിക്കുന്നു',
    },
    ta: {
      name: 'பெல்லந்தூர் ஏரி சதுப்பு கேட் (வழியில்லை)',
      rejoinLandmark: 'மூடப்பட்ட ஏரி கேட்',
      turnCue: 'வேலி அமைக்கப்பட்ட பெல்லந்தூர் ஏரி ஓரத்தில் சாலை முடிவடைகிறது',
    },
    mr: {
      name: 'बेलंदूर तलाव मार्श गेट (बंद मार्ग)',
      rejoinLandmark: 'बंद तलाव सीमा गेट',
      turnCue: 'कुंपण घातलेल्या बेलंदूर तलाव गेटजवळ रस्ता संपतो',
    },
  },
};

export function localizeWarningOrCue(
  candidateId: string,
  verdict: SideStreetVerdict,
  englishText: string,
  field: 'name' | 'rejoinLandmark' | 'turnCue' | 'warningNote',
  lang: AppLanguage
): string {
  if (lang === 'en') return englishText;
  const override = CANDIDATE_TRANSLATIONS[candidateId]?.[lang]?.[field];
  if (override) return override;

  if (field === 'warningNote') {
    if (verdict === 'two_wheeler_only') {
      const m: Record<Exclude<AppLanguage, 'en'>, string> = {
        kn: '3.5ಮೀ ವಸತಿ ಗಲ್ಲಿ — ದ್ವಿಚಕ್ರ & ಯುಲು ಮಾತ್ರ; ಕಾರು/SUV ಸಿಲುಕಿಕೊಳ್ಳುವ ಅಪಾಯವಿದೆ',
        te: '3.5మీ నివాస సందు — 2-వీలర్ & యులు మాత్రమే; కారు/SUV చిక్కుకునే ప్రమాదం ఉంది',
        hi: '3.5मी संकीर्ण आवासीय गली — केवल दोपहिया व यूलू; कार/SUV फंसने का जोखिम',
        ml: '3.5മീ ഇടുങ്ങിയ ഇടവഴി — 2-വീലർ & യൂലു മാത്രം; കാർ/SUV കുടുങ്ങാൻ സാധ്യത',
        ta: '3.5மீ குறுகிய தெரு — இருசக்கர & யூலு மட்டும்; கார்/SUV சிக்கும் அபாயம்',
        mr: '३.५मी अरुंद गल्ली — फक्त दुचाकी व युलू; कार/SUV अडकण्याचा धोका',
      };
      return m[lang];
    }
    if (verdict === 'dead_end') {
      const m: Record<Exclude<AppLanguage, 'en'>, string> = {
        kn: 'ಮುಂದೆ ದಾರಿ ಇಲ್ಲ / ರೈಲ್ವೆ ಗೇಟ್ ಬಂದ್ — ಇಲ್ಲಿ ತಿರುಗಬೇಡಿ',
        te: 'డెడ్ ఎండ్ / రైల్వే గేట్ మూసివేత — ఇక్కడ తిరగవద్దు',
        hi: 'बंद गली / रेलवे गेट अवरुद्ध — यहाँ न मुड़ें',
        ml: 'അടഞ്ഞ ഇടവഴി / റെയിൽവേ ഗേറ്റ് — ഇങ്ങോട്ട് തിരിയരുത്',
        ta: 'முடிவுப் பாதை / ரயில்வே கேட் அடைப்பு — திரும்ப வேண்டாம்',
        mr: 'बंद गल्ली / रेल्वे गेट बंद — येथे वळू नका',
      };
      return m[lang];
    }
  }

  return localizeBengaluruPlaceName(englishText, lang);
}
