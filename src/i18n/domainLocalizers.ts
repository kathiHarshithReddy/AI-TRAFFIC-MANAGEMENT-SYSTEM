import {
  AIReasoningEntry,
  Corridor,
  DepartureWindow,
  Itinerary,
  Locality,
  LocalityMicroWeather,
  ModeEmissionDatum,
  RouteLeg,
  RoutePriority,
  SignalMode,
  SimulatedIntersection,
  TrafficAlertIncident,
  TrafficScenario,
  WeatherCondition,
  WeatherTelemetry,
  WeatherTrafficImpact,
  ZoneDelayDatum,
} from '../types/traffic';
import {
  localizeBengaluruPlaceName,
  localizeMetroLineName,
} from './bengaluruTransliterator';
import { AppLanguage } from './types';
import { UI_TRANSLATIONS } from './uiTranslations';

// ---------------------------------------------------------------------------
// 1. Signal Control & AI Reasoning Localizers
// ---------------------------------------------------------------------------

export function localizeJunction(
  jx: SimulatedIntersection,
  mode: SignalMode,
  scenario: TrafficScenario,
  weatherCondition: WeatherCondition,
  lang: AppLanguage
): SimulatedIntersection {
  if (lang === 'en') return jx;

  const localizedName = localizeBengaluruPlaceName(jx.name, lang);
  const localizedLandmark = localizeBengaluruPlaceName(jx.landmark, lang);
  const rainMm = jx.waterloggingProne ? 22 : 16;
  const isAdaptive = mode === 'adaptive';
  const frictionStr = jx.roadFrictionCoeff.toFixed(2);
  const addedGreen = Math.max(0, jx.assignedGreenSec - jx.staticGreenSec);
  const trimmedRed = Math.max(0, jx.staticRedSec - jx.assignedRedSec);

  let aiActionNote = jx.aiActionNote;

  if (!isAdaptive) {
    if (weatherCondition === 'clear') {
      const m: Record<Exclude<AppLanguage, 'en'>, string> = {
        kn: 'ಸ್ಥಿರ 120 ಸೆ. ಟೈಮರ್ ಸಕ್ರಿಯ; ರಿಯಲ್-ಟೈಮ್ ಸಾಲು ನಿಯಂತ್ರಣ ಇಲ್ಲ.',
        te: 'స్థిర 120 సె. టైమర్ అమలులో ఉంది; లైవ్ క్యూ ఫీడ్‌బ్యాక్ లేదు.',
        hi: 'स्थिर 120 सेकंड टाइमर सक्रिय; लाइव कतार प्रतिक्रिया उपलब्ध नहीं।',
        ml: 'സ്ഥിരമായ 120 സെക്കൻഡ് ടൈമർ സജീവം; തത്സമയ ക്യൂ നിയന്ത്രണമില്ല.',
        ta: 'நிலையான 120 வினாடி சிக்னல் இயங்குகிறது; நேரலை வரிசை மாற்றமில்லை.',
        mr: 'स्थिर १२० सेकंदांचा टाइमर सुरू; थेट रांग नियंत्रण उपलब्ध नाही.',
      };
      aiActionNote = m[lang];
    } else {
      const wLabel = UI_TRANSLATIONS[lang].weather.conditions[weatherCondition];
      const m: Record<Exclude<AppLanguage, 'en'>, string> = {
        kn: `ಸ್ಥಿರ ಟೈಮರ್ ${wLabel} ಅನ್ನು ನಿರ್ಲಕ್ಷಿಸಿದೆ (ಹಿಡಿತ ${frictionStr}, +${jx.yellowBufferAddedSec}ಸೆ ಹಳದಿ ಇಲ್ಲ); ಸಾಲು ${jx.queueMeters}ಮೀಗೆ ಹೆಚ್ಚಿದೆ.`,
        te: `స్థిర టైమర్ ${wLabel} పరిస్థితిని పట్టించుకోవడం లేదు (గ్రిప్ ${frictionStr}); క్యూ ${jx.queueMeters}మీ వరకు పెరిగింది.`,
        hi: `स्थिर टाइमर ${wLabel} को अनदेखा कर रहा है (ग्रिप ${frictionStr}, +${jx.yellowBufferAddedSec}से सुरक्षा नहीं); कतार ${jx.queueMeters}मी तक बढ़ी।`,
        ml: `സ്ഥിര ടൈമർ ${wLabel} അവഗണിക്കുന്നു (ഗ്രിപ്പ് ${frictionStr}); ക്യൂ ${jx.queueMeters}മീ ആയി ഉയർന്നു.`,
        ta: `நிலையான சிக்னல் ${wLabel} நிலையை கவனிக்கவில்லை (பிடிப்பு ${frictionStr}); வரிசை ${jx.queueMeters}மீ உயர்ந்தது.`,
        mr: `स्थिर टाइमर ${wLabel} दुर्लक्षित करत आहे (ग्रिप ${frictionStr}); रांग ${jx.queueMeters}मी पर्यंत वाढली.`,
      };
      aiActionNote = m[lang];
    }
  } else if (scenario === 'emergency_green_wave') {
    const m: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn: `ಗ್ರೀನ್ ವೇವ್ ಕಾರಿಡಾರ್ ಲಾಕ್ (+${addedGreen}ಸೆ ಹಸಿರು) ತುರ್ತು ವಾಹನ ಮತ್ತು ಬಿಎಂಟಿಸಿ ಮಾರ್ಗ ತೆರವುಗೊಳಿಸುತ್ತಿದೆ.`,
      te: `గ్రీన్ వేవ్ కారిడార్ లాక్ (+${addedGreen}సె గ్రీన్) అంబులెన్స్ మరియు BMTC లేన్‌ను క్లియర్ చేస్తోంది.`,
      hi: `ग्रीन वेव कॉरिडोर लॉक (+${addedGreen}से ग्रीन) एम्बुलेंस व BMTC लेन को खाली कर रहा है।`,
      ml: `ഗ്രീൻ വേവ് കോറിഡോർ ലോക്ക് (+${addedGreen}സെ ഗ്രീൻ) അടിയന്തര വാഹനങ്ങൾക്കും BMTC-യ്ക്കും വഴിയൊരുക്കുന്നു.`,
      ta: `பசுமை அலை வழித்தடம் (+${addedGreen}வி பச்சை) ஆம்புலன்ஸ் மற்றும் பேருந்து தடத்தை சீராக்குகிறது.`,
      mr: `ग्रीन वेव्ह कॉरिडॉर लॉक (+${addedGreen}से हिरवा) रुग्णवाहिका व बस मार्ग मोकळा करत आहे.`,
    };
    aiActionNote = m[lang];
  } else if (weatherCondition === 'heavy_rain') {
    const m: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn: `${localizedName} ನಲ್ಲಿ ಭಾರೀ ಮಳೆ (${rainMm}mm/hr) -> ರಸ್ತೆ ಹಿಡಿತ ${frictionStr} ಕ್ಕೆ ಇಳಿಕೆ; ಹಳದಿ ವಿರಾಮ +${jx.yellowBufferAddedSec}ಸೆ ವಿಸ್ತರಿಸಿ ${jx.waterloggingProne ? 'ನೀರು ಹರಿವಿನ ಕಾರಿಡಾರ್' : 'ಪ್ರಮುಖ ರಸ್ತೆ'}ಗೆ ಆದ್ಯತೆ ನೀಡಲಾಗಿದೆ.`,
      te: `${localizedName} వద్ద భారీ వర్షం (${rainMm}mm/hr) -> రోడ్డు గ్రిప్ ${frictionStr} కు తగ్గింది; పసుపు బఫర్ +${jx.yellowBufferAddedSec}సె పెంచి ప్రధాన కారిడార్ క్లియర్ చేయబడింది.`,
      hi: `${localizedName} पर भारी बारिश (${rainMm}mm/hr) -> सड़क घर्षण ${frictionStr} हुआ; येलो बफर +${jx.yellowBufferAddedSec}से बढ़ाकर मुख्य कॉरिडोर को प्राथमिकता दी गई।`,
      ml: `${localizedName}-ൽ കനത്ത മഴ (${rainMm}mm/hr) -> റോഡ് ഗ്രിപ്പ് ${frictionStr} ആയി കുറഞ്ഞു; മഞ്ഞ സുരക്ഷാ സമയം +${jx.yellowBufferAddedSec}സെ നീട്ടി.`,
      ta: `${localizedName} பகுதியில் கனமழை (${rainMm}mm/hr) -> சாலைப் பிடிப்பு ${frictionStr}; மஞ்சள் நேரம் +${jx.yellowBufferAddedSec}வி நீட்டிக்கப்பட்டு முக்கிய வழித்தடம் சீராக்கப்பட்டது.`,
      mr: `${localizedName} येथे मुसळधार पाऊस (${rainMm}mm/hr) -> रस्त्याची पकड ${frictionStr}; पिवळा बफर +${jx.yellowBufferAddedSec}से वाढवून मुख्य मार्ग मोकळा केला.`,
    };
    aiActionNote = m[lang];
  } else if (weatherCondition === 'light_rain') {
    const m: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn: `${localizedName} ನಲ್ಲಿ ಸಂಜೆ ಮಳೆ -> ಹಿಡಿತ ${frictionStr} (${jx.dischargeRatePct}% ಸಾಗಣೆ); +${jx.yellowBufferAddedSec}ಸೆ ಹಳದಿ ಸುರಕ್ಷತೆ ಮತ್ತು +${addedGreen}ಸೆ ಹಸಿರು ಸೇರಿಸಲಾಗಿದೆ.`,
      te: `${localizedName} వద్ద సాయంత్రం వర్షం -> గ్రిప్ ${frictionStr} (${jx.dischargeRatePct}% ప్రవాహం); +${jx.yellowBufferAddedSec}సె పసుపు బఫర్ & +${addedGreen}సె గ్రీన్ జోడించబడింది.`,
      hi: `${localizedName} पर शाम की बारिश -> घर्षण ${frictionStr} (${jx.dischargeRatePct}% निकासी); +${jx.yellowBufferAddedSec}से येलो बफर व +${addedGreen}से ग्रीन जोड़ा गया।`,
      ml: `${localizedName}-ൽ മഴ -> ഗ്രിപ്പ് ${frictionStr} (${jx.dischargeRatePct}% ഒഴുക്ക്); +${jx.yellowBufferAddedSec}സെ മഞ്ഞ ബഫറും +${addedGreen}സെ ഗ്രീനും നൽകി.`,
      ta: `${localizedName} மாலை மழை -> பிடிப்பு ${frictionStr} (${jx.dischargeRatePct}% ஓட்டம்); +${jx.yellowBufferAddedSec}வி மஞ்சள் & +${addedGreen}வி பச்சை சேர்க்கப்பட்டது.`,
      mr: `${localizedName} येथे सायंकाळचा पाऊस -> पकड ${frictionStr}; +${jx.yellowBufferAddedSec}से पिवळा बफर व +${addedGreen}से हिरवा वाढवला.`,
    };
    aiActionNote = m[lang];
  } else if (weatherCondition === 'morning_fog') {
    const m: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn: `${localizedName} ನಲ್ಲಿ ಮುಂಜಾನೆ ಮಂಜು -> ದೃಷ್ಟಿ ಗುಣಾಂಕ ${frictionStr}; ಹಳದಿ ವಿರಾಮ +${jx.yellowBufferAddedSec}ಸೆ ವಿಸ್ತರಿಸಿ ಸುಗಮ ಗ್ರೀನ್-ವೇವ್ ನೀಡಲಾಗಿದೆ.`,
      te: `${localizedName} వద్ద పొగమంచు -> దృశ్యమానత గుణకం ${frictionStr}; పసుపు సమయం +${jx.yellowBufferAddedSec}సె పొడిగించబడింది.`,
      hi: `${localizedName} पर सुबह का कोहरा -> दृश्यता कारक ${frictionStr}; येलो क्लियरेंस +${jx.yellowBufferAddedSec}से बढ़ाकर ग्रीन वेव सुचारू की गई।`,
      ml: `${localizedName}-ൽ പുലർച്ചെ മൂടൽമഞ്ഞ് -> ദൃശ്യപരത ${frictionStr}; മഞ്ഞ സമയം +${jx.yellowBufferAddedSec}സെ നീട്ടി.`,
      ta: `${localizedName} காலைப் பனிமூட்டம் -> பார்வைத் திறன் ${frictionStr}; மஞ்சள் சிக்னல் +${jx.yellowBufferAddedSec}வி நீட்டிக்கப்பட்டது.`,
      mr: `${localizedName} येथे पहाटेचे धुके -> दृश्यमानता ${frictionStr}; पिवळा कालावधी +${jx.yellowBufferAddedSec}से वाढवला.`,
    };
    aiActionNote = m[lang];
  } else if (weatherCondition === 'extreme_heat') {
    const m: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn: `ಬಿಸಿಲಿನ ತಾಪಮಾನದ ದಟ್ಟಣೆಗೆ +${addedGreen}ಸೆ ಹಸಿರು ವಿಸ್ತರಣೆ; ಅಡ್ಡರಸ್ತೆ ಕೆಂಪು ${trimmedRed}ಸೆ ಕಡಿತ.`,
      te: `ఎండ తీవ్రత రద్దీకి +${addedGreen}సె గ్రీన్ పెంపు; క్రాస్-స్ట్రీట్ రెడ్ ${trimmedRed}సె తగ్గింపు.`,
      hi: `अधिक गर्मी ट्रैफिक भार हेतु +${addedGreen}से ग्रीन विस्तार; क्रॉस-रोड रेड ${trimmedRed}से कम किया गया।`,
      ml: `ഉയർന്ന ചൂടിലെ ഗതാഗതത്തിനായി +${addedGreen}സെ ഗ്രീൻ കൂട്ടി; റെഡ് സമയം ${trimmedRed}സെ കുറച്ചു.`,
      ta: `அதிக வெப்ப நெரிசலுக்கு +${addedGreen}வி பச்சை நீட்டிப்பு; சிவப்பு நேரம் ${trimmedRed}வி குறைப்பு.`,
      mr: `उष्णतेतील वाहतूक ताणासाठी +${addedGreen}से हिरवा वाढवला; लाल वेळ ${trimmedRed}से कमी केला.`,
    };
    aiActionNote = m[lang];
  } else if (jx.densityPct >= 69 || addedGreen >= 10) {
    const m: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn: `ಪ್ರಮುಖ ರಸ್ತೆಯ ಹಸಿರು ಸಿಗ್ನಲ್ +${addedGreen}ಸೆ ವಿಸ್ತರಿಸಿ, ಅಡ್ಡರಸ್ತೆ ಕೆಂಪು ${trimmedRed}ಸೆ ಕಡಿತಗೊಳಿಸಲಾಗಿದೆ.`,
      te: `ప్రధాన రహదారి గ్రీన్ +${addedGreen}సె పెంచి, క్రాస్-రోడ్ రెడ్ ${trimmedRed}సె తగ్గించబడింది.`,
      hi: `मुख्य मार्ग का ग्रीन सिग्नल +${addedGreen}से बढ़ाया और क्रॉस-रोड रेड ${trimmedRed}से कम किया।`,
      ml: `പ്രധാന പാതയിലെ ഗ്രീൻ +${addedGreen}സെ നീട്ടി, ക്രോസ്-റോഡ് റെഡ് ${trimmedRed}സെ കുറച്ചു.`,
      ta: `முதன்மை சாலை பச்சை +${addedGreen}வி நீட்டிப்பு; குறுக்குச் சாலை சிவப்பு ${trimmedRed}வி குறைப்பு.`,
      mr: `मुख्य मार्गाचा हिरवा +${addedGreen}से वाढवला आणि क्रॉस-रोड लाल ${trimmedRed}से कमी केला.`,
    };
    aiActionNote = m[lang];
  } else if (jx.hasMetroCross) {
    const m: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn: `ಮೆಟ್ರೋ ಆಗಮನದೊಂದಿಗೆ ಪಾದಚಾರಿ ಮತ್ತು ಫೀಡರ್ ಬಸ್ ಹಂತ ಸಮನ್ವಯಗೊಳಿಸಿ, ಸರತಿ ಭಾರ ತಗ್ಗಿಸಲಾಗಿದೆ.`,
      te: `మెట్రో రాకతో ఫీడర్ బస్సు మరియు పాదచారుల దశను సమన్వయం చేసి ఆలస్యం తగ్గించబడింది.`,
      hi: `मेट्रो आगमन के साथ पैदल व फीडर बस चरण समन्वित कर प्रतीक्षा समय घटाया गया।`,
      ml: `മെട്രോ വരവിനൊപ്പം ഫീഡർ ബസ് ഘട്ടം ക്രമീകരിച്ച് കാത്തിരിപ്പ് കുറച്ചു.`,
      ta: `மெட்ரோ வருகையுடன் இணைந்து ஃபீடர் பேருந்து சிக்னல் ஒருங்கிணைக்கப்பட்டது.`,
      mr: `मेट्रो आगमनाशी फीडर बस टप्पा समन्वित करून प्रतीक्षा वेळ वाचवला.`,
    };
    aiActionNote = m[lang];
  } else {
    const m: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn: `${jx.queueMeters}ಮೀ ಲೂಪ್ ಸರತಿ ಮಾಹಿತಿ ಆಧರಿಸಿ 4-ಹಂತದ ಸಿಗ್ನಲ್ ಸಮತೋಲನಗೊಳಿಸಲಾಗಿದೆ.`,
      te: `${jx.queueMeters}మీ క్యూ డేటా ఆధారంగా 4-దశల సిగ్నల్ సమతుల్యం చేయబడింది.`,
      hi: `${jx.queueMeters}मी कतार टेलीमेट्री के आधार पर 4-चरणीय सिग्नल संतुलित किया गया।`,
      ml: `${jx.queueMeters}മീ ക്യൂ ഡാറ്റ അടിസ്ഥാനമാക്കി 4-ഘട്ട സിഗ്നൽ സന്തുലിതമാക്കി.`,
      ta: `${jx.queueMeters}மீ வரிசை தரவின் அடிப்படையில் 4-கட்ட சிக்னல் சமநிலைப்படுத்தப்பட்டது.`,
      mr: `${jx.queueMeters}मी रांग माहितीनुसार ४-टप्पे सिग्नल संतुलित केला.`,
    };
    aiActionNote = m[lang];
  }

  return {
    ...jx,
    name: localizedName,
    landmark: localizedLandmark,
    aiActionNote,
  };
}

