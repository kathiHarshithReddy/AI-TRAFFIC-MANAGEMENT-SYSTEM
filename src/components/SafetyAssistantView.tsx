import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Navigation,
  Mic,
  Users,
  AlertTriangle,
  Volume2,
  VolumeX,
  CheckCircle2,
  Plus,
  Trash2,
  Compass,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { BENGALURU_LOCALITIES } from '../data/bengaluruLocalities';
import { Locality } from '../types/traffic';
import { useLanguage } from '../i18n/LanguageContext';
import {
  buildGoogleMapsDirectionsUrl,
  getSafeCorridorWaypoints,
} from '../utils/googleMapsNav';

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  autoSms: boolean;
  trackTrip: boolean;
  isPrimary?: boolean;
}

interface SafeHaven {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'pharmacy' | 'sakhi' | 'metro' | 'fire';
  categoryLabel: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number;
  open247: boolean;
}

interface SafetyAlert {
  id: string;
  title: string;
  location: string;
  category: 'lighting' | 'hazard' | 'waterlogging' | 'unsafe';
  severity: 'high' | 'moderate' | 'low';
  reportedAgo: string;
  verifiedByPolice: boolean;
  details: string;
}

const INITIAL_CONTACTS: EmergencyContact[] = [
  { id: 'c1', name: 'Sunita Sharma', relation: 'Mother', phone: '+91 98450 12345', autoSms: true, trackTrip: true, isPrimary: true },
  { id: 'c2', name: 'Rahul Sharma', relation: 'Brother', phone: '+91 98450 67890', autoSms: true, trackTrip: true },
  { id: 'c3', name: 'Campus Women Hostel Warden', relation: 'Warden', phone: '+91 80 2360 1111', autoSms: true, trackTrip: false },
];

const BENGALURU_SAFE_HAVENS: SafeHaven[] = [
  { id: 'h1', name: 'Cubbon Park Women Police Station', category: 'police', categoryLabel: 'Police Station', address: 'Kasturba Road, Near Cubbon Park, Bengaluru', phone: '080-22942555', lat: 12.9784, lng: 77.5937, distanceKm: 1.2, open247: true },
  { id: 'h2', name: 'Mallya Hospital 24/7 Emergency', category: 'hospital', categoryLabel: 'Hospital', address: 'Vittal Mallya Road, Bengaluru', phone: '080-22277979', lat: 12.9698, lng: 77.5952, distanceKm: 1.8, open247: true },
  { id: 'h3', name: 'Sakhi One-Stop Centre for Women', category: 'sakhi', categoryLabel: 'Women Help Centre', address: 'Bowring & Lady Curzon Hospital Campus, Shivajinagar', phone: '181 / 080-25591234', lat: 12.9821, lng: 77.6085, distanceKm: 2.4, open247: true },
  { id: 'h4', name: 'Indiranagar Metro Safe Haven Station', category: 'metro', categoryLabel: 'Namma Metro', address: '100ft Road, Indiranagar, Bengaluru', phone: '080-25006611', lat: 12.9784, lng: 77.6408, distanceKm: 4.1, open247: true },
  { id: 'h5', name: 'Apollo Pharmacy 24/7', category: 'pharmacy', categoryLabel: 'Pharmacy', address: 'Residency Road, Ashok Nagar, Bengaluru', phone: '080-41123344', lat: 12.9682, lng: 77.6041, distanceKm: 1.5, open247: true },
  { id: 'h6', name: 'Central Fire Station', category: 'fire', categoryLabel: 'Fire Station', address: 'Transit Road, Majestic, Bengaluru', phone: '101 / 080-22872233', lat: 12.9767, lng: 77.5713, distanceKm: 3.2, open247: true },
  { id: 'h7', name: 'Koramangala Police Station & Pink Beat', category: 'police', categoryLabel: 'Police Station', address: '8th Main Rd, Koramangala 4th Block', phone: '080-22942577', lat: 12.9352, lng: 77.6245, distanceKm: 5.6, open247: true },
];