export function localizeReasoningEntry(
  entry: AIReasoningEntry,
  jx: SimulatedIntersection | undefined,
  mode: SignalMode,
  scenario: TrafficScenario,
  weatherCondition: WeatherCondition,
  lang: AppLanguage
): AIReasoningEntry {
  if (lang === 'en') return entry;

  const t = UI_TRANSLATIONS[lang].signals;
  const localizedJunctionName = localizeBengaluruPlaceName(entry.junctionName, lang);
  const localizedTimestamp =
    entry.timestamp === 'Just now'
      ? t.justNow
      : entry.timestamp.replace(/\s*m ago$/, ` ${t.minAgo}`);

  if (!jx) {
    return {
      ...entry,
      timestamp: localizedTimestamp,
      junctionName: localizedJunctionName,
    };
  }

  const locJx = localizeJunction(jx, mode, scenario, weatherCondition, lang);
  const frictionStr = jx.roadFrictionCoeff.toFixed(2);

  if (mode === 'static') {
    const wLabel = UI_TRANSLATIONS[lang].weather.conditions[weatherCondition];
    const actionByLang: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn:
        weatherCondition !== 'clear'
          ? `ಸ್ಥಿರ ಟೈಮರ್ ${wLabel} ನಡುವೆಯೂ ${jx.staticGreenSec}ಸೆ ಹಸಿರು / ${jx.staticRedSec}ಸೆ ಕೆಂಪು ಹಿಡಿದಿಟ್ಟಿದೆ (ಹಿಡಿತ ${frictionStr}).`
          : `ಸ್ಥಿರ ಟೈಮರ್ ${jx.densityPct}% ಸಾಂದ್ರತೆಯಲ್ಲೂ ${jx.staticGreenSec}ಸೆ ಹಸಿರು / ${jx.staticRedSec}ಸೆ ಕೆಂಪು ಬದಲಾಯಿಸದೆ ಇದೆ.`,
      te:
        weatherCondition !== 'clear'
          ? `స్థిర టైమర్ ${wLabel} ఉన్నప్పటికీ ${jx.staticGreenSec}సె గ్రీన్ / ${jx.staticRedSec}సె రెడ్ కొనసాగిస్తోంది (గ్రిప్ ${frictionStr}).`
          : `స్థిర టైమర్ ${jx.densityPct}% రద్దీ ఉన్నా ${jx.staticGreenSec}సె గ్రీన్ / ${jx.staticRedSec}సె రెడ్ మారలేదు.`,
      hi:
        weatherCondition !== 'clear'
          ? `स्थिर टाइमर ${wLabel} के बावजूद ${jx.staticGreenSec}से ग्रीन / ${jx.staticRedSec}से रेड पर अटका है (ग्रिप ${frictionStr})।`
          : `स्थिर टाइमर ${jx.densityPct}% भार के बावजूद ${jx.staticGreenSec}से ग्रीन / ${jx.staticRedSec}से रेड पकड़े हुए है।`,
      ml:
        weatherCondition !== 'clear'
          ? `സ്ഥിര ടൈമർ ${wLabel} ഉണ്ടായിട്ടും ${jx.staticGreenSec}സെ ഗ്രീൻ / ${jx.staticRedSec}സെ റെഡ് തുടരുന്നു (ഗ്രിപ്പ് ${frictionStr}).`
          : `സ്ഥിര ടൈമർ ${jx.densityPct}% തിരക്കിലും ${jx.staticGreenSec}സെ ഗ്രീൻ / ${jx.staticRedSec}സെ റെഡ് മാറ്റുന്നില്ല.`,
      ta:
        weatherCondition !== 'clear'
          ? `நிலையான சிக்னல் ${wLabel} நிலையிலும் ${jx.staticGreenSec}வி பச்சை / ${jx.staticRedSec}வி சிவப்பு வைத்திருக்கிறது.`
          : `நிலையான சிக்னல் ${jx.densityPct}% நெரிசலிலும் ${jx.staticGreenSec}வி பச்சை / ${jx.staticRedSec}வி சிவப்பு மாறாமல் உள்ளது.`,
      mr:
        weatherCondition !== 'clear'
          ? `स्थिर टाइमर ${wLabel} असूनही ${jx.staticGreenSec}से हिरवा / ${jx.staticRedSec}से लाल कायम ठेवत आहे (पकड ${frictionStr}).`
          : `स्थिर टाइमर ${jx.densityPct}% भार असतानाही ${jx.staticGreenSec}से हिरवा / ${jx.staticRedSec}से लाल कायम आहे.`,
    };

    const impactByLang: Record<Exclude<AppLanguage, 'en'>, string> = {
      kn: `ಸರತಿ ${jx.queueMeters}ಮೀ ಗೆ ಬೆಳೆದಿದೆ (${jx.avgWaitSec}ಸೆ ಸರಾಸರಿ ಕಾಯುವಿಕೆ)`,
      te: `క్యూ ${jx.queueMeters}మీ కు చేరింది (${jx.avgWaitSec}సె సగటు నిరీక్షణ)`,
      hi: `कतार ${jx.queueMeters}मी तक बढ़ी (${jx.avgWaitSec}से औसत प्रतीक्षा)`,
      ml: `ക്യൂ ${jx.queueMeters}മീ ആയി വളർന്നു (${jx.avgWaitSec}സെ ശരാശരി കാത്തിരിപ്പ്)`,
      ta: `வரிசை ${jx.queueMeters}மீ உயர்ந்தது (${jx.avgWaitSec}வி சராசரி காத்திருப்பு)`,
      mr: `रांग ${jx.queueMeters}मी पर्यंत वाढली (${jx.avgWaitSec}से सरासरी प्रतीक्षा)`,
    };

    return {
      ...entry,
      timestamp: localizedTimestamp,
      junctionName: localizedJunctionName,
      action: actionByLang[lang],
      impact: impactByLang[lang],
    };
  }

  return {
    ...entry,
    timestamp: localizedTimestamp,
    junctionName: localizedJunctionName,
    action: locJx.aiActionNote,
    impact: `-${jx.waitReductionPct}% ${t.avgWait} · ${t.friction} ${frictionStr} · ${t.yellow} ${jx.yellowSec}s`,
  };
}

// ---------------------------------------------------------------------------
// 2. Traffic Alert Banner Localizer
// ---------------------------------------------------------------------------

export function localizeTrafficAlert(
  alert: TrafficAlertIncident,
  corridor: Corridor,
  signalMode: SignalMode,
  lang: AppLanguage
): TrafficAlertIncident {
  if (lang === 'en') return alert;

  const aT = UI_TRANSLATIONS[lang].alerts;
  const cT = UI_TRANSLATIONS[lang].signals.corridors[corridor.id];
  const corridorLabel = cT?.shortName ?? localizeBengaluruPlaceName(corridor.shortName, lang);
  const jxName = localizeBengaluruPlaceName(alert.junctionName, lang);
  const catLabel = aT.categories[alert.category] ?? alert.categoryLabel;

  let reportedAgo = alert.reportedAgo;
  if (reportedAgo.endsWith('s ago')) {
    reportedAgo = reportedAgo.replace('s ago', lang === 'ta' ? 'வி முன்' : lang === 'ml' ? 'സെ മുൻപ്' : lang === 'te' ? 'సె క్రితం' : lang === 'hi' || lang === 'mr' ? 'से पहले' : 'ಸೆ ಹಿಂದೆ');
  } else if (reportedAgo.endsWith('m ago')) {
    reportedAgo = reportedAgo.replace('m ago', lang === 'ta' ? 'நி முன்' : lang === 'ml' ? 'മി മുൻപ്' : lang === 'te' ? 'ని క్రితం' : lang === 'hi' || lang === 'mr' ? 'मि पहले' : 'ನಿ ಹಿಂದೆ');
  }

  const headlineMap: Record<TrafficAlertIncident['category'], Record<Exclude<AppLanguage, 'en'>, string>> = {
    bottleneck: {
      kn: `${jxName} ಬಳಿ ತೀವ್ರ ವಾಹನ ಸೇರ್ಪಡೆ ಮತ್ತು ದಟ್ಟಣೆ`,
      te: `${jxName} వద్ద తీవ్రమైన ట్రాఫిక్ రద్దీ మరియు మెర్జ్ అడ్డంకి`,
      hi: `${jxName} पर गंभीर ट्रैफिक जाम व मर्ज अवरोध`,
      ml: `${jxName} ജംഗ്ഷനിൽ കനത്ത ഗതാഗതക്കുരുക്ക്`,
      ta: `${jxName} சந்திப்பில் கடுமையான போக்குவரத்து நெரிசல்`,
      mr: `${jxName} येथे तीव्र वाहतूक कोंडी व मर्ज अडथळा`,
    },
    roadwork: {
      kn: `${jxName} ಸಮೀಪ ರಸ್ತೆ ಮತ್ತು ಪೈಪ್‌ಲೈನ್ ದುರಸ್ತಿ ಕಾಮಗಾರಿ`,
      te: `${jxName} సమీపంలో రోడ్డు మరియు యుటిలిటీ మరమ్మతు పనులు`,
      hi: `${jxName} के पास सड़क व यूटिलिटी मरम्मत कार्य`,
      ml: `${jxName}-ന് സമീപം റോഡ് അറ്റകുറ്റപ്പണി നടക്കുന്നു`,
      ta: `${jxName} அருகே சாலை மற்றும் குழாய் சீரமைப்புப் பணி`,
      mr: `${jxName} जवळ रस्ता व उपयुक्तता दुरुस्तीचे काम`,
    },
    metro_work: {
      kn: `${jxName} ಬಳಿ ಮೆಟ್ರೋ ಕಾಮಗಾರಿ ಬ್ಯಾರಿಕೇಡ್‌ನಿಂದ ರಸ್ತೆ ಕಿರಿದಾಗಿದೆ`,
      te: `${jxName} వద్ద మెట్రో పనుల బారికేడ్ల వల్ల రహదారి కుదింపు`,
      hi: `${jxName} पर मेट्रो निर्माण बैरिकेड से लेन संकीर्ण`,
      ml: `${jxName}-ൽ മെട്രോ നിർമ്മാണ ബാരിക്കേഡ് കാരണം റോഡ് ഇടുങ്ങി`,
      ta: `${jxName} பகுதியில் மெட்ரோ பணிகளால் சாலை சுருங்கியுள்ளது`,
      mr: `${jxName} येथे मेट्रो बांधकाम बॅरिकेडमुळे रस्ता अरुंद`,
    },
    waterlogging: {
      kn: `${jxName} ಬಳಿ ಮಳೆ ನೀರು ನಿಂತು ಕಡಿಮೆ ರಸ್ತೆ ಹಿಡಿತ (0.68)`,
      te: `${jxName} వద్ద వర్షపు నీరు నిలిచి తక్కువ గ్రిప్ (0.68)`,
      hi: `${jxName} पर जलभराव व कम सड़क घर्षण (0.68)`,
      ml: `${jxName}-ൽ വെള്ളക്കെട്ടും കുറഞ്ഞ റോഡ് ഗ്രിപ്പും (0.68)`,
      ta: `${jxName} பகுதியில் மழைநீர் தேக்கம் மற்றும் குறைந்த பிடிப்பு (0.68)`,
      mr: `${jxName} येथे पाणी साचल्याने रस्त्याची पकड कमी (0.68)`,
    },
    emergency_clearance: {
      kn: `${jxName} ಮೂಲಕ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು ಬಿಎಂಟಿಸಿ ತುರ್ತು ಹಸಿರು ಕಾರಿಡಾರ್`,
      te: `${jxName} మీదుగా 108 అంబులెన్స్ & BMTC అత్యవసర గ్రీన్ కారిడార్`,
      hi: `${jxName} से 108 एम्बुलेंस व BMTC आपातकालीन ग्रीन कॉरिडोर सक्रिय`,
      ml: `${jxName} വഴി 108 ആംബുലൻസിനും BMTC-യ്ക്കും അടിയന്തര ഗ്രീൻ കോറിഡോർ`,
      ta: `${jxName} வழியாக 108 ஆம்புலன்ஸ் & பேருந்து அவசர பசுமை வழித்தடம்`,
      mr: `${jxName} मार्गे १०८ रुग्णवाहिका व बससाठी तातडीचा ग्रीन कॉरिडॉर`,
    },
  };

  const detailsMap: Record<TrafficAlertIncident['category'], Record<Exclude<AppLanguage, 'en'>, string>> = {
    bottleneck: {
      kn: `${corridorLabel} ಸೇವಾ ರಸ್ತೆಯಲ್ಲಿ ಬಸ್ ಮತ್ತು ಟೆಕ್ ಶಟಲ್ ವಾಹನಗಳ ಒತ್ತಡ ಹೆಚ್ಚಾಗಿದೆ.`,
      te: `${corridorLabel} సర్వీస్ రోడ్డులో బస్సులు మరియు క్యాబ్‌ల రద్దీ ఎక్కువగా ఉంది.`,
      hi: `${corridorLabel} सर्विस लेन में बसों और ऑफिस शटल का भारी दबाव बना है।`,
      ml: `${corridorLabel} സർവീസ് റോഡിൽ ബസുകളുടെയും ഓഫീസ് വാഹനങ്ങളുടെയും തിരക്ക് കൂടുതലാണ്.`,
      ta: `${corridorLabel} சர்வீஸ் சாலையில் பேருந்துகள் மற்றும் வாகனங்களின் நெரிசல் அதிகமாக உள்ளது.`,
      mr: `${corridorLabel} सर्व्हिस लेनवर बस व ऑफिस वाहनांची गर्दी वाढली आहे.`,
    },
    roadwork: {
      kn: `${corridorLabel} ಹೊರಗಿನ ಲೇನ್‌ನಲ್ಲಿ ಬ್ಯಾರಿಕೇಡ್ ಅಳವಡಿಸಿರುವುದರಿಂದ ವಾಹನಗಳ ವಿಲೀನ ನಿಧಾನವಾಗಿದೆ.`,
      te: `${corridorLabel} బయటి లేన్‌లో బారికేడ్ల కారణంగా వాహనాల కదలిక నెమ్మదించింది.`,
      hi: `${corridorLabel} की बाहरी लेन पर बैरिकेडिंग के कारण मर्जिंग धीमी हो गई है।`,
      ml: `${corridorLabel} പുറം ലെയ്‌നിൽ ബാരിക്കേഡ് ഉള്ളതിനാൽ ഗതാഗതം മന്ദഗതിയിലാണ്.`,
      ta: `${corridorLabel} வெளிப்புறத் தடத்தில் தடுப்புகள் இருப்பதால் வாகன இயக்கம் மெதுவாக உள்ளது.`,
      mr: `${corridorLabel} बाह्य लेनवर बॅरिकेड लावल्याने वाहनांची गती मंदावली आहे.`,
    },
    metro_work: {
      kn: `${corridorLabel} ಮಧ್ಯಭಾಗದ ಮೆಟ್ರೋ ಪಿಲ್ಲರ್ ಕೆಲಸದಿಂದ ತಿರುವು ಮತ್ತು ವೇಗ ಸೀಮಿತಗೊಂಡಿದೆ.`,
      te: `${corridorLabel} మెట్రో పిల్లర్ పనుల వల్ల మలుపు మరియు వేగం తగ్గాయి.`,
      hi: `${corridorLabel} में मेट्रो पिलर कार्य से टर्निंग रेडियस और गति सीमित हुई है।`,
      ml: `${corridorLabel} മെട്രോ പില്ലർ പണി കാരണം തിരിയാനുള്ള സ്ഥലം കുറഞ്ഞിട്ടുണ്ട്.`,
      ta: `${corridorLabel} மெட்ரோ தூண் பணிகளால் திருப்பும் இடமும் வேகமும் குறைந்துள்ளன.`,
      mr: `${corridorLabel} येथील मेट्रो खांब कामामुळे वळण व वेग मर्यादित झाला आहे.`,
    },
    waterlogging: {
      kn: `${corridorLabel} ಭಾಗದಲ್ಲಿ ಭಾರೀ ಮಳೆಯಿಂದ (22mm/hr) ವಾಹನ ಸಾಗಣೆ 32% ಇಳಿದಿದೆ; ಪಂಪ್‌ಗಳು ಚಾಲನೆಯಲ್ಲಿವೆ.`,
      te: `${corridorLabel} లో భారీ వర్షం (22mm/hr) వల్ల ప్రవాహం 32% తగ్గింది; డ్రైనేజీ పంపులు పనిచేస్తున్నాయి.`,
      hi: `${corridorLabel} में भारी बारिश (22mm/hr) से निकासी 32% घटी; ड्रेनेज पंप सक्रिय हैं।`,
      ml: `${corridorLabel} ഭാഗത്ത് കനത്ത മഴയെ തുടർന്ന് ഗതാഗത ഒഴുക്ക് 32% കുറഞ്ഞു.`,
      ta: `${corridorLabel} பகுதியில் கனமழையால் (22mm/hr) வாகன ஓட்டம் 32% குறைந்துள்ளது; நீரேற்றிகள் இயங்குகின்றன.`,
      mr: `${corridorLabel} भागात मुसळधार पावसामुळे (22mm/hr) वाहतूक वेग ३२% कमी झाला आहे.`,
    },
    emergency_clearance: {
      kn: `${corridorLabel} ತುರ್ತು ಮಾರ್ಗವನ್ನು ತೆರವಾಗಿಡಲು ಎಲ್ಲಾ ಅಡ್ಡರಸ್ತೆ ಸಿಗ್ನಲ್‌ಗಳನ್ನು ತಡೆಹಿಡಿಯಲಾಗಿದೆ.`,
      te: `${corridorLabel} అత్యవసర మార్గాన్ని ఖాళీగా ఉంచడానికి క్రాస్-స్ట్రీట్ సిగ్నల్స్ ఆపబడ్డాయి.`,
      hi: `${corridorLabel} आपातकालीन मार्ग को खुला रखने के लिए सभी क्रॉस-रोड सिग्नल रोके गए हैं।`,
      ml: `${corridorLabel} അടിയന്തര പാത തുറന്നിടാൻ ക്രോസ്-റോഡ് സിഗ്നലുകൾ നിയന്ത്രിച്ചിട്ടുണ്ട്.`,
      ta: `${corridorLabel} அவசர வழித்தடம் தடையின்றிச் செல்ல குறுக்குச் சாலை சிக்னல்கள் நிறுத்தப்பட்டுள்ளன.`,
      mr: `${corridorLabel} तातडीचा मार्ग मोकळा ठेवण्यासाठी क्रॉस-रोड सिग्नल थांबवले आहेत.`,
    },
  };

  const laneImpactMap: Record<TrafficAlertIncident['category'], Record<Exclude<AppLanguage, 'en'>, string>> = {
    bottleneck: {
      kn: '3ರಲ್ಲಿ 2 ಸೇವಾ ಲೇನ್‌ಗಳಲ್ಲಿ ದಟ್ಟಣೆ',
      te: '3లో 2 సర్వీస్ లేన్లలో రద్దీ',
      hi: '3 में से 2 सर्विस लेन प्रभावित',
      ml: '3-ൽ 2 സർവീസ് ലെയ്‌നുകളിൽ തിരക്ക്',
      ta: '3-ல் 2 சர்வீஸ் தடங்களில் நெரிசல்',
      mr: '३ पैकी २ सर्व्हिस लेनवर कोंडी',
    },
    roadwork: {
      kn: '1 ಹೊರ ಲೇನ್ ಕಾಮಗಾರಿಗೆ ಬಂದ್',
      te: '1 బయటి లేన్ మరమ్మతు కోసం మూసివేత',
      hi: '1 बाहरी लेन कार्य हेतु बंद',
      ml: '1 പുറം ലെയ്ൻ പണിക്കായി അടച്ചു',
      ta: '1 வெளிப்புறத் தடம் பணிக்காக மூடப்பட்டுள்ளது',
      mr: '१ बाह्य लेन कामासाठी बंद',
    },
    metro_work: {
      kn: '1 ಲೇನ್ ಸೇವಾ ರಸ್ತೆಗೆ ತಿರುಗಿಸಲಾಗಿದೆ',
      te: '1 లేన్ సర్వీస్ రోడ్డుకు మళ్లించబడింది',
      hi: '1 लेन सर्विस रोड की ओर डायवर्ट',
      ml: '1 ലെയ്ൻ സർവീസ് റോഡിലേക്ക് തിരിച്ചുവിട്ടു',
      ta: '1 தடம் சர்வீஸ் சாலைக்கு மாற்றப்பட்டது',
      mr: '१ लेन सर्व्हिस रोडकडे वळवली',
    },
    waterlogging: {
      kn: 'ರಸ್ತೆ ಬದಿಯ ಲೇನ್‌ನಲ್ಲಿ ಮಳೆ ನೀರು ನಿಂತಿದೆ',
      te: 'రోడ్డు పక్క లేన్‌లో వర్షపు నీరు నిలిచింది',
      hi: 'किनारे की लेन में जलभराव',
      ml: 'റോഡരികിലെ ലെയ്‌നിൽ വെള്ളക്കെട്ട്',
      ta: 'சாலையோரத் தடத்தில் மழைநீர் தேக்கம்',
      mr: 'कडच्या लेनमध्ये पाणी साचले आहे',
    },
    emergency_clearance: {
      kn: 'ಬಲಭಾಗದ ಲೇನ್ ತುರ್ತು ವಾಹನಕ್ಕೆ ಮೀಸಲು',
      te: 'కుడి లేన్ అత్యవసర వాహనాలకు రిజర్వ్ చేయబడింది',
      hi: 'दाहिनी लेन आपातकालीन वाहन हेतु आरक्षित',
      ml: 'വലതു ലെയ്ൻ അടിയന്തര വാഹനങ്ങൾക്കായി നീക്കിവച്ചു',
      ta: 'வலது தடம் அவசர வாகனத்திற்காக ஒதுக்கப்பட்டது',
      mr: 'उजवी लेन तातडीच्या वाहनासाठी राखीव',
    },
  };

  const mitigationAdaptive: Record<Exclude<AppLanguage, 'en'>, string> = {
    kn: `AI ಅಡಾಪ್ಟಿವ್ ಸಿಗ್ನಲ್ ${jxName} ನಲ್ಲಿ ಹಸಿರು ವೇವ್ ವಿಸ್ತರಿಸಿ ದಟ್ಟಣೆ ತಗ್ಗಿಸುತ್ತಿದೆ.`,
    te: `AI అడాప్టివ్ సిగ్నల్ ${jxName} వద్ద గ్రీన్ వేవ్ పొడిగించి రద్దీని తగ్గిస్తోంది.`,
    hi: `AI अडेप्टिव सिग्नल ${jxName} पर ग्रीन वेव बढ़ाकर जाम कम कर रहा है।`,
    ml: `AI അഡാപ്റ്റീവ് സിഗ്നൽ ${jxName}-ൽ ഗ്രീൻ വേവ് നീട്ടി തിരക്ക് കുറയ്ക്കുന്നു.`,
    ta: `AI அடாப்டிவ் சிக்னல் ${jxName} சந்திப்பில் பசுமை அலையை நீட்டி நெரிசலைக் குறைக்கிறது.`,
    mr: `AI अ‍ॅडॅप्टिव्ह सिग्नल ${jxName} येथे ग्रीन वेव्ह वाढवून कोंडी कमी करत आहे.`,
  };

  const mitigationStatic: Record<Exclude<AppLanguage, 'en'>, string> = {
    kn: `ಸ್ಥಿರ ಟೈಮರ್ ${jxName} ನಲ್ಲಿ 400ಮೀ+ ವಾಹನ ಸರತಿ ಉಂಟುಮಾಡುತ್ತಿದೆ.`,
    te: `స్థిర టైమర్ ${jxName} వద్ద 400మీ+ వాహనాల క్యూకు కారణమవుతోంది.`,
    hi: `स्थिर टाइमर ${jxName} पर 400मी+ लंबी कतार पैदा कर रहा है।`,
    ml: `സ്ഥിര ടൈമർ ${jxName}-ൽ 400മീ+ വാഹന ക്യൂ ഉണ്ടാക്കുന്നു.`,
    ta: `நிலையான சிக்னல் ${jxName} சந்திப்பில் 400மீ+ வரிசையை ஏற்படுத்துகிறது.`,
    mr: `स्थिर टाइमर ${jxName} येथे ४००मी+ लांब रांग निर्माण करत आहे.`,
  };

  return {
    ...alert,
    junctionName: jxName,
    categoryLabel: catLabel,
    headline: headlineMap[alert.category][lang],
    details: detailsMap[alert.category][lang],
    laneImpact: laneImpactMap[alert.category][lang],
    aiMitigationNote:
      signalMode === 'adaptive' ? mitigationAdaptive[lang] : mitigationStatic[lang],
    reportedAgo,
  };
}