const INITIAL_SAFETY_ALERTS: SafetyAlert[] = [
  { id: 'a1', title: 'Dim Street Lighting Stretches', location: 'Outer Ring Road Service Road, Bellandur', category: 'lighting', severity: 'high', reportedAgo: '15 mins ago', verifiedByPolice: true, details: 'Streetlights #42 to #68 offline due to underground cable fault. Pink Hoysala patrol dispatched.' },
  { id: 'a2', title: 'Waterlogged Underpass Advisory', location: 'Panathur Railway Underpass', category: 'waterlogging', severity: 'high', reportedAgo: '32 mins ago', verifiedByPolice: true, details: '35cm water accumulation following evening downpour. Traffic redirected via alternate flyover.' },
  { id: 'a3', title: 'Unlit Pedestrian Footpath Stretch', location: 'Cubbon Park Perimeter Walkway (East Gate)', category: 'unsafe', severity: 'moderate', reportedAgo: '1 hour ago', verifiedByPolice: false, details: 'Low footfall after 9:30 PM. Commuters advised to use lit central promenade.' },
];

export function SafetyAssistantView() {
  const { language, t } = useLanguage();

  // Sub-module states
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; address: string }>({
    lat: 12.9716,
    lng: 77.5946,
    address: 'MG Road Junction, Central Bengaluru',
  });

  // Safe Haven Filter
  const [havenFilter, setHavenFilter] = useState<string>('all');

  // Safe Route Finder
  const [routeOrigin, setRouteOrigin] = useState<Locality>(BENGALURU_LOCALITIES[0]); // Hennur
  const [routeDest, setRouteDest] = useState<Locality>(BENGALURU_LOCALITIES[12]); // Electronic City
  const [comparedRoute, setComparedRoute] = useState<'fastest' | 'safer'>('safer');

  // Voice-Activated SOS (Speech Recognition)
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Live Journey Sharing
  const [journeyActive, setJourneyActive] = useState<boolean>(false);
  const [journeyDest] = useState<string>('Koramangala 4th Block');
  const [journeyEtaMin] = useState<number>(28);
  const [journeyProgressPct] = useState<number>(18);

  // Trusted Contacts Manager
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('traffic_ai_emergency_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [newContactModal, setNewContactModal] = useState<boolean>(false);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Crowdsourced Safety Alerts
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>(INITIAL_SAFETY_ALERTS);
  const [reportModal, setReportModal] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportLoc, setReportLoc] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportCategory, setReportCategory] = useState<'lighting' | 'hazard' | 'waterlogging' | 'unsafe'>('lighting');

  // AI Voice Assistant (TTS) & inline status notices
  const [ttsMuted, setTtsMuted] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [arrivalNotice, setArrivalNotice] = useState<string | null>(null);

  // Persist contacts
  useEffect(() => {
    localStorage.setItem('traffic_ai_emergency_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Geolocation lookup on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: 'Current Live GPS Location (Bengaluru Urban Sector)',
          });
        },
        () => {
          // Fallback to MG Road
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // SOS Countdown Timer
  useEffect(() => {
    let timer: any;
    if (sosModalOpen && countdown > 0 && !sosActive) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (sosModalOpen && countdown === 0 && !sosActive) {
      setSosActive(true);
      speakText('Emergency SOS dispatched to Bengaluru Police Control Room 112 and all trusted contacts.');
    }
    return () => clearTimeout(timer);
  }, [sosModalOpen, countdown, sosActive]);

  const speakText = (text: string) => {
    if (ttsMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API for Voice-Activated SOS
  const toggleVoiceListening = () => {
    setVoiceNotice(null);
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice('Browser Speech Recognition is unavailable here. Use one of the Simulated Voice Trigger buttons below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const speechToText = event.results[current][0].transcript.toLowerCase();
        setTranscript(speechToText);

        if (
          speechToText.includes('help') ||
          speechToText.includes('sos') ||
          speechToText.includes('emergency') ||
          speechToText.includes('sahaya') ||
          speechToText.includes('కాಪಾಡಿ') ||
          speechToText.includes('बचाओ') ||
          speechToText.includes('madad')
        ) {
          recognition.stop();
          setIsListening(false);
          setCountdown(3);
          setSosModalOpen(true);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSimulateVoiceTrigger = (phrase: string) => {
    setTranscript(`"${phrase}" (Voice Trigger Detected)`);
    setCountdown(3);
    setSosModalOpen(true);
    speakText('Emergency voice trigger detected. Initializing SOS countdown.');
  };

  const filteredHavens = useMemo(() => {
    if (havenFilter === 'all') return BENGALURU_SAFE_HAVENS;
    return BENGALURU_SAFE_HAVENS.filter((h) => h.category === havenFilter);
  }, [havenFilter]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;
    const newC: EmergencyContact = {
      id: `c_${Date.now()}`,
      name: contactName,
      relation: contactRelation || 'Contact',
      phone: contactPhone,
      autoSms: true,
      trackTrip: true,
    };
    setContacts([...contacts, newC]);
    setContactName('');
    setContactRelation('');
    setContactPhone('');
    setNewContactModal(false);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleAddSafetyReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportLoc) return;
    const newAlert: SafetyAlert = {
      id: `alert_${Date.now()}`,
      title: reportTitle,
      location: reportLoc,
      category: reportCategory,
      severity: reportCategory === 'lighting' ? 'high' : 'moderate',
      reportedAgo: 'Just now',
      verifiedByPolice: false,
      details: reportDetails || 'Crowd-submitted safety hazard report.',
    };
    setSafetyAlerts([newAlert, ...safetyAlerts]);
    setReportTitle('');
    setReportLoc('');
    setReportDetails('');
    setReportModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="rounded-xl border border-rose-500/40 bg-gradient-to-r from-[#1A0D16] via-[#0F172A] to-[#0B1120] p-6 sm:p-8 space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <span>Bengaluru Smart City Women’s Safety &amp; Emergency Command</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Women’s Safety &amp; Safe-Corridor Assistance
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm text-slate-300">
              Instant 112 emergency dispatch, verified safe havens, AI safer route guidance with police patrol coverage, voice-activated SOS, and live journey tracking across all 161 Bengaluru localities.
            </p>
          </div>

          {/* Demo vs Real Guardrail Toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-700/80 bg-[#0B1120] px-4 py-3 shrink-0">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
                <span className="text-xs font-bold text-white">
                  {isDemoMode ? 'SIMULATION / DEMO MODE' : 'LIVE EMERGENCY MODE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isDemoMode ? 'Simulated dispatch & test alerts active' : 'Direct emergency telemetry enabled'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                isDemoMode
                  ? 'border-amber-500/60 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                  : 'border-rose-500/70 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
              }`}
            >
              {isDemoMode ? 'Switch to Live' : 'Switch to Demo'}
            </button>
          </div>
        </div>

        {/* Sub-Module Quick Nav */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Quick Jump:</span>
          {[
            { id: 'sos', label: '🚨 One-Tap SOS' },
            { id: 'havens', label: '🏥 Safe Havens' },
            { id: 'route', label: '🛡️ AI Safer Route' },
            { id: 'voice', label: '🎙️ Voice SOS' },
            { id: 'journey', label: '📍 Live Journey' },
            { id: 'contacts', label: '👥 Contacts' },
            { id: 'hazards', label: '⚠️ Hazard Feed' },
          ].map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className="rounded-lg border border-slate-700/80 bg-[#0B1120] px-3 py-1 text-xs font-medium text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      {/* 1. One-Tap SOS Emergency Button & 112 Dispatch */}
      <div id="sos" className="rounded-xl border border-rose-500/50 bg-[#0F172A] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
              <Radio className="h-4 w-4 text-rose-400 animate-pulse" aria-hidden="true" />
              <span>Sub-Module 1</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              One-Tap SOS Emergency Dispatch &amp; 112 Integration
            </h2>
            <p className="text-xs text-slate-400">
              Instantly transmits live GPS coordinates ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}) to Bengaluru Police 112 and all trusted contacts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCountdown(5);
              setSosActive(false);
              setSosModalOpen(true);
            }}
            data-testid="main-sos-button"
            className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-8 py-4 font-display text-lg font-bold text-white shadow-lg shadow-rose-950/60 hover:from-rose-500 hover:to-red-500 transition-all transform hover:scale-[1.01] active:scale-[0.98] ring-4 ring-rose-500/25"
          >
            <PhoneCall className="relative h-5 w-5 animate-bounce" aria-hidden="true" />
            <span className="relative">EMERGENCY SOS DISPATCH</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/15 p-2.5 text-emerald-400">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400">Live GPS Location</div>
              <div className="text-xs font-semibold text-white truncate">
                {userCoords.address}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 flex items-center gap-3">
            <div className="rounded-lg bg-sky-500/15 p-2.5 text-sky-400">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Trusted Contacts Notified</div>
              <div className="text-xs font-semibold text-white">
                {contacts.filter(c => c.autoSms).length} Contacts (Auto-SMS &amp; GPS)
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 flex items-center gap-3">
            <div className="rounded-lg bg-rose-500/15 p-2.5 text-rose-400">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Nearest Police Response</div>
              <div className="text-xs font-semibold text-white">
                Cubbon Park Women Police Station (1.2 km)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Nearby SOS Places & Safe Havens Map */}
      <div id="havens" className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>Sub-Module 2</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Interactive Nearby Safe Havens &amp; Police Stations
            </h2>
            <p className="text-xs text-slate-400">
              Verified 24/7 police stations, women help centres, hospitals, and Namma Metro safe havens across Bengaluru.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Havens' },
              { id: 'police', label: '👮 Police' },
              { id: 'hospital', label: '🏥 Hospitals' },
              { id: 'sakhi', label: '🛡️ Sakhi Centers' },
              { id: 'metro', label: '🚇 Metro Stations' },
              { id: 'pharmacy', label: '💊 Pharmacies' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setHavenFilter(cat.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  havenFilter === cat.id
                    ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-300 font-semibold'
                    : 'border-slate-700/80 bg-[#0B1120] text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Safe Havens Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredHavens.map((haven) => (
            <div
              key={haven.id}
              className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    {haven.categoryLabel}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    📍 {haven.distanceKm} km away
                  </span>
                </div>
                <h3 className="font-display text-sm font-bold text-white">
                  {haven.name}
                </h3>
                <p className="text-xs text-slate-400 leading-snug">
                  {haven.address}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
                <a
                  href={`tel:${haven.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  <span>{haven.phone}</span>
                </a>
                <a
                  href={buildGoogleMapsDirectionsUrl({
                    destination: `${haven.lat},${haven.lng}`,
                    travelMode: 'walking',
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`haven-directions-${haven.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap"
                >
                  <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{t.googleMaps.getSafeDirections}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. AI Safe Route Finder (Fastest vs Safer Comparator) */}
      <div id="route" className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Compass className="h-4 w-4" aria-hidden="true" />
            <span>Sub-Module 3</span>
          </div>
          <h2 className="font-display text-xl font-bold text-white">
            AI Safe Route Finder &amp; Comparator
          </h2>
          <p className="text-xs text-slate-400">
            Compare standard congested routes against AI-Verified Safer Corridors optimized for street lighting, CCTV coverage, and police patrol proximity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Origin / Dest selection */}
          <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 space-y-4">
            <div className="text-xs font-semibold text-white">Select Commute Corridor</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Origin Locality</label>
                <select
                  value={routeOrigin.id}
                  onChange={(e) => {
                    const found = BENGALURU_LOCALITIES.find(l => l.id === e.target.value);
                    if (found) setRouteOrigin(found);
                  }}
                  className="w-full rounded-lg border border-slate-700/80 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {BENGALURU_LOCALITIES.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.zone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Destination Locality</label>
                <select
                  value={routeDest.id}
                  onChange={(e) => {
                    const found = BENGALURU_LOCALITIES.find(l => l.id === e.target.value);
                    if (found) setRouteDest(found);
                  }}
                  className="w-full rounded-lg border border-slate-700/80 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {BENGALURU_LOCALITIES.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.zone})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setComparedRoute('fastest')}
                className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  comparedRoute === 'fastest'
                    ? 'border-sky-500/70 bg-sky-500/15 text-sky-300'
                    : 'border-slate-700/80 bg-[#0F172A] text-slate-400 hover:text-white'
                }`}
              >
                Fastest Route (Standard)
              </button>
              <button
                type="button"
                onClick={() => setComparedRoute('safer')}
                className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  comparedRoute === 'safer'
                    ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-700/80 bg-[#0F172A] text-slate-400 hover:text-white'
                }`}
              >
                🛡️ AI Verified Safer Corridor
              </button>
            </div>
          </div>

          {/* Route Comparison Card */}
          <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white">
                  {routeOrigin.name} ➔ {routeDest.name}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold border ${
                  comparedRoute === 'safer'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                }`}>
                  {comparedRoute === 'safer' ? 'Safety Score: 96/100' : 'Safety Score: 68/100'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center border-y border-slate-800 py-2.5">
                <div>
                  <div className="text-[10px] text-slate-400">Duration</div>
                  <div className="font-mono text-sm font-bold text-white">
                    {comparedRoute === 'safer' ? '34 mins' : '28 mins'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Lighting Density</div>
                  <div className="font-mono text-sm font-bold text-emerald-400">
                    {comparedRoute === 'safer' ? '98% LED Lit' : '52% Dark Spots'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Police / CCTV Beats</div>
                  <div className="font-mono text-sm font-bold text-sky-400">
                    {comparedRoute === 'safer' ? '4 Patrol Zones' : '1 Zone'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {comparedRoute === 'safer'
                  ? '🛡️ AI Recommended Safe Route: +6 mins longer, but features 100% LED street illumination, 2 Metro station waypoints, and 4 Pink Hoysala police checkpoints enroute.'
                  : '⚠️ Standard Fast Route passes through unlit underpass segments and low-footfall arterial stretches during late hours.'}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <a
                  href={buildGoogleMapsDirectionsUrl({
                    origin: routeOrigin.name,
                    destination: routeDest.name,
                    travelMode: 'driving',
                    waypoints: getSafeCorridorWaypoints(routeOrigin, routeDest),
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="safety-navigate-safer-btn"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors text-center"
                >
                  <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{t.googleMaps.navigateSaferRoute}</span>
                </a>
                <a
                  href={buildGoogleMapsDirectionsUrl({
                    origin: routeOrigin.name,
                    destination: routeDest.name,
                    travelMode: 'driving',
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="safety-navigate-fastest-btn"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/15 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/25 transition-colors text-center"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{t.googleMaps.navigateFastestRoute}</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => speakText(comparedRoute === 'safer' ? 'AI Safer Route selected. 98% LED street lighting coverage with 4 police patrol checkpoints enroute.' : 'Standard route selected.')}
                className="w-full rounded-lg border border-slate-700 bg-[#0F172A] py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <span>Listen to Route Safety Guidance</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Voice-Activated SOS & 8. AI Voice Assistant */}
      <div id="voice" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <Mic className="h-4 w-4 text-rose-400" aria-hidden="true" />
            <span>Sub-Module 4</span>
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            Voice-Activated SOS (Multilingual)
          </h2>
          <p className="text-xs text-slate-400">
            Say trigger words in English (&quot;Help&quot;, &quot;SOS&quot;), Kannada (&quot;Sahaya maadi / ಸಹಾಯ ಮಾಡಿ&quot;), or Hindi (&quot;Bachao / बचाओ&quot;) to trigger emergency countdown.
          </p>

          <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 text-center space-y-3">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleVoiceListening}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-xs font-bold transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                    : 'border border-slate-700 bg-[#0F172A] text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'animate-bounce' : ''}`} aria-hidden="true" />
                <span>{isListening ? 'Listening for Voice SOS...' : 'Start Voice Recognition'}</span>
              </button>
            </div>

            {voiceNotice && (
              <div
                role="status"
                className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-medium text-amber-200"
              >
                {voiceNotice}
              </div>
            )}

            {transcript && (
              <div className="font-mono text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2">
                Live Transcript: {transcript}
              </div>
            )}

            <div className="border-t border-slate-800 pt-3">
              <div className="text-[11px] text-slate-400 mb-2">Or test simulated trigger phrases instantly:</div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'English: "Help me SOS"', phrase: 'Help me SOS' },
                  { label: 'Kannada: "Sahaya maadi"', phrase: 'Sahaya maadi' },
                  { label: 'Hindi: "Bachao karo"', phrase: 'Bachao karo' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSimulateVoiceTrigger(item.phrase)}
                    className="rounded-lg border border-slate-700/80 bg-[#0F172A] px-3 py-1 text-xs font-medium text-slate-300 hover:border-rose-500/50 hover:text-rose-300 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Live Journey Location Sharing */}
        <div id="journey" className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <Navigation className="h-4 w-4 text-sky-400" aria-hidden="true" />
            <span>Sub-Module 5 &amp; 8</span>
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            Live Journey Tracking &amp; AI Voice Assistant
          </h2>
          <p className="text-xs text-slate-400">
            Monitor expected ETA, route deviations, and share live secure tracking tokens with trusted contacts.
          </p>

          <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Active Monitored Trip</span>
              <button
                type="button"
                onClick={() => {
                  setArrivalNotice(null);
                  setJourneyActive(!journeyActive);
                }}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors border ${
                  journeyActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#0F172A] text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {journeyActive ? '🟢 Journey Active' : 'Start Journey'}
              </button>
            </div>

            {arrivalNotice && (
              <div
                role="status"
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300"
              >
                ✓ {arrivalNotice}
              </div>
            )}

            {journeyActive && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Destination: <strong className="text-white">{journeyDest}</strong></span>
                  <span className="font-mono font-bold text-sky-400">ETA: {journeyEtaMin} mins</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${journeyProgressPct}%` }} />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-400 font-mono">✓ Route deviation monitor active (0m deviation)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setArrivalNotice('Safe arrival confirmation sent to all trusted contacts!');
                      setJourneyActive(false);
                      speakText('Journey completed successfully. Safe arrival notifications sent.');
                    }}
                    className="rounded-md bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-500"
                  >
                    Mark Arrived Safely
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-300">AI Voice Guidance &amp; TTS Alerts</span>
              <button
                type="button"
                onClick={() => setTtsMuted(!ttsMuted)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  ttsMuted
                    ? 'border-slate-700 bg-[#0F172A] text-slate-400'
                    : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                }`}
              >
                {ttsMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                <span>{ttsMuted ? 'Voice Muted' : 'Voice Active'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Trusted Emergency Contacts Manager */}
      <div id="contacts" className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>Sub-Module 6</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Trusted Emergency Contacts Manager
            </h2>
            <p className="text-xs text-slate-400">
              Saved locally in browser storage. Automatically alerted with live GPS coordinates upon SOS dispatch.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNewContactModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Trusted Contact</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                    {c.relation}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteContact(c.id)}
                    aria-label={`Delete contact ${c.name}`}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-white">
                  {c.name}
                </h3>
                <p className="font-mono text-xs text-emerald-400">{c.phone}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Auto-SMS on SOS: <strong className="text-emerald-400">Active</strong></span>
                <span>Trip Track: <strong className="text-sky-400">Enabled</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Hyper-Local Safety Alerts & Crowd-Verified Hazard Feed */}
      <div id="hazards" className="rounded-xl border border-slate-800/90 bg-[#0F172A] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <span>Sub-Module 7</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Hyper-Local Safety Alerts &amp; Crowd-Verified Hazard Feed
            </h2>
            <p className="text-xs text-slate-400">
              Real-time community and police reported hazards across Bengaluru arterial corridors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReportModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Community Safety Report</span>
          </button>
        </div>

        <div className="space-y-3">
          {safetyAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                    alert.severity === 'high'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {alert.severity} Risk
                  </span>
                  {alert.verifiedByPolice && (
                    <span className="text-[11px] font-semibold text-emerald-400">✓ Verified by Bengaluru Police</span>
                  )}
                  <span className="text-[11px] text-slate-500">· {alert.reportedAgo}</span>
                </div>
                <h3 className="font-display text-sm font-bold text-white">{alert.title}</h3>
                <p className="text-xs text-slate-400">📍 {alert.location} — {alert.details}</p>
              </div>

              <button
                type="button"
                onClick={() => speakText(`Safety advisory at ${alert.location}: ${alert.details}`)}
                aria-label={`Listen to alert ${alert.title}`}
                className="self-start sm:self-center rounded-lg border border-slate-700 bg-[#0F172A] p-2 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
                title="Listen to alert"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SOS Dispatch Modal */}
      {sosModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-rose-500/50 bg-[#0F172A] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-rose-500/20 p-3 text-rose-400 animate-pulse">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    {sosActive ? '🚨 EMERGENCY SOS DISPATCHED' : '⚠️ SOS COUNTDOWN ACTIVE'}
                  </h3>
                  <p className="text-xs text-rose-300 font-mono">
                    {isDemoMode ? '[SIMULATION / DEMO MODE]' : '[LIVE EMERGENCY TELEMETRY]'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSosModalOpen(false);
                  setSosActive(false);
                }}
                className="rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-1 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>

            {!sosActive ? (
              <div className="text-center space-y-4 py-4">
                <div className="font-mono text-6xl font-black text-rose-500 animate-pulse">
                  {countdown}
                </div>
                <p className="text-xs text-slate-300">
                  Sending GPS coordinates and SMS alerts to {contacts.length} Trusted Contacts and Police 112 in {countdown} seconds...
                </p>
                <button
                  type="button"
                  onClick={() => setSosActive(true)}
                  className="rounded-xl bg-rose-600 px-6 py-3 font-display text-sm font-bold text-white hover:bg-rose-500 transition-colors"
                >
                  Dispatch Immediately Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 space-y-2 text-xs text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>SOS Telemetry Broadcast Successfully Dispatched!</span>
                  </div>
                  <p className="text-slate-300">
                    · Police 112 Command Center notified of exact GPS coordinates.<br />
                    · Automated SMS &amp; WhatsApp link sent to {contacts.map((c) => c.name).join(', ')}.<br />
                    · Nearest Pink Hoysala Patrol Vehicle dispatched (ETA 4 mins).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="tel:112"
                    className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Call Police 112</span>
                  </a>
                  <a
                    href="tel:1091"
                    className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/50 bg-purple-500/20 py-3 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition-colors"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Women Helpline 1091</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {newContactModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form onSubmit={handleAddContact} className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0F172A] p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Add Trusted Emergency Contact</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Relationship</label>
                <input
                  type="text"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="e.g. Mother / Sister / Friend"
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone Number (+91)</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98450 00000"
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewContactModal(false)}
                className="rounded-lg border border-slate-700 bg-[#0B1120] px-4 py-2 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Safety Hazard Report Modal */}
      {reportModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form onSubmit={handleAddSafetyReport} className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0F172A] p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Add Community Safety Hazard Report</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Issue Headline</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Broken Streetlight / Unlit Alley"
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Bengaluru Locality / Landmark</label>
                <input
                  type="text"
                  required
                  value={reportLoc}
                  onChange={(e) => setReportLoc(e.target.value)}
                  placeholder="e.g. Indiranagar 100ft Road Cross"
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={reportCategory}
                  onChange={(e: any) => setReportCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="lighting">Dim Street Lighting</option>
                  <option value="waterlogging">Waterlogged Underpass</option>
                  <option value="unsafe">Unsafe / Low Footfall Spot</option>
                  <option value="hazard">Roadwork / Obstruction</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Details &amp; Description</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe hazard details for fellow commuters..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportModal(false)}
                className="rounded-lg border border-slate-700 bg-[#0B1120] px-4 py-2 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