// ---------------------------------------------------------------------------
// 3. Multi-Modal Route Planner & Leg Localizers
// ---------------------------------------------------------------------------

const ITINERARY_TITLES: Record<
  string,
  Record<Exclude<AppLanguage, 'en'>, string>
> = {
  car_baseline: {
    kn: 'ಒಂಟಿ ಪೆಟ್ರೋಲ್ ಕಾರು / ಆಪ್ ಕ್ಯಾಬ್',
    te: 'సోలో పెట్రోల్ కారు / యాప్ క్యాబ్',
    hi: 'सोलो पेट्रोल कार / ऐप कैब',
    ml: 'സോളോ പെട്രോൾ കാർ / ആപ്പ് ക്യാബ്',
    ta: 'தனி பெட்ரோல் கார் / கேப்',
    mr: 'सोलो पेट्रोल कार / अ‍ॅप कॅब',
  },
  bmtc_direct: {
    kn: 'ಬಿಎಂಟಿಸಿ ವಜ್ರ / ವಾಯು ವಜ್ರ ಎಸಿ ಬಸ್',
    te: 'BMTC వజ్ర / వాయు వజ్ర AC బస్సు',
    hi: 'BMTC वज्र / वायु वज्र AC बस',
    ml: 'BMTC വജ്ര / വായു വജ്ര AC ബസ്',
    ta: 'BMTC வஜ்ரா / வாயு வஜ்ரா AC பேருந்து',
    mr: 'BMTC वज्र / वायू वज्र AC बस',
  },
  eco_hybrid: {
    kn: 'AI ಪರಿಸರ-ಹೈಬ್ರಿಡ್ ಸರಪಳಿ',
    te: 'AI ఎకో-హైబ్రిడ్ గొలుసు',
    hi: 'AI इको-हाइब्रिड चेन',
    ml: 'AI ഇക്കോ-ഹൈബ്രിഡ് ചെയിൻ',
    ta: 'AI சூழல்-ஹைப்ரிட் வழித்தடம்',
    mr: 'AI इको-हायब्रिड साखळी',
  },
  rail_express: {
    kn: 'MEMU ಉಪನಗರ ರೈಲು ಎಕ್ಸ್‌ಪ್ರೆಸ್',
    te: 'MEMU సబర్బన్ రైల్ ఎక్స్‌ప్రెస్',
    hi: 'MEMU उपनगरीय रेल एक्सप्रेस',
    ml: 'MEMU സബർബൻ റെയിൽ എക്സ്പ്രസ്',
    ta: 'MEMU புறநகர் ரயில் எக்ஸ்பிரஸ்',
    mr: 'MEMU उपनगरीय रेल्वे एक्सप्रेस',
  },
  bmtc_ordinary: {
    kn: 'BMTC ಸಾಮಾನ್ಯ ಬಸ್ (ಶಕ್ತಿ ಯೋಜನೆ ಉಚಿತ / ಬಜೆಟ್)',
    te: 'BMTC ఆర్డినరీ బస్సు (బడ్జెట్ / శక్తి పథకం)',
    hi: 'BMTC साधारण बस (बजट / शक्ति योजना)',
    ml: 'BMTC സാധാരണ ബസ് (ബജറ്റ് / ശക്തി പദ്ധതി)',
    ta: 'BMTC சாதாரண பேருந்து (பட்ஜெட் / சக்தி திட்டம்)',
    mr: 'BMTC साधी बस (बजेट / शक्ती योजना)',
  },
  bmtc_vajra: {
    kn: 'BMTC ವಜ್ರ AC ವೋಲ್ವೋ ಬಸ್',
    te: 'BMTC వజ్ర AC వోల్వో బస్సు',
    hi: 'BMTC वज्र AC वोल्वो बस',
    ml: 'BMTC വജ്ര AC വോൾവോ ബസ്',
    ta: 'BMTC வஜ்ரா AC வால்வோ பேருந்து',
    mr: 'BMTC वज्र AC व्होल्वो बस',
  },
  namma_metro: {
    kn: 'ನಮ್ಮ ಮೆಟ್ರೋ',
    te: 'నమ్మ మెట్రో',
    hi: 'नम्मा मेट्रो',
    ml: 'നമ്മ മെട്രോ',
    ta: 'நம்ம மெட்ரோ',
    mr: 'नम्मा मेट्रो',
  },
  memu_rail: {
    kn: 'ಉಪನಗರ MEMU ಪ್ರಯಾಣಿಕರ ರೈಲು',
    te: 'సబర్బన్ MEMU ప్రయాణికుల రైలు',
    hi: 'उपनगरीय MEMU यात्री रेल',
    ml: 'സബർബൻ MEMU യാത്രാ ട്രെയിൻ',
    ta: 'புறநகர் MEMU பயணிகள் ரயில்',
    mr: 'उपनगरीय MEMU प्रवासी रेल्वे',
  },
  e_auto: {
    kn: 'ನಮ್ಮ ಯಾತ್ರಿ / ಇ-ಆಟೋ (ಮನೆ-ಬಾಗಿಲಿಗೆ)',
    te: 'నమ్మ యాత్రి / ఇ-ఆటో (డోర్-టు-డోర్)',
    hi: 'नम्मा यात्री / ई-ऑटो (डोर-टू-डोर)',
    ml: 'നമ്മ യാത്രി / ഇ-ഓട്ടോ (ഡോർ-ടു-ഡോർ)',
    ta: 'நம்ம யாத்ரி / மின்-ஆட்டோ (நேரடி சேவை)',
    mr: 'नम्मा यात्री / ई-ऑटो (थेट सेवा)',
  },
  bike_taxi: {
    kn: 'ಬೈಕ್ ಟ್ಯಾಕ್ಸಿ (ರಾಪಿಡೋ / ನಮ್ಮ ಯಾತ್ರಿ)',
    te: 'బైక్ టాక్సీ (రాపిడో / నమ్మ యాత్రి)',
    hi: 'बाइक टैक्सी (रैपिडो / नम्मा यात्री)',
    ml: 'ബൈക്ക് ടാക്സി (റാപ്പിഡോ / നമ്മ യാത്രി)',
    ta: 'பைக் டாக்ஸி (ராபிடோ / நம்ம யாத்ரி)',
    mr: 'बाईक टॅक्सी (रॅपिडो / नम्मा यात्री)',
  },
  cab_share: {
    kn: 'ಓಲಾ / ಉಬರ್ / ಶೇರ್ಡ್ ಕ್ಯಾಬ್',
    te: 'ఓలా / ఉబర్ / షేర్డ్ క్యాబ్',
    hi: 'ओला / उबर / शेयर्ड कैब',
    ml: 'ഓല / ഉബർ / ഷെയേർഡ് ക്യാബ്',
    ta: 'ஓலா / உபர் / பகிர்வு கேப்',
    mr: 'ओला / उबर / शेअर्ड कॅब',
  },
};

const MODE_LABELS: Record<string, Record<Exclude<AppLanguage, 'en'>, string>> = {
  walk: {
    kn: 'ಸ್ಕೈವಾಕ್ / ನಡಿಗೆ',
    te: 'స్కైవాక్ / నడక',
    hi: 'स्काईवॉक / पैदल',
    ml: 'സ്കൈവാക്ക് / നടത്തം',
    ta: 'நடைமேம்பாலம் / நடை',
    mr: 'स्कायवॉक / चालणे',
  },
  yulu_ev: {
    kn: 'ಯುಲು ಮಿರಾಕಲ್ EV ಇ-ಬೈಕ್',
    te: 'యులు మిరాకిల్ EV',
    hi: 'यूलू मिरेकल EV ई-बाइक',
    ml: 'യുലു മിറാക്കിൾ EV',
    ta: 'யுலு மிராக்கிள் EV',
    mr: 'युलू मिरॅकल EV ई-बाईक',
  },
  e_auto: {
    kn: 'ಕವರ್ಡ್ ಇ-ಆಟೋ (ನಮ್ಮ ಯಾತ್ರಿ)',
    te: 'కవర్డ్ ఇ-ఆటో (నమ్మ యాత్రి)',
    hi: 'कवर्ड ई-ऑटो (नम्मा यात्री)',
    ml: 'കവേർഡ് ഇ-ഓട്ടോ (നമ്മ യാത്രി)',
    ta: 'மூடிய மின்-ஆட்டோ (நம்ம யாத்ரி)',
    mr: 'कव्हर्ड ई-ऑटो (नम्मा यात्री)',
  },
  auto_rickshaw: {
    kn: 'ಮೀಟರ್ಡ್ ಆಟೋ',
    te: 'మీటర్ ఆటో',
    hi: 'मीटर्ड ऑटो',
    ml: 'ഓട്ടോറിക്ഷ',
    ta: 'ஆட்டோ ரிக்ஷா',
    mr: 'ऑटो रिक्षा',
  },
  bmtc_feeder: {
    kn: 'ಬಿಎಂಟಿಸಿ ಮೆಟ್ರೋ ಫೀಡರ್ ಬಸ್',
    te: 'BMTC మెట్రో ఫీడర్ బస్సు',
    hi: 'BMTC मेट्रो फीडर बस',
    ml: 'BMTC മെട്രോ ഫീഡർ ബസ്',
    ta: 'BMTC மெட்ரோ ஃபீடர் பேருந்து',
    mr: 'BMTC मेट्रो फीडर बस',
  },
  bmtc_ordinary: {
    kn: 'ಬಿಎಂಟಿಸಿ ಟ್ರಂಕ್ ಬಸ್',
    te: 'BMTC ట్రంక్ బస్సు',
    hi: 'BMTC ट्रंक बस',
    ml: 'BMTC ട്രങ്ക് ബസ്',
    ta: 'BMTC டிரங்க் பேருந்து',
    mr: 'BMTC ट्रंक बस',
  },
  bmtc_vajra: {
    kn: 'ಬಿಎಂಟಿಸಿ ವಜ್ರ ಎಸಿ ಬಸ್',
    te: 'BMTC వజ్ర AC బస్సు',
    hi: 'BMTC वज्र AC बस',
    ml: 'BMTC വജ്ര AC ബസ്',
    ta: 'BMTC வஜ்ரா AC பேருந்து',
    mr: 'BMTC वज्र AC बस',
  },
  namma_metro: {
    kn: 'ನಮ್ಮ ಮೆಟ್ರೋ',
    te: 'నమ్మ మెట్రో',
    hi: 'नम्मा मेट्रो',
    ml: 'നമ്മ മെട്രോ',
    ta: 'நம்ம மெட்ரோ',
    mr: 'नम्मा मेट्रो',
  },
  memu_rail: {
    kn: 'ಉಪನಗರ MEMU ರೈಲು',
    te: 'సబర్బన్ MEMU రైలు',
    hi: 'उपनगरीय MEMU रेल',
    ml: 'സബർബൻ MEMU ട്രെയിൻ',
    ta: 'புறநகர் MEMU ரயில்',
    mr: 'उपनगरीय MEMU रेल्वे',
  },
  solo_car: {
    kn: 'ಒಂಟಿ ಪೆಟ್ರೋಲ್ ಕಾರು / ಕ್ಯಾಬ್',
    te: 'సోలో పెట్రోల్ కారు / క్యాబ్',
    hi: 'सोलो पेट्रोल कार / कैब',
    ml: 'സോളോ കാർ / ക്യാബ്',
    ta: 'தனி கார் / கேப்',
    mr: 'सोलो कार / कॅब',
  },
  ev_car: {
    kn: 'ಎಲೆಕ್ಟ್ರಿಕ್ ಕ್ಯಾಬ್ (EV)',
    te: 'ఎలక్ట్రిక్ క్యాబ్ (EV)',
    hi: 'इलेक्ट्रिक कैब (EV)',
    ml: 'ഇലക്ട്രിക് ക്യാബ് (EV)',
    ta: 'மின்சார கார் (EV)',
    mr: 'इलेक्ट्रिक कॅब (EV)',
  },
  two_wheeler: {
    kn: 'ಪೆಟ್ರೋಲ್ ದ್ವಿಚಕ್ರ ವಾಹನ',
    te: 'పెట్రోల్ టూ-వీలర్',
    hi: 'पेट्रोल दोपहिया वाहन',
    ml: 'പെട്രോൾ ടൂ-വീലർ',
    ta: 'பெட்ரோல் இருசக்கர வாகனம்',
    mr: 'पेट्रोल दुचाकी',
  },
  bike_taxi: {
    kn: 'ಬೈಕ್ ಟ್ಯಾಕ್ಸಿ ಎಕ್ಸ್‌ಪ್ರೆಸ್',
    te: 'బైక్ టాక్సీ ఎక్స్‌ప్రెస్',
    hi: 'बाइक टैक्सी एक्सप्रेस',
    ml: 'ബൈക്ക് ടാക്സി എക്സ്പ്രസ്',
    ta: 'பைக் டாக்ஸி எக்ஸ்பிரஸ்',
    mr: 'बाईक टॅक्सी एक्सप्रेस',
  },
  cab_share: {
    kn: 'AC ಕ್ಯಾಬ್ ಶೇರ್ / ಖಾಸಗಿ ಕ್ಯಾಬ್',
    te: 'AC క్యాబ్ షేర్ / ప్రైవేట్ క్యాబ్',
    hi: 'AC कैब शेयर / प्राइवेट कैब',
    ml: 'AC ക്യാബ് ഷെയർ / പ്രൈവറ്റ് ക്യാബ്',
    ta: 'AC கேப் பகிர்வு / தனியார் கேப்',
    mr: 'AC कॅब शेअर / खाजगी कॅब',
  },
};

function localizeRouteLeg(
  leg: RouteLeg,
  origin: Locality,
  destination: Locality,
  lang: AppLanguage
): RouteLeg {
  if (lang === 'en') return leg;

  const modeLabel =
    leg.mode === 'namma_metro'
      ? `${MODE_LABELS.namma_metro[lang]} (${
          origin.nearestMetro.line === destination.nearestMetro.line
            ? localizeMetroLineName(origin.nearestMetro.line, lang)
            : `${localizeMetroLineName(origin.nearestMetro.line, lang)} → ${localizeMetroLineName(destination.nearestMetro.line, lang)}`
        })`
      : leg.mode === 'walk' && leg.modeLabel.includes('Uncovered')
        ? {
            kn: 'ಮಳೆಯಲ್ಲಿ ತೆರೆದ ನಡಿಗೆ',
            te: 'వర్షంలో నడక (తడి మార్గం)',
            hi: 'बारिश में खुला पैदल मार्ग',
            ml: 'മഴയത്ത് തുറന്ന നടത്തം',
            ta: 'மழையில் திறந்த நடைப்பயணம்',
            mr: 'पावसात उघडे चालणे',
          }[lang]
        : (MODE_LABELS[leg.mode]?.[lang] ?? leg.modeLabel);

  const localizedFrom = localizeBengaluruPlaceName(leg.from, lang);
  const localizedTo = localizeBengaluruPlaceName(leg.to, lang);
  const localizedRoute = localizeBengaluruPlaceName(leg.lineOrRoute, lang);

  let localizedNotes = leg.notes;
  if (leg.notes.includes('Weather-Adapted:')) {
    const destName = localizeBengaluruPlaceName(destination.name, lang);
    const origName = localizeBengaluruPlaceName(origin.name, lang);
    const targetName = leg.notes.includes(destination.name) ? destName : origName;
    localizedNotes = {
      kn: `ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ: ${targetName} ಬಳಿ ಮಳೆಯ ಕಾರಣ ಕವರ್ಡ್ ${leg.mode === 'bmtc_feeder' ? 'ಫೀಡರ್ ಬಸ್' : 'ಇ-ಆಟೋ'} ಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.`,
      te: `వాతావరణ అనుకూలత: ${targetName} వద్ద వర్షం కారణంగా కవర్డ్ ${leg.mode === 'bmtc_feeder' ? 'ఫీడర్ బస్సు' : 'ఇ-ఆటో'} కు మార్చబడింది.`,
      hi: `मौसम-अनुकूलित: ${targetName} पर बारिश के कारण कवर्ड ${leg.mode === 'bmtc_feeder' ? 'फीडर बस' : 'ई-ऑटो'} में बदला गया।`,
      ml: `കാലാവസ്ഥാ ക്രമീകരണം: ${targetName}-ലെ മഴ കാരണം കവേർഡ് ${leg.mode === 'bmtc_feeder' ? 'ഫീഡർ ബസ്' : 'ഇ-ഓട്ടോ'} തിരഞ്ഞെടുത്തു.`,
      ta: `வானிலை மாற்றம்: ${targetName} மழையால் மூடிய ${leg.mode === 'bmtc_feeder' ? 'ஃபீடர் பேருந்து' : 'மின்-ஆட்டோ'} மாற்றப்பட்டது.`,
      mr: `हवामान अनुकूलन: ${targetName} येथील पावसामुळे कव्हर्ड ${leg.mode === 'bmtc_feeder' ? 'फीडर बस' : 'ई-ऑटो'} निवडली आहे.`,
    }[lang];
  } else if (leg.notes.includes('Wet-Weather Penalty')) {
    localizedNotes = {
      kn: 'ಒದ್ದೆ-ಹವಾಮಾನ ದಂಡ: ಮಳೆಯಲ್ಲಿ ತೆರೆದ ನಡಿಗೆ / ಯುಲು ಪ್ರಯಾಣಕ್ಕೆ ಹೆಚ್ಚುವರಿ ಸಮಯ.',
      te: 'తడి-వాతావరణ పెనాల్టీ: వర్షంలో బహిరంగ నడక / యులు ప్రయాణానికి అదనపు సమయం.',
      hi: 'गीले मौसम का विलंब: बारिश में खुले पैदल / यूलू चरण पर अतिरिक्त समय।',
      ml: 'മഴക്കാല പിഴ: മഴയത്ത് തുറന്ന നടത്തത്തിനും യുലുവിനും അധിക സമയം.',
      ta: 'மழைக்காலத் தாமதம்: திறந்த நடை / யுலு பயணத்திற்கு கூடுதல் நேரம்.',
      mr: 'ओल्या हवामानाचा दंड: पावसात उघड्या चालण्यामुळे अतिरिक्त विलंब.',
    }[lang];
  } else if (leg.mode === 'namma_metro') {
    localizedNotes = {
      kn: '100% ಮಳೆ-ಸುರಕ್ಷಿತ ಎತ್ತರಿಸಿದ/ಭೂಗತ ಮೆಟ್ರೋ ಮಾರ್ಗ · ಸಿಗ್ನಲ್‌ಮುಕ್ತ ಸಂಚಾರ.',
      te: '100% వర్ష-రక్షిత ఎలివేటెడ్/అండర్‌గ్రౌండ్ మెట్రో · ట్రాఫిక్ రహితం.',
      hi: '100% मौसम-सुरक्षित एलिवेटेड/अंडरग्राउंड मेट्रो · सिग्नल-मुक्त सफर।',
      ml: '100% കാലാവസ്ഥാ സുരക്ഷിത മെട്രോ യാത്ര · സിഗ്നൽ തടസ്സമില്ല.',
      ta: '100% வானிலை பாதுகாப்பு மெட்ரோ வழித்தடம் · சிக்னல் இல்லாத பயணம்.',
      mr: '१००% हवामान-सुरक्षित मेट्रो प्रवास · सिग्नलमुक्त वेगवान मार्ग.',
    }[lang];
  } else if (leg.mode === 'memu_rail') {
    localizedNotes = {
      kn: 'ವೇಗದ ಎಲೆಕ್ಟ್ರಿಕ್ MEMU ರೈಲು; ORR ಮತ್ತು ಹೊಸೂರು ರಸ್ತೆ ದಟ್ಟಣೆಯನ್ನು ತಪ್ಪಿಸುತ್ತದೆ.',
      te: 'వేగవంతమైన ఎలక్ట్రిక్ MEMU రైలు; ORR & హోసూరు రోడ్డు రద్దీని తప్పిస్తుంది.',
      hi: 'तेज़ इलेक्ट्रिक MEMU ट्रेन; ORR व होसुर रोड जाम से पूरी तरह बचाव।',
      ml: 'വേഗമേറിയ ഇലക്ട്രിക് MEMU ട്രെയിൻ; റോഡ് ഗതാഗതക്കുരുക്ക് ഒഴിവാക്കുന്നു.',
      ta: 'வேகமான மின்சார MEMU ரயில்; முக்கிய சாலை நெரிசலை முற்றிலும் தவிர்க்கிறது.',
      mr: 'वेगवान इलेक्ट्रिक MEMU रेल्वे; ORR व होसूर रोड कोंडी टाळते.',
    }[lang];
  } else if (leg.mode === 'bmtc_vajra' || leg.mode === 'bmtc_ordinary') {
    localizedNotes = {
      kn: 'ಬಿಎಂಟಿಸಿ ಬಸ್ ಆದ್ಯತೆ ಲೇನ್ ಹಾಗೂ ಸಮಯಬದ್ಧ ನಿಲ್ದಾಣ ಸಂಪರ್ಕ.',
      te: 'BMTC బస్సు ప్రాధాన్యత లేన్ మరియు సమయానుకూల కనెక్షన్.',
      hi: 'BMTC बस प्राथमिकता लेन और नियमित आवृत्ति सेवा।',
      ml: 'BMTC ബസ് പ്രയോറിറ്റി ലെയ്നും സമയബന്ധിത സർവീസും.',
      ta: 'BMTC பேருந்து முன்னுரிமை தடம் மற்றும் சீரான சேவை.',
      mr: 'BMTC बस प्राधान्य लेन आणि नियमित सेवा.',
    }[lang];
  } else if (leg.mode === 'solo_car') {
    localizedNotes = {
      kn: `ಪ್ರಮುಖ ಸಿಗ್ನಲ್ ಜಂಕ್ಷನ್‌ಗಳಲ್ಲಿ ಹೆಚ್ಚುವರಿ ಕಾಯುವಿಕೆ ಮತ್ತು ಇಂಧನ ವ್ಯಯ ಒಳಗೊಂಡಿದೆ.`,
      te: `ప్రధాన సిగ్నల్ జంక్షన్లలో అదనపు ఆలస్యం మరియు ఇంధన వ్యయం ఉంటుంది.`,
      hi: `प्रमुख सिग्नल जंक्शनों पर भारी प्रतीक्षा समय और ईंधन खपत शामिल।`,
      ml: `പ്രധാന സിഗ്നൽ ജംഗ്ഷനുകളിലെ കാത്തിരിപ്പും ഇന്ധനച്ചെലവും ഉൾപ്പെടുന്നു.`,
      ta: `முக்கிய சிக்னல் சந்திப்புகளில் நீண்ட காத்திருப்பும் எரிபொருள் செலவும் அடங்கும்.`,
      mr: `प्रमुख सिग्नल जंक्शनवर प्रतीक्षा वेळ आणि इंधन खर्च समाविष्ट.`,
    }[lang];
  } else if (leg.mode === 'yulu_ev') {
    localizedNotes = {
      kn: 'ಶೂನ್ಯ-ಹೊಗೆ ಯುಲು EV ಡಾಕ್‌ನಿಂದ ನೇರ ನಿಲ್ದಾಣ ಸಂಪರ್ಕ.',
      te: 'జీరో-ఎమిషన్ యులు EV డాక్ నుండి నేరుగా స్టేషన్ కనెక్షన్.',
      hi: 'शून्य-उत्सर्जन यूलू EV डॉक से सीधा स्टेशन संपर्क।',
      ml: 'സീറോ-എമിഷൻ യുലു EV ഡോക്കിൽ നിന്ന് നേരിട്ടുള്ള സ്റ്റേഷൻ യാത്ര.',
      ta: 'பூஜ்ஜிய மாசு யுலு EV மூலம் நேரடி நிலைய இணைப்பு.',
      mr: 'शून्य-उत्सर्जन युलू EV डॉकवरून थेट स्थानक जोडणी.',
    }[lang];
  } else if (leg.mode === 'e_auto' || leg.mode === 'bmtc_feeder') {
    localizedNotes = {
      kn: 'ಕವರ್ಡ್ ಎಲೆಕ್ಟ್ರಿಕ್ ಕೊನೆಯ-ಮೈಲಿ ಸಂಪರ್ಕ; ರಸ್ತೆ ದಟ್ಟಣೆಯನ್ನು ತಪ್ಪಿಸುತ್ತದೆ.',
      te: 'కవర్డ్ ఎలక్ట్రిక్ లాస్ట్-మైల్ డ్రాప్; ప్రధాన రద్దీని తప్పిస్తుంది.',
      hi: 'कवर्ड इलेक्ट्रिक अंतिम-मील संपर्क; मुख्य जाम से बचाव।',
      ml: 'കവേർഡ് ഇലക്ട്രിക് അവസാന മൈൽ യാത്ര; തിരക്കുകൾ ഒഴിവാക്കുന്നു.',
      ta: 'மூடிய மின்சார கடைசி-மைல் இணைப்பு; நெரிசலைத் தவிர்க்கிறது.',
      mr: 'कव्हर्ड इलेक्ट्रिक शेवटचा टप्पा; मुख्य वाहतूक कोंडी टाळते.',
    }[lang];
  } else {
    localizedNotes = {
      kn: 'ನಿಲ್ದಾಣಕ್ಕೆ ಸುರಕ್ಷಿತ ಪಾದಚಾರಿ / ಸ್ಕೈವಾಕ್ ಪ್ರವೇಶ.',
      te: 'స్టేషన్‌కు సురక్షిత పాదచారి / స్కైవాక్ మార్గం.',
      hi: 'स्टेशन तक सुरक्षित पैदल / स्काईवॉक पहुँच।',
      ml: 'സ്റ്റേഷനിലേക്കുള്ള സുരക്ഷിത കാൽനട / സ്കൈവാക്ക് പാത.',
      ta: 'நிலையத்திற்கான பாதுகாப்பான நடைபாதை / நடைமேம்பாலம்.',
      mr: 'स्थानकापर्यंत सुरक्षित पादचारी / स्कायवॉक मार्ग.',
    }[lang];
  }

  return {
    ...leg,
    modeLabel,
    lineOrRoute: localizedRoute,
    from: localizedFrom,
    to: localizedTo,
    notes: localizedNotes,
  };
}

export function localizeItinerary(
  route: Itinerary,
  origin: Locality,
  destination: Locality,
  priority: RoutePriority,
  weatherCondition: WeatherCondition,
  lang: AppLanguage
): Itinerary {
  if (lang === 'en') return route;

  const localizedLegs = route.legs.map((leg) =>
    localizeRouteLeg(leg, origin, destination, lang)
  );
  const title = ITINERARY_TITLES[route.category]?.[lang] ?? route.title;

  let subtitle = route.subtitle;
  if (route.category === 'car_baseline' || route.category === 'cab_share') {
    subtitle = {
      kn: 'AC ಮನೆ-ಬಾಗಿಲಿನ ಕ್ಯಾಬ್ ಮತ್ತು ಲೈವ್ SOS ಸುರಕ್ಷತೆ',
      te: 'AC డోర్-టు-డోర్ క్యాబ్ & లైవ్ SOS ట్రాకింగ్',
      hi: 'AC डोर-टू-डोर कैब और लाइव SOS सुरक्षा ट्रैकिंग',
      ml: 'AC ഡോർ-ടു-ഡോർ ക്യാബും ലൈവ് SOS ട്രാക്കിംഗും',
      ta: 'AC நேரடி கேப் மற்றும் நேரலை SOS கண்காணிப்பு',
      mr: 'AC थेट कॅब व थेट SOS सुरक्षा ट्रॅकिंग',
    }[lang];
  } else if (route.category === 'bmtc_direct' || route.category === 'bmtc_vajra' || route.category === 'bmtc_ordinary') {
    subtitle = {
      kn: `ಬಿಎಂಟಿಸಿ ಬಸ್ ಕಾರಿಡಾರ್ (${localizedLegs.length} ಹಂತಗಳು)`,
      te: `BMTC బస్సు కారిడార్ (${localizedLegs.length} దశలు)`,
      hi: `BMTC बस कॉरिडोर (${localizedLegs.length} चरण)`,
      ml: `BMTC ബസ് കോറിഡോർ (${localizedLegs.length} ഘട്ടങ്ങൾ)`,
      ta: `BMTC பேருந்து வழித்தடம் (${localizedLegs.length} படிகள்)`,
      mr: `BMTC बस कॉरिडॉर (${localizedLegs.length} टप्पे)`,
    }[lang];
  } else if (route.category === 'eco_hybrid') {
    subtitle = `${localizedLegs[0].modeLabel} → ${localizeMetroLineName(origin.nearestMetro.line, lang)} → ${localizedLegs[localizedLegs.length - 1].modeLabel}`;
  } else if (route.category === 'e_auto') {
    subtitle = {
      kn: 'ಪರಿಶೀಲಿಸಿದ GPS ಎಲೆಕ್ಟ್ರಿಕ್ ಆಟೋ ಸಂಪರ್ಕ',
      te: 'ధృవీకరించిన GPS ఎలక్ట్రిక్ ఆటో సేవ',
      hi: 'सत्यापित GPS इलेक्ट्रिक ऑटो सेवा',
      ml: 'പരിശോധിച്ച GPS ഇലക്ട്രിക് ഓട്ടോ സേവനം',
      ta: 'சரிபார்க்கப்பட்ட GPS மின்-ஆட்டோ சேவை',
      mr: 'पडताळलेली GPS इलेक्ट्रिक ऑटो सेवा',
    }[lang];
  } else if (route.category === 'bike_taxi') {
    subtitle = {
      kn: 'ವೇಗದ ದ್ವಿಚಕ್ರ ಕೊನೆಯ-ಮೈಲಿ ಪ್ರಯಾಣ',
      te: 'వేగవంతమైన బైక్ టాక్సీ పాయింట్-టు-పాయింట్ ప్రయాణం',
      hi: 'तेज़ दोपहिया पॉइंट-टू-पॉइंट यात्रा',
      ml: 'വേഗത്തിലുള്ള ബൈക്ക് ടാക്സി യാത്ര',
      ta: 'விரைவான இருசக்கரப் பயணம்',
      mr: 'जलद दुचाकी टॅक्सी प्रवास',
    }[lang];
  } else {
    subtitle = `${localizeBengaluruPlaceName(origin.nearestRail.station, lang)} ↔ ${localizeBengaluruPlaceName(destination.nearestRail.station, lang)}`;
  }

  let weatherAdaptationBadge = route.weatherAdaptationBadge;
  if (weatherAdaptationBadge) {
    if (weatherAdaptationBadge.includes('destination')) {
      weatherAdaptationBadge = {
        kn: 'ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ: ಗಮ್ಯಸ್ಥಾನದಲ್ಲಿ ಮಳೆ ಇರುವುದರಿಂದ ಕೊನೆಯ-ಮೈಲಿ ಇ-ಆಟೋಗೆ ಬದಲಿಸಲಾಗಿದೆ',
        te: 'వాతావరణ అనుకూలత: గమ్యస్థానంలో వర్షం వల్ల లాస్ట్-మైల్ ఇ-ఆటోకు మార్చబడింది',
        hi: 'मौसम-अनुकूलित: गंतव्य पर बारिश के कारण अंतिम मील ई-ऑटो में बदला गया',
        ml: 'കാലാവസ്ഥാ ക്രമീകരണം: ലക്ഷ്യസ്ഥാനത്തെ മഴ കാരണം ഇ-ഓട്ടോയിലേക്ക് മാറ്റി',
        ta: 'வானிலை மாற்றம்: சேருமிட மழையால் கடைசி மைல் மின்-ஆட்டோ மாற்றப்பட்டது',
        mr: 'हवामान अनुकूलन: गंतव्यस्थानी पावसामुळे शेवटचा टप्पा ई-ऑटोवर हलवला',
      }[lang];
    } else if (weatherAdaptationBadge.includes('origin')) {
      weatherAdaptationBadge = {
        kn: 'ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ: ಆರಂಭ ಸ್ಥಳದಲ್ಲಿ ಮಳೆ ಇರುವುದರಿಂದ ಕವರ್ಡ್ ಇ-ಆಟೋಗೆ ಬದಲಿಸಲಾಗಿದೆ',
        te: 'వాతావరణ అనుకూలత: ప్రారంభంలో వర్షం వల్ల కవర్డ్ ఇ-ఆటోకు మార్చబడింది',
        hi: 'मौसम-अनुकूलित: प्रारंभ स्थान पर बारिश से कवर्ड ई-ऑटो चुना गया',
        ml: 'കാലാവസ്ഥാ ക്രമീകരണം: പുറപ്പെടുന്നിടത്തെ മഴ കാരണം കവേർഡ് ഇ-ഓട്ടോ നൽകി',
        ta: 'வானிலை மாற்றம்: புறப்படும் இட மழையால் மூடிய மின்-ஆட்டோ மாற்றப்பட்டது',
        mr: 'हवामान अनुकूलन: सुरुवातीला पावसामुळे कव्हर्ड ई-ऑटो निवडली',
      }[lang];
    } else if (weatherAdaptationBadge.includes('fog')) {
      weatherAdaptationBadge = {
        kn: 'ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ: ಮಂಜು ದಟ್ಟಣೆಯನ್ನು ತಪ್ಪಿಸುವ ಎತ್ತರಿಸಿದ ಮೆಟ್ರೋ ಮಾರ್ಗ',
        te: 'వాతావరణ అనుకూలత: పొగమంచును తప్పించే ఎలివేటెడ్ మెట్రో మార్గం',
        hi: 'मौसम-अनुकूलित: कोहरे से बचने हेतु एलिवेटेड मेट्रो प्राथमिकता',
        ml: 'കാലാവസ്ഥാ ക്രമീകരണം: മൂടൽമഞ്ഞ് ഒഴിവാക്കുന്ന എലിവേറ്റഡ് മെട്രോ',
        ta: 'வானிலை மாற்றம்: பனிமூட்டத்தைத் தவிர்க்கும் உயர்த்தப்பட்ட மெட்ரோ',
        mr: 'हवामान अनुकूलन: धुक्यापासून सुरक्षित एलिव्हेटेड मेट्रो मार्ग',
      }[lang];
    } else if (weatherAdaptationBadge.includes('UV/heat') || weatherCondition === 'extreme_heat') {
      weatherAdaptationBadge = {
        kn: 'ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ: ಬಿಸಿಲಿನಿಂದ ರಕ್ಷಣೆಗೆ ಎಸಿ ಮೆಟ್ರೋ ಮತ್ತು ಕವರ್ಡ್ ಇ-ಆಟೋ',
        te: 'వాతావరణ అనుకూలత: ఎండ నుండి రక్షణకు AC మెట్రో & కవర్డ్ ఇ-ఆటో',
        hi: 'मौसम-अनुकूलित: तेज गर्मी से बचाव हेतु AC मेट्रो व कवर्ड ई-ऑटो',
        ml: 'കാലാവസ്ഥാ ക്രമീകരണം: ചൂടിൽ നിന്ന് സംരക്ഷണത്തിന് AC മെട്രോയും ഇ-ഓട്ടോയും',
        ta: 'வானிலை மாற்றம்: வெப்பத்திலிருந்து பாதுகாக்க AC மெட்ரோ & மூடிய மின்-ஆட்டோ',
        mr: 'हवामान अनुकूलन: उष्णतेपासून बचावासाठी AC मेट्रो व कव्हर्ड ई-ऑटो',
      }[lang];
    } else {
      weatherAdaptationBadge = {
        kn: 'ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ: ಮಳೆ-ಸುರಕ್ಷಿತ ಮೆಟ್ರೋ + ಕವರ್ಡ್ ಇ-ಆಟೋ ಸಕ್ರಿಯ',
        te: 'వాతావరణ అనుకూలత: వర్ష-సురక్షిత మెట్రో + కవర్డ్ ఇ-ఆటో సక్రియం',
        hi: 'मौसम-अनुकूलित: बारिश-सुरक्षित मेट्रो + कवर्ड ई-ऑटो सक्रिय',
        ml: 'കാലാവസ്ഥാ ക്രമീകരണം: മഴ-സുരക്ഷിത മെട്രോ + ഇ-ഓട്ടോ സജീവം',
        ta: 'வானிலை மாற்றம்: மழை-பாதுகாப்பு மெட்ரோ + மூடிய மின்-ஆட்டோ',
        mr: 'हवामान अनुकूलन: पावसापासून सुरक्षित मेट्रो + कव्हर्ड ई-ऑटो सुरू',
      }[lang];
    }
  }

  let wetWeatherPenaltyNote = route.wetWeatherPenaltyNote;
  if (wetWeatherPenaltyNote) {
    wetWeatherPenaltyNote = {
      kn: 'ಒದ್ದೆ-ಹವಾಮಾನ ದಂಡ: ಮಳೆಯಲ್ಲಿ ತೆರೆದ ರಸ್ತೆ/ನಡಿಗೆಗೆ ಹೆಚ್ಚುವರಿ ವಿಳಂಬ',
      te: 'తడి-వాతావరణ పెనాల్టీ: వర్షంలో బహిరంగ నడక/రహదారి ఆలస్యం',
      hi: 'गीले मौसम का विलंब: बारिश में खुले पैदल या सड़क मार्ग पर देरी',
      ml: 'മഴക്കാല പിഴ: മഴയത്ത് തുറന്ന നടത്തത്തിനും റോഡിനും അധിക സമയം',
      ta: 'மழைக்காலத் தாமதம்: மழையில் திறந்த நடை மற்றும் சாலைத் தாமதம்',
      mr: 'ओल्या हवामानाचा दंड: पावसामुळे उघड्या चालण्यात व रस्त्यावर विलंब',
    }[lang];
  }

  let recommendedReason = route.recommendedReason;
  if (route.recommended) {
    if (priority === 'lowest_co2') {
      recommendedReason = {
        kn: `ಹವಾಮಾನ-ಸ್ಮಾರ್ಟ್ ಆಯ್ಕೆ: ${title} ಮೂಲಕ ${route.co2PreventedKg} ಕೆ.ಜಿ CO₂ ಉಳಿತಾಯ.`,
        te: `వాతావరణ-స్మార్ట్ ఎంపిక: ${title} ద్వారా ${route.co2PreventedKg} కిలోల CO₂ ఆదా.`,
        hi: `मौसम-स्मार्ट चयन: ${title} से ${route.co2PreventedKg} किग्रा CO₂ की बचत।`,
        ml: `സ്മാർട്ട് തിരഞ്ഞെടുപ്പ്: ${title} വഴി ${route.co2PreventedKg} കിലോ CO₂ ലാഭിക്കുന്നു.`,
        ta: `சிறந்த தேர்வு: ${title} மூலம் ${route.co2PreventedKg} கிலோ CO₂ சேமிப்பு.`,
        mr: `स्मार्ट निवड: ${title} मुळे ${route.co2PreventedKg} किग्रॅ CO₂ बचत.`,
      }[lang];
    } else if (priority === 'fastest') {
      recommendedReason = {
        kn: `ವೇಗದ ತಲುಪುವಿಕೆ (${route.totalDurationMin} ನಿಮಿಷ) — ಸಿಗ್ನಲ್ ದಟ್ಟಣೆ ತಪ್ಪಿಸುತ್ತದೆ.`,
        te: `అత్యంత వేగవంతమైన ప్రయాణం (${route.totalDurationMin} నిమిషాలు).`,
        hi: `सबसे तेज़ पहुँच (${route.totalDurationMin} मिनट) — ट्रैफिक जाम से बचाव।`,
        ml: `ഏറ്റവും വേഗത്തിലുള്ള യാത്ര (${route.totalDurationMin} മിനിറ്റ്).`,
        ta: `மிக விரைவான பயணம் (${route.totalDurationMin} நிமிடங்கள்).`,
        mr: `सर्वात वेगवान प्रवास (${route.totalDurationMin} मिनिटे).`,
      }[lang];
    } else if (priority === 'lowest_fare') {
      recommendedReason = {
        kn: `ಕಡಿಮೆ ಪ್ರಯಾಣ ವೆಚ್ಚ — ಕೇವಲ ₹${route.totalFareInr} ಒಟ್ಟು ದರ.`,
        te: `తక్కువ ప్రయాణ ఖర్చు — మొత్తం ₹${route.totalFareInr} మాత్రమే.`,
        hi: `सबसे कम किराया — कुल केवल ₹${route.totalFareInr}।`,
        ml: `ഏറ്റവും കുറഞ്ഞ നിരക്ക് — ആകെ ₹${route.totalFareInr}.`,
        ta: `குறைந்த கட்டணம் — மொத்தம் ₹${route.totalFareInr} மட்டுமே.`,
        mr: `सर्वात कमी भाडे — एकूण फक्त ₹${route.totalFareInr}.`,
      }[lang];
    } else if (priority === 'safest_women') {
      recommendedReason = {
        kn: `ಮಹಿಳೆಯರಿಗೆ ಸುರಕ್ಷಿತ ಮಾರ್ಗ (${route.safeCorridorCoveragePct}% ಸುರಕ್ಷಿತ ಕಾರಿಡಾರ್, CCTV ಮತ್ತು ಪೊಲೀಸ್ ಗಸ್ತು).`,
        te: `మహిళలకు సురక్షిత మార్గం (${route.safeCorridorCoveragePct}% సేఫ్ కారిడార్, CCTV & పోలీస్ పెట్రోల్).`,
        hi: `महिलाओं के लिए सुरक्षित मार्ग (${route.safeCorridorCoveragePct}% सुरक्षित कॉरिडोर, CCTV व पुलिस गश्त)।`,
        ml: `സ്ത്രീകൾക്ക് സുരക്ഷിതമായ റൂട്ട് (${route.safeCorridorCoveragePct}% സുരക്ഷാ കോറിഡോർ, CCTV & പോലീസ് പട്രോൾ).`,
        ta: `பெண்களுக்கு பாதுகாப்பான வழி (${route.safeCorridorCoveragePct}% பாதுகாப்பு வழித்தடம், CCTV & காவல் ரோந்து).`,
        mr: `महिलांसाठी सुरक्षित मार्ग (${route.safeCorridorCoveragePct}% सुरक्षित कॉरिडॉर, CCTV व पोलीस गस्त).`,
      }[lang];
    } else {
      recommendedReason = {
        kn: `ಕನಿಷ್ಠ ನಡಿಗೆ (~${route.walkingMeters} ಮೀ) ನೇರ ಫೀಡರ್ ಸಂಪರ್ಕದೊಂದಿಗೆ.`,
        te: `కనీస నడక (~${route.walkingMeters} మీ) నేరుగా ఫీడర్ కనెక్షన్‌తో.`,
        hi: `न्यूनतम पैदल (~${route.walkingMeters} मी) सीधे फीडर संपर्क के साथ।`,
        ml: `കുറഞ്ഞ നടത്തം (~${route.walkingMeters} മീ) നേരിട്ടുള്ള ഫീഡർ സൗകര്യത്തോടെ.`,
        ta: `குறைந்த நடை (~${route.walkingMeters} மீ) நேரடி ஃபீடர் இணைப்புடன்.`,
        mr: `किमान चालणे (~${route.walkingMeters} मी) थेट फीडर जोडणीसह.`,
      }[lang];
    }
  }

  return {
    ...route,
    title,
    subtitle,
    recommendedReason,
    weatherAdaptationBadge,
    wetWeatherPenaltyNote,
    legs: localizedLegs,
  };
}

/**
 * Generates clear spoken step-by-step transit instructions for the selected itinerary in the active language.
 */
export function formatItineraryVoiceReadout(
  localizedRoute: Itinerary,
  originName: string,
  destinationName: string,
  lang: AppLanguage
): string {
  const stepText = localizedRoute.legs
    .map(
      (leg, idx) =>
        `${idx + 1}. ${leg.modeLabel}: ${leg.from} → ${leg.to} (${leg.durationMin}m, ₹${leg.fareInr}).`
    )
    .join(' ');

  if (lang === 'en') {
    return `Route from ${originName} to ${destinationName} via ${localizedRoute.title}. Total ${localizedRoute.totalDurationMin} minutes, fare ₹${localizedRoute.totalFareInr}, ${localizedRoute.co2PreventedKg} kilograms CO2 prevented. Steps: ${stepText}`;
  }
  if (lang === 'kn') {
    return `${originName} ನಿಂದ ${destinationName} ಗೆ ${localizedRoute.title} ಮಾರ್ಗ. ಒಟ್ಟು ${localizedRoute.totalDurationMin} ನಿಮಿಷ, ದರ ₹${localizedRoute.totalFareInr}, ${localizedRoute.co2PreventedKg} ಕೆ.ಜಿ CO₂ ಉಳಿತಾಯ. ಹಂತಗಳು: ${stepText}`;
  }
  if (lang === 'te') {
    return `${originName} నుండి ${destinationName} కు ${localizedRoute.title} మార్గం. మొత్తం ${localizedRoute.totalDurationMin} నిమిషాలు, ఛార్జీ ₹${localizedRoute.totalFareInr}, ${localizedRoute.co2PreventedKg} కిలోల CO₂ ఆదా. దశలు: ${stepText}`;
  }
  if (lang === 'hi') {
    return `${originName} से ${destinationName} तक ${localizedRoute.title} मार्ग। कुल ${localizedRoute.totalDurationMin} मिनट, किराया ₹${localizedRoute.totalFareInr}, ${localizedRoute.co2PreventedKg} किलोग्राम CO₂ बचत। चरण: ${stepText}`;
  }
  if (lang === 'ml') {
    return `${originName}-ൽ നിന്ന് ${destinationName}-ലേക്ക് ${localizedRoute.title} വഴി യാത്ര. ആകെ ${localizedRoute.totalDurationMin} മിനിറ്റ്, നിരക്ക് ₹${localizedRoute.totalFareInr}, ${localizedRoute.co2PreventedKg} കിലോ CO₂ ലാഭം. ഘട്ടങ്ങൾ: ${stepText}`;
  }
  if (lang === 'ta') {
    return `${originName}-லிருந்து ${destinationName} செல்லும் ${localizedRoute.title} வழித்தடம். மொத்தம் ${localizedRoute.totalDurationMin} நிமிடங்கள், கட்டணம் ₹${localizedRoute.totalFareInr}, ${localizedRoute.co2PreventedKg} கிலோ CO₂ சேமிப்பு. படிகள்: ${stepText}`;
  }
  return `${originName} ते ${destinationName} ${localizedRoute.title} मार्ग. एकूण ${localizedRoute.totalDurationMin} मिनिटे, भाडे ₹${localizedRoute.totalFareInr}, ${localizedRoute.co2PreventedKg} किग्रॅ CO₂ बचत. टप्पे: ${stepText}`;
}

export function localizeDepartureLabel(
  dep: DepartureWindow,
  lang: AppLanguage
): string {
  return UI_TRANSLATIONS[lang].planner.departures[dep];
}

// ---------------------------------------------------------------------------
// 4. Localized Automatic & On-Demand TTS Formatters
// ---------------------------------------------------------------------------

export function formatLocalizedWeatherSpeechAlert(
  telemetry: WeatherTelemetry,
  impact: WeatherTrafficImpact,
  lang: AppLanguage
): string {
  const t = UI_TRANSLATIONS[lang].weather;
  const condLabel = t.conditions[telemetry.condition];
  const tempStr = telemetry.temperatureC.toFixed(1);
  const gripStr = impact.roadFrictionCoeff.toFixed(2);

  if (lang === 'en') {
    if (telemetry.condition === 'clear') {
      return `Bengaluru weather update: ${telemetry.weatherLabel}, ${tempStr} degrees Celsius. Dry road grip restored and zero-emission Yulu and Metro routing active.`;
    }
    if (telemetry.condition === 'heavy_rain') {
      return `Bengaluru weather alert: ${impact.label}, ${tempStr} degrees Celsius. Road grip reduced to ${gripStr}. Plus 2 second yellow buffer and covered Metro or E-Auto routing active.`;
    }
    return `Bengaluru weather update: ${telemetry.weatherLabel}, ${tempStr} degrees Celsius. ${impact.transitAdvantageNote}`;
  }

  const templates: Record<Exclude<AppLanguage, 'en'>, string> = {
    kn: `ಬೆಂಗಳೂರು ಹವಾಮಾನ ಮಾಹಿತಿ: ${condLabel}, ${tempStr}°C. ರಸ್ತೆ ಹಿಡಿತ ${gripStr}. ${t.impactNotes[telemetry.condition]}`,
    te: `బెంగళూరు వాతావరణ అప్‌డేట్: ${condLabel}, ${tempStr}°C. రోడ్డు గ్రిప్ ${gripStr}. ${t.impactNotes[telemetry.condition]}`,
    hi: `बेंगलुरु मौसम अपडेट: ${condLabel}, ${tempStr}°C। सड़क घर्षण ${gripStr}। ${t.impactNotes[telemetry.condition]}`,
    ml: `ബെംഗളൂരു കാലാവസ്ഥാ അറിയിപ്പ്: ${condLabel}, ${tempStr}°C. റോഡ് ഗ്രിപ്പ് ${gripStr}. ${t.impactNotes[telemetry.condition]}`,
    ta: `பெங்களூரு வானிலை தகவல்: ${condLabel}, ${tempStr}°C. சாலைப் பிடிப்பு ${gripStr}. ${t.impactNotes[telemetry.condition]}`,
    mr: `बेंगळुरू हवामान सूचना: ${condLabel}, ${tempStr}°C. रस्त्याची पकड ${gripStr}. ${t.impactNotes[telemetry.condition]}`,
  };
  return templates[lang];
}

export function formatLocalizedIncidentSpeechAlert(
  incident: TrafficAlertIncident,
  corridor: Corridor,
  signalMode: SignalMode,
  lang: AppLanguage
): string {
  const locAlert = localizeTrafficAlert(incident, corridor, signalMode, lang);
  const corridorLabel =
    UI_TRANSLATIONS[lang].signals.corridors[corridor.id]?.shortName ??
    localizeBengaluruPlaceName(corridor.shortName, lang);

  if (lang === 'en') {
    const modeClause =
      signalMode === 'adaptive'
        ? 'Adaptive green wave active.'
        : 'Fixed signal timing active.';
    return `Traffic AI alert on ${corridorLabel}: ${locAlert.categoryLabel} at ${locAlert.junctionName}, plus ${locAlert.estDelayMin} minutes estimated delay. ${modeClause}`;
  }

  const templates: Record<Exclude<AppLanguage, 'en'>, string> = {
    kn: `ಟ್ರಾಫಿಕ್ AI ಎಚ್ಚರಿಕೆ (${corridorLabel}): ${locAlert.junctionName} ಬಳಿ ${locAlert.categoryLabel}, +${locAlert.estDelayMin} ನಿಮಿಷ ವಿಳಂಬ. ${locAlert.aiMitigationNote}`,
    te: `ట్రాఫిక్ AI అలర్ట్ (${corridorLabel}): ${locAlert.junctionName} వద్ద ${locAlert.categoryLabel}, +${locAlert.estDelayMin} నిమిషాల ఆలస్యం. ${locAlert.aiMitigationNote}`,
    hi: `ट्रैफिक AI अलर्ट (${corridorLabel}): ${locAlert.junctionName} पर ${locAlert.categoryLabel}, +${locAlert.estDelayMin} मिनट विलंब। ${locAlert.aiMitigationNote}`,
    ml: `ട്രാഫിക് AI മുന്നറിയിപ്പ് (${corridorLabel}): ${locAlert.junctionName}-ൽ ${locAlert.categoryLabel}, +${locAlert.estDelayMin} മിനിറ്റ് വൈകൽ. ${locAlert.aiMitigationNote}`,
    ta: `டிராஃபிக் AI எச்சரிக்கை (${corridorLabel}): ${locAlert.junctionName} சந்திப்பில் ${locAlert.categoryLabel}, +${locAlert.estDelayMin} நிமிட தாமதம். ${locAlert.aiMitigationNote}`,
    mr: `ट्रॅफिक AI सूचना (${corridorLabel}): ${locAlert.junctionName} येथे ${locAlert.categoryLabel}, +${locAlert.estDelayMin} मिनिटे विलंब. ${locAlert.aiMitigationNote}`,
  };
  return templates[lang];
}

export function formatLocalizedLocalityWeatherSpeechAlert(
  originName: string,
  destName: string,
  destMicro: LocalityMicroWeather,
  lang: AppLanguage
): string {
  const origLoc = localizeBengaluruPlaceName(originName, lang);
  const destLoc = localizeBengaluruPlaceName(destName, lang);
  const tempStr = destMicro.temperatureC.toFixed(1);

  if (lang === 'en') {
    if (destMicro.waterloggingRisk || destMicro.condition === 'heavy_downpour') {
      return `Route weather alert for ${origLoc} to ${destLoc}: Waterlogging risk at ${destLoc}, ${tempStr} degrees Celsius. Last-mile switched to covered E-Auto.`;
    }
    return `Route weather notice for ${destLoc}: ${destMicro.label}, ${tempStr} degrees Celsius.`;
  }

  const condLabel = UI_TRANSLATIONS[lang].weather.microLabels[destMicro.condition];
  const templates: Record<Exclude<AppLanguage, 'en'>, string> = {
    kn: `${origLoc} ನಿಂದ ${destLoc} ಮಾರ್ಗ ಹವಾಮಾನ ಸೂಚನೆ: ${destLoc} ನಲ್ಲಿ ${condLabel}, ${tempStr}°C. ಕೊನೆಯ-ಮೈಲಿ ಕವರ್ಡ್ ಇ-ಆಟೋ ಸಕ್ರಿಯ.`,
    te: `${origLoc} నుండి ${destLoc} మార్గ వాతావరణ సూచన: ${destLoc} వద్ద ${condLabel}, ${tempStr}°C. కవర్డ్ ఇ-ఆటో సక్రియం.`,
    hi: `${origLoc} से ${destLoc} मार्ग मौसम सूचना: ${destLoc} पर ${condLabel}, ${tempStr}°C। अंतिम मील कवर्ड ई-ऑटो सक्रिय।`,
    ml: `${origLoc}-ൽ നിന്ന് ${destLoc} യാത്രാ കാലാവസ്ഥാ അറിയിപ്പ്: ${destLoc}-ൽ ${condLabel}, ${tempStr}°C.`,
    ta: `${origLoc}-லிருந்து ${destLoc} வழி வானிலை தகவல்: ${destLoc}-ல் ${condLabel}, ${tempStr}°C. மூடிய மின்-ஆட்டோ மாற்றப்பட்டது.`,
    mr: `${origLoc} ते ${destLoc} मार्ग हवामान सूचना: ${destLoc} येथे ${condLabel}, ${tempStr}°C. कव्हर्ड ई-ऑटो सक्रिय.`,
  };
  return templates[lang];
}

// ---------------------------------------------------------------------------
// 5. Analytics Chart & Table Localizers
// ---------------------------------------------------------------------------

export function localizeZoneDelayData(
  data: ZoneDelayDatum[],
  lang: AppLanguage
): ZoneDelayDatum[] {
  if (lang === 'en') return data;
  const zT = UI_TRANSLATIONS[lang].planner.zones;
  const sT = UI_TRANSLATIONS[lang].analytics.shortZones;

  return data.map((row) => ({
    ...row,
    zone: zT[row.zone as keyof typeof zT]?.name ?? row.zone,
    shortZone: sT[row.shortZone] ?? row.shortZone,
  }));
}

export function localizeModeEmissionData(
  data: ModeEmissionDatum[],
  lang: AppLanguage
): ModeEmissionDatum[] {
  if (lang === 'en') return data;
  const mT = UI_TRANSLATIONS[lang].analytics.modes;
  return data.map((row) => ({
    ...row,
    mode: mT[row.mode]?.mode ?? row.mode,
    shortMode: mT[row.mode]?.shortMode ?? row.shortMode,
  }));
}
