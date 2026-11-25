import { BengaluruZone, Locality, MetroLine } from '../types/traffic';

export const BENGALURU_ZONES: BengaluruZone[] = [
  'South Bengaluru',
  'North Bengaluru',
  'East Bengaluru',
  'West Bengaluru',
  'IT Hubs',
  'Central Bengaluru',
  'Outskirts',
];

export const BENGALURU_ZONE_META: Record<
  BengaluruZone,
  { subtitle: string; highlightAreas: string }
> = {
  'South Bengaluru': {
    subtitle: 'Residential & Green/Yellow/Pink Metro',
    highlightAreas: 'Jayanagar · Koramangala · JP Nagar · BTM',
  },
  'North Bengaluru': {
    subtitle: 'Airport Axis & North-West Ring',
    highlightAreas: 'Hebbal · Malleshwaram · Yelahanka · Hennur',
  },
  'East Bengaluru': {
    subtitle: 'Old Airport Rd & Purple Line Core',
    highlightAreas: 'Indiranagar · Domlur · Frazer Town · KR Puram',
  },
  'West Bengaluru': {
    subtitle: 'Chord Rd & Mysuru Expressway Radial',
    highlightAreas: 'Rajajinagar · Vijayanagar · RR Nagar · Kengeri',
  },
  'IT Hubs': {
    subtitle: 'Tech Parks, ORR & Electronic City',
    highlightAreas: 'Whitefield · Bellandur · Marathahalli · E-City',
  },
  'Central Bengaluru': {
    subtitle: 'CBD, Heritage Core & Rail Hubs',
    highlightAreas: 'MG Road · Majestic · Basavanagudi · KR Market',
  },
  Outskirts: {
    subtitle: 'Satellite Towns & Industrial Belts',
    highlightAreas: 'Hoskote · Nelamangala · Bidadi · Chandapura',
  },
};

export const METRO_LINE_INFO: Record<
  MetroLine,
  { name: string; terminus: string; colorHex: string; badgeBg: string; badgeText: string }
> = {
  Purple: {
    name: 'Purple Line',
    terminus: 'Whitefield (Kadugodi) ↔ Challaghatta',
    colorHex: '#A855F7',
    badgeBg: 'bg-purple-500/15 border-purple-500/40',
    badgeText: 'text-purple-300',
  },
  Green: {
    name: 'Green Line',
    terminus: 'Madavara ↔ Silk Institute',
    colorHex: '#10B981',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/40',
    badgeText: 'text-emerald-300',
  },
  Yellow: {
    name: 'Yellow Line',
    terminus: 'RV Road ↔ Bommasandra',
    colorHex: '#F59E0B',
    badgeBg: 'bg-amber-500/15 border-amber-500/40',
    badgeText: 'text-amber-300',
  },
  Pink: {
    name: 'Pink Line',
    terminus: 'Kalena Agrahara ↔ Tavarekere',
    colorHex: '#EC4899',
    badgeBg: 'bg-pink-500/15 border-pink-500/40',
    badgeText: 'text-pink-300',
  },
};

export interface MetroInterchange {
  station: string;
  lines: [MetroLine, MetroLine];
  lat: number;
  lng: number;
}

export const METRO_INTERCHANGES: MetroInterchange[] = [
  { station: 'Majestic (Nadaprabhu Kempegowda)', lines: ['Purple', 'Green'], lat: 12.9756, lng: 77.5728 },
  { station: 'RV Road (Rashtreeya Vidyalaya Road)', lines: ['Green', 'Yellow'], lat: 12.9214, lng: 77.5801 },
  { station: 'Jayadeva Hospital', lines: ['Yellow', 'Pink'], lat: 12.9167, lng: 77.6001 },
];

type RawLocalityTuple = [
  name: string,
  zone: BengaluruZone,
  lat: number,
  lng: number,
  congestionIndex: number,
  metroStation: string,
  metroLine: MetroLine,
  metroDistKm: number,
  railStation: string,
  railDistKm: number,
  railCorridor: string,
  primaryBuses: string[],
  vayuVajra: boolean,
  feederBuses: string[],
  aliases?: string[]
];

const RAW_LOCALITIES: RawLocalityTuple[] = [
  // 1. CENTRAL BENGALURU & OLD CITY (27)
  ['MG Road', 'Central Bengaluru', 12.9756, 77.6066, 0.78, 'MG Road Metro', 'Purple', 0.2, 'Bengaluru Cantonment', 2.6, 'East-Central Rail', ['V-335E', 'G-4', '201-R'], true, ['MF-1', '140'], ['Mahatma Gandhi Road']],
  ['Brigade Road', 'Central Bengaluru', 12.9722, 77.6074, 0.80, 'MG Road Metro', 'Purple', 0.4, 'Bengaluru Cantonment', 2.9, 'East-Central Rail', ['V-335E', 'G-4', 'KIA-7A'], true, ['MF-1', '141'], []],
  ['Residency Road', 'Central Bengaluru', 12.9698, 77.6042, 0.76, 'MG Road Metro', 'Purple', 0.7, 'Bengaluru Cantonment', 3.1, 'East-Central Rail', ['G-3', 'G-4', '315'], true, ['MF-2', '144'], []],
  ['Richmond Town', 'Central Bengaluru', 12.9635, 77.6012, 0.74, 'MG Road Metro', 'Purple', 1.3, 'Bengaluru Cantonment', 3.6, 'East-Central Rail', ['G-3', '144-E', 'KIA-7A'], true, ['MF-2', '165'], ['Richmond Circle']],
  ['Langford Town', 'Central Bengaluru', 12.9571, 77.5992, 0.72, 'Lalbagh Metro', 'Green', 1.6, 'KSR Bengaluru', 4.1, 'Central Junction', ['G-3', '171', '215'], false, ['MF-3', '168'], []],
  ['Shanthala Nagar', 'Central Bengaluru', 12.9708, 77.5991, 0.73, 'Cubbon Park Metro', 'Purple', 0.6, 'KSR Bengaluru', 3.0, 'Central Junction', ['G-4', '335-E', 'KIA-4'], true, ['MF-1', '138'], []],
  ['Vittal Mallya Road', 'Central Bengaluru', 12.9711, 77.5964, 0.74, 'Cubbon Park Metro', 'Purple', 0.5, 'KSR Bengaluru', 2.8, 'Central Junction', ['G-4', '144', '201'], true, ['MF-1', '138'], []],
  ['UB City area', 'Central Bengaluru', 12.9716, 77.5960, 0.75, 'Cubbon Park Metro', 'Purple', 0.5, 'KSR Bengaluru', 2.8, 'Central Junction', ['G-4', '144', 'KIA-4'], true, ['MF-1', '138'], ['UB City']],
  ['Cunningham Road', 'Central Bengaluru', 12.9845, 77.5956, 0.77, 'Cubbon Park Metro', 'Purple', 1.1, 'Bengaluru Cantonment', 1.1, 'East-Central Rail', ['252', '276', 'KIA-9'], true, ['MF-4', '111'], []],
  ['Millers Road', 'Central Bengaluru', 12.9901, 77.5948, 0.75, 'Cubbon Park Metro', 'Purple', 1.5, 'Bengaluru Cantonment', 0.6, 'East-Central Rail', ['290', '291', 'KIA-9'], true, ['MF-4', '114'], []],
  ['Race Course Road', 'Central Bengaluru', 12.9828, 77.5806, 0.74, 'Majestic Metro', 'Purple', 1.1, 'KSR Bengaluru', 1.3, 'Central Junction', ['252', '276', 'KIA-9'], true, ['MF-5', '99'], []],
  ['Infantry Road', 'Central Bengaluru', 12.9810, 77.6012, 0.75, 'Cubbon Park Metro', 'Purple', 0.7, 'Bengaluru Cantonment', 1.5, 'East-Central Rail', ['290', '300', 'KIA-4'], true, ['MF-4', '114'], []],
  ['Sankey Road', 'Central Bengaluru', 12.9922, 77.5844, 0.73, 'Srirampura Metro', 'Green', 1.5, 'Malleshwaram', 1.4, 'North-West Rail', ['273', '276', 'KIA-9'], true, ['MF-5', '89'], ['Sankey Tank']],
  ['KG Road', 'Central Bengaluru', 12.9765, 77.5778, 0.85, 'Majestic Metro', 'Purple', 0.4, 'KSR Bengaluru', 0.8, 'Central Junction', ['335-E', '226', 'KIA-9'], true, ['MF-6', '195'], ['Kempegowda Road']],
  ['Lalbagh', 'Central Bengaluru', 12.9507, 77.5848, 0.71, 'Lalbagh Metro', 'Green', 0.3, 'KSR Bengaluru', 3.4, 'Central Junction', ['G-3', '215', '365'], false, ['MF-7', '25'], []],
  ['Cubbon Park', 'Central Bengaluru', 12.9763, 77.5929, 0.68, 'Cubbon Park Metro', 'Purple', 0.2, 'KSR Bengaluru', 2.4, 'Central Junction', ['G-4', '335-E', 'KIA-4'], true, ['MF-1', '138'], []],
  ['Chickpet', 'Central Bengaluru', 12.9698, 77.5762, 0.88, 'Chickpet Metro', 'Green', 0.2, 'KSR Bengaluru', 1.3, 'Central Junction', ['210', '215', '225'], false, ['MF-6', '10'], []],
  ['Cottonpete', 'Central Bengaluru', 12.9721, 77.5684, 0.86, 'Majestic Metro', 'Purple', 0.6, 'KSR Bengaluru', 0.7, 'Central Junction', ['226', '240', '242'], false, ['MF-6', '18'], []],
  ['Kalasipalyam', 'Central Bengaluru', 12.9605, 77.5768, 0.89, 'KR Market Metro', 'Green', 0.3, 'KSR Bengaluru', 2.1, 'Central Junction', ['210', '215', '365'], false, ['MF-6', '15'], []],
  ['KR Market', 'Central Bengaluru', 12.9628, 77.5754, 0.91, 'KR Market Metro', 'Green', 0.2, 'KSR Bengaluru', 1.9, 'Central Junction', ['210', '215', '226'], false, ['MF-6', '12'], ['City Market']],
  ['Basavanagudi', 'Central Bengaluru', 12.9406, 77.5738, 0.71, 'National College Metro', 'Green', 0.6, 'KSR Bengaluru', 4.2, 'Central Junction', ['15', '36', '210'], false, ['MF-7', '34'], ['Gandhi Bazaar']],
  ['VV Puram (Visvesvarapuram)', 'Central Bengaluru', 12.9489, 77.5765, 0.73, 'National College Metro', 'Green', 0.5, 'KSR Bengaluru', 3.4, 'Central Junction', ['15', '210', '215'], false, ['MF-7', '25'], ['VV Puram', 'Visvesvarapuram']],
  ['NR Colony', 'Central Bengaluru', 12.9371, 77.5698, 0.69, 'National College Metro', 'Green', 1.0, 'KSR Bengaluru', 4.5, 'Central Junction', ['15', '36', '43'], false, ['MF-7', '34'], []],
  ['Shankarapura', 'Central Bengaluru', 12.9522, 77.5724, 0.72, 'National College Metro', 'Green', 0.5, 'KSR Bengaluru', 3.1, 'Central Junction', ['15', '210', '213'], false, ['MF-7', '12'], []],
  ['Chamrajpet', 'Central Bengaluru', 12.9569, 77.5653, 0.78, 'KR Market Metro', 'Green', 1.1, 'KSR Bengaluru', 2.2, 'Central Junction', ['43', '210', '226'], false, ['MF-6', '30'], []],
  ['Azad Nagar', 'Central Bengaluru', 12.9565, 77.5554, 0.76, 'Magadi Road Metro', 'Purple', 1.5, 'KSR Bengaluru', 2.4, 'Central Junction', ['43', '226', '238'], false, ['MF-8', '30'], []],
  ['Binny Pete', 'Central Bengaluru', 12.9665, 77.5608, 0.79, 'Magadi Road Metro', 'Purple', 0.7, 'KSR Bengaluru', 1.4, 'Central Junction', ['226', '240', '242'], false, ['MF-8', '87'], []],

  // 2. EAST BENGALURU (17) & IT HUBS (21 East/ORR + Electronic City = 22)
  ['Indiranagar', 'East Bengaluru', 12.9784, 77.6408, 0.79, 'Indiranagar Metro', 'Purple', 0.3, 'Baiyappanahalli', 2.4, 'East Rail Corridor', ['V-335E', '201-R', 'KIA-7A'], true, ['MF-9', '138'], []],
  ['Domlur', 'East Bengaluru', 12.9610, 77.6387, 0.81, 'Indiranagar Metro', 'Purple', 1.6, 'Baiyappanahalli', 3.4, 'East Rail Corridor', ['V-335E', '201-R', 'KIA-7A'], true, ['MF-9', '317'], []],
  ['Halasuru (Ulsoor)', 'East Bengaluru', 12.9817, 77.6285, 0.76, 'Halasuru Metro', 'Purple', 0.3, 'Bengaluru East', 1.9, 'East Rail Corridor', ['314', '315', 'V-335E'], true, ['MF-9', '138'], ['Ulsoor', 'Halasuru']],
  ['New Thippasandra', 'East Bengaluru', 12.9736, 77.6524, 0.74, 'Swami Vivekananda Rd Metro', 'Purple', 1.3, 'Baiyappanahalli', 1.8, 'East Rail Corridor', ['317', '335', '314'], false, ['MF-10', '316'], []],
  ['Jeevanbhima Nagar', 'East Bengaluru', 12.9668, 77.6552, 0.75, 'Indiranagar Metro', 'Purple', 1.8, 'Baiyappanahalli', 2.3, 'East Rail Corridor', ['317', '335-E', '201-R'], false, ['MF-10', '316'], ['JB Nagar']],
  ['Kodihalli', 'East Bengaluru', 12.9634, 77.6485, 0.78, 'Indiranagar Metro', 'Purple', 1.7, 'Baiyappanahalli', 2.8, 'East Rail Corridor', ['V-335E', '333', 'KIA-7A'], true, ['MF-10', '317'], []],
  ['Murugeshpalya', 'East Bengaluru', 12.9592, 77.6562, 0.82, 'Indiranagar Metro', 'Purple', 2.3, 'Baiyappanahalli', 3.2, 'East Rail Corridor', ['V-335E', '333', 'KIA-7A'], true, ['MF-10', '331'], []],
  ['Konena Agrahara', 'East Bengaluru', 12.9554, 77.6612, 0.80, 'Indiranagar Metro', 'Purple', 2.9, 'Belandur Road', 4.1, 'ORR Rail Corridor', ['V-335E', '333', '331'], false, ['MF-10', '332'], []],
  ['Challaghatta', 'East Bengaluru', 12.9531, 77.6494, 0.79, 'Indiranagar Metro', 'Purple', 2.7, 'Belandur Road', 4.8, 'ORR Rail Corridor', ['V-335E', '201-R', 'KIA-7A'], true, ['MF-10', '317'], ['Embassy Golf Links', 'EGL']],
  ['Cambridge Layout', 'East Bengaluru', 12.9685, 77.6305, 0.74, 'Halasuru Metro', 'Purple', 0.9, 'Bengaluru Cantonment', 3.8, 'East-Central Rail', ['314', '335-E', '201-R'], false, ['MF-9', '138'], []],
  ['Cox Town', 'East Bengaluru', 12.9934, 77.6215, 0.71, 'Halasuru Metro', 'Purple', 1.5, 'Bengaluru East', 0.4, 'East Rail Corridor', ['290', '300', '304'], false, ['MF-11', '121'], []],
  ['Cooke Town', 'East Bengaluru', 13.0021, 77.6242, 0.69, 'Baiyappanahalli Metro', 'Purple', 2.4, 'Bengaluru East', 0.6, 'East Rail Corridor', ['290', '293', '300'], false, ['MF-11', '121'], []],
  ['Frazer Town', 'East Bengaluru', 12.9982, 77.6134, 0.75, 'Halasuru Metro', 'Purple', 2.1, 'Bengaluru East', 0.5, 'East Rail Corridor', ['290', '291', '300'], false, ['MF-11', '114'], ['Pulikeshi Nagar']],
  ['Benson Town', 'East Bengaluru', 13.0014, 77.6038, 0.73, 'Cubbon Park Metro', 'Purple', 2.5, 'Bengaluru Cantonment', 0.8, 'East-Central Rail', ['290', '291', 'KIA-9'], true, ['MF-11', '114'], []],
  ['Pulikeshi Nagar (Frazer Town area)', 'East Bengaluru', 12.9970, 77.6162, 0.74, 'Halasuru Metro', 'Purple', 2.0, 'Bengaluru East', 0.4, 'East Rail Corridor', ['290', '293', '300'], false, ['MF-11', '121'], ['Pulikeshi Nagar']],
  ['Whitefield', 'IT Hubs', 12.9698, 77.7500, 0.88, 'Whitefield (Kadugodi) Metro', 'Purple', 1.2, 'Whitefield', 1.4, 'Whitefield Main Rail', ['V-335E', 'V-500W', 'KIA-6'], true, ['MF-12', '334'], []],
  ['Kadugodi', 'IT Hubs', 12.9968, 77.7610, 0.84, 'Whitefield (Kadugodi) Metro', 'Purple', 0.4, 'Whitefield', 0.5, 'Whitefield Main Rail', ['V-335E', '307', 'KIA-6'], true, ['MF-12', '328'], []],
  ['ITPL Road', 'IT Hubs', 12.9854, 77.7366, 0.90, 'Pattandur Agrahara Metro', 'Purple', 0.4, 'Hoodi Halt', 2.4, 'Whitefield Main Rail', ['V-500D', 'V-335E', 'KIA-6'], true, ['MF-12', '333'], ['ITPL', 'ITPB']],
  ['Hoodi', 'IT Hubs', 12.9918, 77.7165, 0.87, 'Hoodi Metro', 'Purple', 0.3, 'Hoodi Halt', 0.4, 'Whitefield Main Rail', ['V-500D', '304', 'KIA-6'], true, ['MF-13', '305'], []],
  ['Mahadevapura', 'IT Hubs', 12.9915, 77.6948, 0.89, 'Singayyanapalya Metro', 'Purple', 0.7, 'KR Puram', 2.1, 'Whitefield Main Rail', ['V-500D', 'V-500CA', 'KIA-8'], true, ['MF-13', '304'], []],
  ['KR Puram (Krishnarajapuram)', 'East Bengaluru', 13.0012, 77.6801, 0.94, 'KR Pura Metro', 'Purple', 0.3, 'KR Puram', 0.3, 'East Junction Rail', ['V-500D', '304', 'KIA-8'], true, ['MF-13', '317'], ['KR Puram', 'Krishnarajapuram']],
  ['CV Raman Nagar', 'East Bengaluru', 12.9855, 77.6634, 0.76, 'Baiyappanahalli Metro', 'Purple', 1.4, 'KR Puram', 2.2, 'East Junction Rail', ['317', '314', 'V-500C'], false, ['MF-10', '316'], []],
  ['Marathahalli', 'IT Hubs', 12.9591, 77.6974, 0.93, 'Kundalahalli Metro', 'Purple', 2.8, 'Belandur Road', 3.4, 'ORR Rail Corridor', ['V-500D', 'V-335E', 'KIA-8'], true, ['MF-14', '500-A'], []],
  ['Munnekollal', 'IT Hubs', 12.9542, 77.7091, 0.85, 'Kundalahalli Metro', 'Purple', 2.3, 'Belandur Road', 3.9, 'ORR Rail Corridor', ['V-500D', '333', '500-A'], false, ['MF-14', '331'], []],
  ['Brookefield', 'IT Hubs', 12.9665, 77.7176, 0.84, 'Kundalahalli Metro', 'Purple', 1.1, 'Hoodi Halt', 3.0, 'Whitefield Main Rail', ['V-335E', '500-A', 'KIA-6'], true, ['MF-14', '333'], []],
  ['AECS Layout', 'IT Hubs', 12.9631, 77.7138, 0.83, 'Kundalahalli Metro', 'Purple', 1.4, 'Hoodi Halt', 3.4, 'Whitefield Main Rail', ['V-335E', '333', '500-A'], false, ['MF-14', '333-B'], []],
  ['Kundalahalli', 'IT Hubs', 12.9688, 77.7212, 0.86, 'Kundalahalli Metro', 'Purple', 0.4, 'Hoodi Halt', 2.6, 'Whitefield Main Rail', ['V-335E', 'V-500D', 'KIA-6'], true, ['MF-14', '333'], []],
  ['Thubarahalli', 'IT Hubs', 12.9571, 77.7235, 0.84, 'Kundalahalli Metro', 'Purple', 1.6, 'Belandur Road', 4.3, 'ORR Rail Corridor', ['V-335E', '331', '333'], false, ['MF-14', '334'], []],
  ['Garudachar Palya', 'IT Hubs', 12.9935, 77.7028, 0.85, 'Garudacharpalya Metro', 'Purple', 0.2, 'Hoodi Halt', 1.5, 'Whitefield Main Rail', ['V-500D', '304', 'KIA-8'], true, ['MF-13', '305'], []],
  ['Varthur', 'IT Hubs', 12.9406, 77.7471, 0.84, 'Hopefarm Channasandra Metro', 'Purple', 4.5, 'Carmelaram', 5.2, 'Hosur-ORR Rail', ['V-327', '333-E', '334'], false, ['MF-15', '327'], []],
  ['Gunjur', 'IT Hubs', 12.9225, 77.7376, 0.81, 'Hopefarm Channasandra Metro', 'Purple', 6.4, 'Carmelaram', 4.6, 'Hosur-ORR Rail', ['327', '342', '334'], false, ['MF-15', '328'], []],
  ['Panathur', 'IT Hubs', 12.9398, 77.7052, 0.89, 'Kundalahalli Metro', 'Purple', 3.6, 'Belandur Road', 1.4, 'ORR Rail Corridor', ['V-500D', '331', '342'], false, ['MF-15', '331-A'], []],
  ['Bellandur', 'IT Hubs', 12.9260, 77.6762, 0.93, 'Central Silk Board Metro', 'Yellow', 3.4, 'Belandur Road', 2.2, 'ORR Rail Corridor', ['V-500D', 'V-500CA', 'KIA-7A'], true, ['MF-15', '500-C'], []],
  ['Kadubeesanahalli', 'IT Hubs', 12.9369, 77.6908, 0.92, 'Kundalahalli Metro', 'Purple', 3.9, 'Belandur Road', 1.2, 'ORR Rail Corridor', ['V-500D', 'V-500CA', 'KIA-8'], true, ['MF-15', '500-A'], []],
  ['Kaikondrahalli', 'IT Hubs', 12.9125, 77.6788, 0.86, 'Central Silk Board Metro', 'Yellow', 4.4, 'Carmelaram', 2.5, 'Hosur-ORR Rail', ['V-342F', '500-C', '342'], false, ['MF-15', '342-A'], []],
  ['Haralur Road', 'IT Hubs', 12.9052, 77.6562, 0.85, 'HSR Layout / Silk Board Metro', 'Yellow', 3.1, 'Belandur Road', 4.2, 'ORR Rail Corridor', ['V-342F', '500-CA', '342'], false, ['MF-16', '346'], []],
  ['Kasavanahalli', 'IT Hubs', 12.9089, 77.6754, 0.84, 'Central Silk Board Metro', 'Yellow', 4.6, 'Carmelaram', 2.4, 'Hosur-ORR Rail', ['342', '342-F', '346'], false, ['MF-16', '342-B'], []],
  ['Sarjapur Road', 'IT Hubs', 12.9102, 77.6845, 0.88, 'Central Silk Board Metro', 'Yellow', 5.2, 'Carmelaram', 1.6, 'Hosur-ORR Rail', ['V-342F', '342', '500-C'], false, ['MF-16', '342-A'], []],

  // 3. SOUTH BENGALURU (28)
  ['Jayanagar', 'South Bengaluru', 12.9308, 77.5838, 0.72, 'Jayanagar Metro', 'Green', 0.4, 'KSR Bengaluru', 5.8, 'Central Junction', ['25', '215', 'G-3'], false, ['MF-17', '2'], ['ayanagar']],
  ['JP Nagar (Phases 1–9)', 'South Bengaluru', 12.9063, 77.5857, 0.77, 'JP Nagar Metro', 'Green', 0.6, 'KSR Bengaluru', 8.4, 'Central Junction', ['215', '215-N', '365'], false, ['MF-17', '215-H'], ['JP Nagar', 'JP Nagar 1st Phase', 'JP Nagar 2nd Phase', 'JP Nagar 3rd Phase', 'JP Nagar 4th Phase', 'JP Nagar 5th Phase', 'JP Nagar 6th Phase', 'JP Nagar 7th Phase', 'JP Nagar 8th Phase', 'JP Nagar 9th Phase']],
  ['BTM Layout', 'South Bengaluru', 12.9166, 77.6101, 0.86, 'BTM Layout Metro', 'Yellow', 0.4, 'Belandur Road', 6.8, 'ORR Rail Corridor', ['V-500C', '346', 'KIA-7'], true, ['MF-18', '201'], []],
  ['Koramangala (Blocks 1–8)', 'South Bengaluru', 12.9352, 77.6245, 0.84, 'Tavarekere / S.G. Palya Metro', 'Pink', 1.6, 'Belandur Road', 6.4, 'ORR Rail Corridor', ['V-335E', '201-R', 'KIA-7A'], true, ['MF-18', '171'], ['Koramangala', 'Koramangala 1st Block', 'Koramangala 2nd Block', 'Koramangala 3rd Block', 'Koramangala 4th Block', 'Koramangala 5th Block', 'Koramangala 6th Block', 'Koramangala 7th Block', 'Koramangala 8th Block']],
  ['Ejipura', 'South Bengaluru', 12.9422, 77.6295, 0.85, 'Indiranagar Metro', 'Purple', 3.4, 'Belandur Road', 6.2, 'ORR Rail Corridor', ['201-R', '335-E', '171'], false, ['MF-18', '140'], []],
  ['Adugodi', 'South Bengaluru', 12.9438, 77.6085, 0.79, 'S.G. Palya / Tavarekere Metro', 'Pink', 1.2, 'KSR Bengaluru', 5.6, 'Central Junction', ['G-3', '171', '346'], false, ['MF-18', '165'], []],
  ['Madiwala', 'South Bengaluru', 12.9226, 77.6174, 0.89, 'Central Silk Board Metro', 'Yellow', 0.8, 'Belandur Road', 6.1, 'ORR Rail Corridor', ['V-500C', '346', 'KIA-7'], true, ['MF-18', '356'], []],
  ['Tavarekere', 'South Bengaluru', 12.9311, 77.6098, 0.81, 'Tavarekere Metro', 'Pink', 0.3, 'KSR Bengaluru', 6.2, 'Central Junction', ['171', '346', '365'], false, ['MF-18', '165'], ['S.G. Palya']],
  ['Bommanahalli', 'South Bengaluru', 12.9032, 77.6258, 0.89, 'Bommanahalli Metro', 'Yellow', 0.3, 'Heelalige', 6.5, 'Hosur Rail Corridor', ['V-356C', '346', 'KIA-7'], true, ['MF-19', '360'], []],
  ['Hongasandra', 'South Bengaluru', 12.8975, 77.6305, 0.84, 'Hongasandra Metro', 'Yellow', 0.4, 'Heelalige', 6.0, 'Hosur Rail Corridor', ['356', '346', '360'], false, ['MF-19', '361'], []],
  ['Begur', 'South Bengaluru', 12.8788, 77.6242, 0.78, 'Hongasandra Metro', 'Yellow', 2.2, 'Heelalige', 5.8, 'Hosur Rail Corridor', ['346-B', '360', '356'], false, ['MF-19', '361-B'], []],
  ['Kudlu', 'South Bengaluru', 12.8884, 77.6484, 0.85, 'Kudlu Gate Metro', 'Yellow', 0.8, 'Heelalige', 5.0, 'Hosur Rail Corridor', ['V-356C', '346', '360'], false, ['MF-19', '362'], ['Kudlu Gate']],
  ['Singasandra', 'South Bengaluru', 12.8802, 77.6492, 0.86, 'Singasandra Metro', 'Yellow', 0.4, 'Heelalige', 4.3, 'Hosur Rail Corridor', ['V-356C', '356', 'KIA-7'], true, ['MF-19', '360'], []],
  ['Hulimavu', 'South Bengaluru', 12.8772, 77.6038, 0.81, 'Hulimavu Metro', 'Pink', 0.4, 'Heelalige', 7.8, 'Hosur Rail Corridor', ['365', '366', '365-J'], false, ['MF-20', '368'], []],
  ['Bilekahalli', 'South Bengaluru', 12.8992, 77.6085, 0.82, 'Bilekahalli Metro', 'Pink', 0.4, 'KSR Bengaluru', 9.2, 'Central Junction', ['365', '366', 'G-4'], false, ['MF-20', '364'], []],
  ['Arekere', 'South Bengaluru', 12.8878, 77.6032, 0.83, 'Hulimavu Metro', 'Pink', 1.1, 'Heelalige', 8.1, 'Hosur Rail Corridor', ['365', '366', '365-B'], false, ['MF-20', '368'], []],
  ['Bannerghatta Road', 'South Bengaluru', 12.8934, 77.5998, 0.86, 'IIMB / Bilekahalli Metro', 'Pink', 0.4, 'KSR Bengaluru', 9.5, 'Central Junction', ['365', '366', 'KIA-7'], true, ['MF-20', '368'], ['IIMB']],
  ['Gottigere', 'South Bengaluru', 12.8588, 77.5892, 0.79, 'Gottigere / Kalena Agrahara Metro', 'Pink', 0.5, 'Heelalige', 9.2, 'Hosur Rail Corridor', ['365', '366', '369'], false, ['MF-20', '368-G'], ['Kalena Agrahara']],
  ['Konanakunte', 'South Bengaluru', 12.8812, 77.5635, 0.74, 'Konanakunte Cross Metro', 'Green', 0.4, 'KSR Bengaluru', 11.2, 'Central Junction', ['215', '215-H', '365'], false, ['MF-21', '215-K'], []],
  ['Kumaraswamy Layout', 'South Bengaluru', 12.9054, 77.5624, 0.73, 'Yelachenahalli Metro', 'Green', 1.3, 'KSR Bengaluru', 9.1, 'Central Junction', ['15-E', '210', '215'], false, ['MF-21', '45-E'], []],
  ['Padmanabhanagar', 'South Bengaluru', 12.9175, 77.5562, 0.72, 'Banashankari Metro', 'Green', 1.7, 'KSR Bengaluru', 7.8, 'Central Junction', ['15-E', '45-E', '210'], false, ['MF-21', '43-E'], []],
  ['Banashankari (Stages 1–3)', 'South Bengaluru', 12.9255, 77.5468, 0.81, 'Banashankari Metro', 'Green', 1.2, 'Nayandahalli', 3.9, 'Mysuru Rail Corridor', ['210', '401-K', '500-K'], false, ['MF-21', '45'], ['Banashankari', 'Banashankari Stage 1', 'Banashankari Stage 2', 'Banashankari Stage 3']],
  ['Kathriguppe', 'South Bengaluru', 12.9252, 77.5542, 0.76, 'Banashankari Metro', 'Green', 2.0, 'Nayandahalli', 3.4, 'Mysuru Rail Corridor', ['45', '43', '210'], false, ['MF-21', '45-D'], []],
  ['Ittamadu', 'South Bengaluru', 12.9204, 77.5455, 0.73, 'Banashankari Metro', 'Green', 2.6, 'Nayandahalli', 3.2, 'Mysuru Rail Corridor', ['45-D', '210-N', '43'], false, ['MF-21', '45-E'], []],
  ['Uttarahalli', 'South Bengaluru', 12.9052, 77.5458, 0.75, 'Yelachenahalli Metro', 'Green', 2.4, 'Kengeri', 6.8, 'Mysuru Rail Corridor', ['210-N', '43-E', '215'], false, ['MF-21', '210-U'], []],
  ['Subramanyapura', 'South Bengaluru', 12.8935, 77.5432, 0.72, 'Vajarahalli / Yelachenahalli Metro', 'Green', 2.2, 'Kengeri', 7.4, 'Mysuru Rail Corridor', ['210-N', '215-S', '43'], false, ['MF-21', '215-U'], []],
  ['Yelachenahalli', 'South Bengaluru', 12.8962, 77.5701, 0.76, 'Yelachenahalli Metro', 'Green', 0.3, 'KSR Bengaluru', 10.1, 'Central Junction', ['215', '215-N', '210'], false, ['MF-21', '215-H'], []],
  ['Chikkalasandra', 'South Bengaluru', 12.9122, 77.5498, 0.74, 'Yelachenahalli Metro', 'Green', 2.3, 'Nayandahalli', 4.3, 'Mysuru Rail Corridor', ['43', '45-E', '210-N'], false, ['MF-21', '43-B'], []],

  // 4. WEST & SOUTH-WEST BENGALURU (18)
  ['Vijayanagar', 'West Bengaluru', 12.9719, 77.5327, 0.78, 'Vijayanagar Metro', 'Purple', 0.3, 'KSR Bengaluru', 4.3, 'Central Junction', ['238', '401-K', 'KIA-10'], true, ['MF-22', '87'], []],
  ['Rajajinagar', 'West Bengaluru', 12.9982, 77.5530, 0.76, 'Rajajinagar Metro', 'Green', 0.4, 'Malleshwaram', 2.0, 'North-West Rail', ['80', '252', 'KIA-10'], true, ['MF-22', '96'], []],
  ['Mahalakshmi Layout', 'West Bengaluru', 13.0086, 77.5471, 0.73, 'Mahalakshmi Metro', 'Green', 0.4, 'Yeshwanthpur', 2.1, 'North-West Rail', ['80', '252', '401-K'], false, ['MF-22', '96-A'], []],
  ['Basaveshwaranagar', 'West Bengaluru', 12.9912, 77.5378, 0.75, 'Rajajinagar Metro', 'Green', 1.6, 'Malleshwaram', 3.4, 'North-West Rail', ['96', '248', '401-K'], false, ['MF-22', '96-B'], []],
  ['Kamakshipalya', 'West Bengaluru', 12.9845, 77.5234, 0.77, 'Vijayanagar Metro', 'Purple', 1.8, 'KSR Bengaluru', 5.6, 'Central Junction', ['248', '401-K', '242'], false, ['MF-22', '248-A'], []],
  ['Nagarbhavi', 'West Bengaluru', 12.9592, 77.5108, 0.76, 'Attiguppe Metro', 'Purple', 2.4, 'Nayandahalli', 3.1, 'Mysuru Rail Corridor', ['238-U', '401-K', '501'], false, ['MF-23', '238'], []],
  ['Mallathahalli', 'West Bengaluru', 12.9635, 77.4982, 0.69, 'Attiguppe Metro', 'Purple', 3.8, 'Nayandahalli', 4.4, 'Mysuru Rail Corridor', ['238-U', '242', '401-K'], false, ['MF-23', '238-M'], []],
  ['Rajarajeshwari Nagar (RR Nagar)', 'West Bengaluru', 12.9279, 77.5169, 0.75, 'Rajarajeshwari Nagar Metro', 'Purple', 0.9, 'Nayandahalli', 2.4, 'Mysuru Rail Corridor', ['225-C', '226', '501'], false, ['MF-23', '225'], ['RR Nagar', 'Rajarajeshwari Nagar']],
  ['Kengeri', 'West Bengaluru', 12.9077, 77.4820, 0.73, 'Kengeri Metro', 'Purple', 0.5, 'Kengeri', 0.4, 'Mysuru Rail Corridor', ['226', '227', 'KIA-10'], true, ['MF-24', '226-M'], []],
  ['Kengeri Satellite Town', 'West Bengaluru', 12.9175, 77.4832, 0.70, 'Kengeri Bus Terminal Metro', 'Purple', 0.8, 'Kengeri', 1.2, 'Mysuru Rail Corridor', ['226', '226-M', '227'], false, ['MF-24', '225-K'], []],
  ['Nayandahalli', 'West Bengaluru', 12.9432, 77.5236, 0.82, 'Nayandahalli Metro', 'Purple', 0.3, 'Nayandahalli', 0.3, 'Mysuru Rail Corridor', ['226', '401-K', '501'], false, ['MF-23', '225'], []],
  ['Chandra Layout', 'West Bengaluru', 12.9574, 77.5284, 0.74, 'Attiguppe Metro', 'Purple', 0.9, 'Nayandahalli', 2.1, 'Mysuru Rail Corridor', ['238', '401-K', '240'], false, ['MF-23', '87-C'], []],
  ['Attiguppe', 'West Bengaluru', 12.9619, 77.5335, 0.76, 'Attiguppe Metro', 'Purple', 0.2, 'Nayandahalli', 2.6, 'Mysuru Rail Corridor', ['238', '401-K', '240'], false, ['MF-22', '87'], []],
  ['Girinagar', 'West Bengaluru', 12.9412, 77.5428, 0.73, 'Deepanjali Nagar Metro', 'Purple', 1.8, 'Nayandahalli', 2.2, 'Mysuru Rail Corridor', ['43', '45', '210'], false, ['MF-23', '43-G'], []],
  ['Hanumantha Nagar', 'West Bengaluru', 12.9445, 77.5582, 0.72, 'National College Metro', 'Green', 1.8, 'KSR Bengaluru', 3.9, 'Central Junction', ['43', '45', '36'], false, ['MF-7', '34'], []],
  ['Hosakerehalli', 'West Bengaluru', 12.9312, 77.5364, 0.76, 'Nayandahalli Metro', 'Purple', 2.1, 'Nayandahalli', 1.9, 'Mysuru Rail Corridor', ['45', '210', '501'], false, ['MF-23', '43-H'], []],
  ['Ganakal', 'West Bengaluru', 12.8935, 77.5082, 0.62, 'Kengeri / Pattanagere Metro', 'Purple', 3.4, 'Kengeri', 3.6, 'Mysuru Rail Corridor', ['225-C', '226', '210-G'], false, ['MF-24', '225-G'], []],
  ['Pattanagere', 'West Bengaluru', 12.9245, 77.4988, 0.68, 'Pattanagere Metro', 'Purple', 0.3, 'Kengeri', 2.5, 'Mysuru Rail Corridor', ['226', '225-C', '227'], false, ['MF-24', '225'], []],

  // 5. NORTH & NORTH-WEST BENGALURU (18)
  ['Hebbal', 'North Bengaluru', 13.0358, 77.5970, 0.92, 'Yeshwanthpur Metro', 'Green', 4.9, 'Hebbal', 0.5, 'North-Airport Rail', ['V-500CA', 'KIA-9', '285'], true, ['MF-25', '290'], []],
  ['RT Nagar (Rabindranath Tagore Nagar)', 'North Bengaluru', 13.0247, 77.5948, 0.77, 'Sandal Soap Factory Metro', 'Green', 4.2, 'Hebbal', 1.8, 'North-Airport Rail', ['276', '290', '114'], false, ['MF-25', '176'], ['RT Nagar']],
  ['JC Nagar', 'North Bengaluru', 13.0098, 77.5934, 0.74, 'Mantri Square Sampige Rd Metro', 'Green', 2.8, 'Bengaluru Cantonment', 1.9, 'East-Central Rail', ['114', '276', '290'], false, ['MF-25', '114-A'], []],
  ['Sanjay Nagar', 'North Bengaluru', 13.0285, 77.5782, 0.73, 'Yeshwanthpur Metro', 'Green', 3.2, 'Lottegollahalli', 1.6, 'North-Airport Rail', ['276', '176', 'KIA-9'], true, ['MF-25', '273'], []],
  ['RMV Extension (Raj Mahal Vilas)', 'North Bengaluru', 13.0228, 77.5734, 0.72, 'Yeshwanthpur Metro', 'Green', 2.6, 'Lottegollahalli', 1.7, 'North-Airport Rail', ['276', '273', '176'], false, ['MF-25', '99'], ['RMV Extension', 'RMV 2nd Stage']],
  ['Sadashivanagar', 'North Bengaluru', 13.0068, 77.5812, 0.70, 'Srirampura Metro', 'Green', 1.9, 'Malleshwaram', 1.5, 'North-West Rail', ['273', '276', 'KIA-9'], true, ['MF-5', '89'], []],
  ['Malleshwaram', 'North Bengaluru', 13.0055, 77.5692, 0.75, 'Malleshwaram / Mantri Sq Metro', 'Green', 0.8, 'Malleshwaram', 0.4, 'North-West Rail', ['80', '252', '276'], false, ['MF-5', '99'], []],
  ['Srirampura', 'North Bengaluru', 12.9965, 77.5702, 0.77, 'Srirampura Metro', 'Green', 0.3, 'Malleshwaram', 0.8, 'North-West Rail', ['80', '252', '96'], false, ['MF-5', '99'], []],
  ['Mathikere', 'North Bengaluru', 13.0334, 77.5588, 0.76, 'Yeshwanthpur Metro', 'Green', 1.4, 'Yeshwanthpur', 1.4, 'North-West Rail', ['273', '276', '252'], false, ['MF-26', '270'], []],
  ['Yeshwanthpur', 'North Bengaluru', 13.0250, 77.5540, 0.85, 'Yeshwanthpur Metro', 'Green', 0.3, 'Yeshwanthpur', 0.3, 'North-West Rail', ['252', '401-K', 'KIA-10'], true, ['MF-26', '273'], []],
  ['Peenya', 'North Bengaluru', 13.0329, 77.5273, 0.83, 'Peenya Metro', 'Green', 0.3, 'Yeshwanthpur', 3.4, 'North-West Rail', ['252', '258', 'KIA-10'], true, ['MF-26', '253'], []],
  ['Jalahalli', 'North Bengaluru', 13.0468, 77.5472, 0.78, 'Jalahalli Metro', 'Green', 0.5, 'Lottegollahalli', 2.8, 'North-Airport Rail', ['252', '270', '401-B'], false, ['MF-26', '271'], []],
  ['T. Dasarahalli', 'North Bengaluru', 13.0436, 77.5132, 0.79, 'Dasarahalli Metro', 'Green', 0.3, 'Chikkabanavara', 4.1, 'Tumakuru Rail', ['252', '258', '256'], false, ['MF-26', '255'], ['Dasarahalli']],
  ['Nagasandra', 'North Bengaluru', 13.0480, 77.5001, 0.76, 'Nagasandra Metro', 'Green', 0.3, 'Chikkabanavara', 2.9, 'Tumakuru Rail', ['252', '258', '256'], false, ['MF-26', '254'], []],
  ['Bagalakunte', 'North Bengaluru', 13.0582, 77.5034, 0.72, 'Nagasandra Metro', 'Green', 1.2, 'Chikkabanavara', 2.3, 'Tumakuru Rail', ['252', '258', '250'], false, ['MF-26', '250-B'], []],
  ['Nandini Layout', 'North Bengaluru', 13.0112, 77.5378, 0.74, 'Mahalakshmi Metro', 'Green', 1.2, 'Yeshwanthpur', 2.4, 'North-West Rail', ['80', '96', '248'], false, ['MF-22', '96-C'], []],
  ['Laggere', 'North Bengaluru', 13.0085, 77.5234, 0.78, 'Peenya Industry Metro', 'Green', 2.4, 'Yeshwanthpur', 3.8, 'North-West Rail', ['248', '252', '401-K'], false, ['MF-26', '248-L'], []],
  ['Kurubarahalli', 'North Bengaluru', 13.0052, 77.5318, 0.73, 'Mahalakshmi Metro', 'Green', 1.8, 'Yeshwanthpur', 2.8, 'North-West Rail', ['96', '248', '401-K'], false, ['MF-22', '96-D'], []],

  // 6. NORTH-EAST BENGALURU & AIRPORT CORRIDOR (20)
  ['Kalyan Nagar', 'North Bengaluru', 13.0280, 77.6409, 0.81, 'Baiyappanahalli Metro', 'Purple', 4.1, 'Banaswadi', 2.0, 'North-East Rail', ['V-500C', '290', 'KIA-8'], true, ['MF-27', '300'], []],
  ['Kammanahalli', 'North Bengaluru', 13.0159, 77.6379, 0.80, 'Baiyappanahalli Metro', 'Purple', 3.0, 'Banaswadi', 1.1, 'North-East Rail', ['290', '300', '302'], false, ['MF-27', '293'], []],
  ['Banaswadi', 'North Bengaluru', 13.0124, 77.6458, 0.78, 'Baiyappanahalli Metro', 'Purple', 2.6, 'Banaswadi', 0.4, 'North-East Rail', ['300', '302', 'KIA-8'], true, ['MF-27', '304'], []],
  ['Kasturi Nagar', 'North Bengaluru', 13.0052, 77.6618, 0.77, 'KR Pura Metro', 'Purple', 2.1, 'Channasandra', 1.6, 'North-East Rail', ['V-500C', '304', 'KIA-8'], true, ['MF-27', '317'], []],
  ['Lingarajapuram', 'North Bengaluru', 13.0068, 77.6265, 0.76, 'Baiyappanahalli Metro', 'Purple', 2.9, 'Bengaluru East', 1.3, 'East Rail Corridor', ['290', '293', '300'], false, ['MF-11', '121'], []],
  ['HRBR Layout', 'North Bengaluru', 13.0242, 77.6435, 0.79, 'Baiyappanahalli Metro', 'Purple', 3.8, 'Banaswadi', 1.6, 'North-East Rail', ['V-500C', '300', 'KIA-8'], true, ['MF-27', '302'], []],
  ['HBR Layout', 'North Bengaluru', 13.0352, 77.6295, 0.80, 'Baiyappanahalli Metro', 'Purple', 5.1, 'Banaswadi', 2.8, 'North-East Rail', ['V-500C', '290', 'KIA-8'], true, ['MF-27', '291'], []],
  ['Hennur', 'North Bengaluru', 13.0435, 77.6485, 0.82, 'KR Pura Metro', 'Purple', 5.8, 'Channasandra', 3.4, 'North-East Rail', ['290', '291', 'KIA-8'], true, ['MF-27', '293-H'], []],
  ['Kothanur', 'North Bengaluru', 13.0612, 77.6462, 0.74, 'KR Pura Metro', 'Purple', 7.6, 'Channasandra', 5.1, 'North-East Rail', ['290', '293', '294'], false, ['MF-28', '293-K'], []],
  ['Thanisandra', 'North Bengaluru', 13.0582, 77.6308, 0.79, 'Yeshwanthpur Metro', 'Green', 9.2, 'Hebbal', 4.6, 'North-Airport Rail', ['290', '291', '294'], false, ['MF-28', '291-T'], []],
  ['Nagavara', 'North Bengaluru', 13.0428, 77.6194, 0.88, 'Yeshwanthpur Metro', 'Green', 7.4, 'Hebbal', 2.7, 'North-Airport Rail', ['V-500C', '290', 'KIA-8'], true, ['MF-28', '291'], []],
  ['Rachenahalli', 'North Bengaluru', 13.0604, 77.6168, 0.75, 'Yeshwanthpur Metro', 'Green', 8.3, 'Hebbal', 3.5, 'North-Airport Rail', ['291', '294', 'KIA-9'], true, ['MF-28', '285'], []],
  ['Jakkur', 'North Bengaluru', 13.0762, 77.6032, 0.72, 'Yeshwanthpur Metro', 'Green', 7.8, 'Yelahanka', 3.1, 'North-Airport Rail', ['285', '298', 'KIA-9'], true, ['MF-28', '284'], []],
  ['Sahakara Nagar', 'North Bengaluru', 13.0628, 77.5912, 0.74, 'Yeshwanthpur Metro', 'Green', 6.1, 'Kodigehalli', 1.3, 'North-Airport Rail', ['285', '276', 'KIA-9'], true, ['MF-25', '283'], []],
  ['Vidyaranyapura', 'North Bengaluru', 13.0798, 77.5594, 0.73, 'Jalahalli Metro', 'Green', 4.2, 'Yelahanka', 4.6, 'North-Airport Rail', ['276', '284', '401-Y'], false, ['MF-29', '271'], []],
  ['Yelahanka', 'North Bengaluru', 13.1007, 77.5963, 0.78, 'Jalahalli Metro', 'Green', 8.2, 'Yelahanka', 0.6, 'North-Airport Rail', ['285', '401-Y', 'KIA-9'], true, ['MF-29', '284'], []],
  ['Yelahanka New Town', 'North Bengaluru', 13.0994, 77.5796, 0.71, 'Jalahalli Metro', 'Green', 7.1, 'Yelahanka', 1.9, 'North-Airport Rail', ['284', '401-Y', 'KIA-9'], true, ['MF-29', '285'], []],
  ['Kogilu', 'North Bengaluru', 13.1072, 77.6148, 0.74, 'Jalahalli Metro', 'Green', 9.8, 'Yelahanka', 2.4, 'North-Airport Rail', ['285', '298', 'KIA-9'], true, ['MF-29', '298-K'], []],
  ['Bagalur', 'North Bengaluru', 13.1412, 77.6614, 0.58, 'KR Pura Metro', 'Purple', 15.8, 'Bettahalsoor', 4.2, 'Airport Rail Link', ['298', '294', 'KIA-8'], true, ['MF-29', '298-B'], []],
  ['Devanahalli', 'North Bengaluru', 13.2473, 77.7126, 0.52, 'Yeshwanthpur Metro', 'Green', 28.5, 'Devanahalli', 0.6, 'Airport Rail Link', ['KIA-9', 'KIA-8', '298-D'], true, ['MF-30', '298'], ['Kempegowda International Airport', 'KIA']],

  // 7. OUTSKIRTS (11) + Electronic City in IT Hubs
  ['Electronic City (Phases 1 & 2)', 'IT Hubs', 12.8452, 77.6602, 0.87, 'Electronic City Metro', 'Yellow', 0.6, 'Heelalige', 4.2, 'Hosur Rail Corridor', ['V-356C', 'V-500E', 'KIA-7A'], true, ['MF-31', '356'], ['Electronic City', 'Electronic City Phase 1', 'Electronic City Phase 2', 'ECity']],
  ['Chandapura', 'Outskirts', 12.8012, 77.7034, 0.73, 'Bommasandra Metro', 'Yellow', 2.9, 'Heelalige', 2.1, 'Hosur Rail Corridor', ['356', '360', '356-C'], false, ['MF-31', '360-C'], []],
  ['Attibele', 'Outskirts', 12.7798, 77.7712, 0.64, 'Bommasandra Metro', 'Yellow', 8.4, 'Anekal Road', 6.5, 'Hosur Rail Corridor', ['356-A', '360-A', 'KSRTC-Hosur'], false, ['MF-31', '360-B'], []],
  ['Jigani', 'Outskirts', 12.7852, 77.6412, 0.61, 'Bommasandra Metro', 'Yellow', 6.8, 'Heelalige', 6.4, 'Hosur Rail Corridor', ['366-J', '356-J', '365'], false, ['MF-31', '369'], []],
  ['Anekal', 'Outskirts', 12.7104, 77.6952, 0.49, 'Bommasandra Metro', 'Yellow', 12.8, 'Anekal Road', 1.2, 'Hosur Rail Corridor', ['356-K', '360-A', 'KSRTC-Anekal'], false, ['MF-31', '360-K'], []],
  ['Sarjapura', 'Outskirts', 12.8601, 77.7864, 0.68, 'Bommasandra Metro', 'Yellow', 11.4, 'Carmelaram', 9.2, 'Hosur-ORR Rail', ['342', '342-S', 'KSRTC-Sarjapur'], false, ['MF-32', '327-S'], []],
  ['Hoskote', 'Outskirts', 13.0707, 77.7982, 0.66, 'Whitefield (Kadugodi) Metro', 'Purple', 9.1, 'Whitefield', 9.4, 'Whitefield Main Rail', ['307', '307-H', 'KSRTC-Kolar'], false, ['MF-32', '317-H'], []],
  ['Nelamangala', 'Outskirts', 13.0998, 77.3942, 0.63, 'Madavara / Nagasandra Metro', 'Green', 11.2, 'Nelamangala', 0.9, 'Tumakuru Rail', ['258', '258-N', 'KSRTC-Tumakuru'], false, ['MF-33', '258-C'], []],
  ['Hesaraghatta', 'Outskirts', 13.1394, 77.4792, 0.44, 'Nagasandra Metro', 'Green', 10.4, 'Chikkabanavara', 7.8, 'Tumakuru Rail', ['250', '266', '253'], false, ['MF-33', '266-H'], []],
  ['Chikkabanavara', 'Outskirts', 13.0772, 77.5034, 0.67, 'Nagasandra Metro', 'Green', 3.4, 'Chikkabanavara', 0.4, 'Tumakuru Rail', ['250', '253', '258'], false, ['MF-33', '250-A'], []],
  ['Kumbalgodu', 'Outskirts', 12.8788, 77.4488, 0.65, 'Challaghatta / Kengeri Metro', 'Purple', 4.6, 'Hejjala', 3.1, 'Mysuru Rail Corridor', ['226', '227', 'KSRTC-Mysuru'], false, ['MF-24', '227-K'], []],
  ['Bidadi', 'Outskirts', 12.7972, 77.3848, 0.56, 'Challaghatta Metro', 'Purple', 14.2, 'Bidadi', 0.5, 'Mysuru Rail Corridor', ['226-B', 'KSRTC-Mysuru', 'KSRTC-Ramanagara'], false, ['MF-24', '227-B'], []],
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const BENGALURU_LOCALITIES: Locality[] = RAW_LOCALITIES.map((item) => ({
  id: slugify(item[0]),
  name: item[0],
  zone: item[1],
  lat: item[2],
  lng: item[3],
  congestionIndex: item[4],
  nearestMetro: {
    station: item[5],
    line: item[6],
    distanceKm: item[7],
  },
  nearestRail: {
    station: item[8],
    distanceKm: item[9],
    corridor: item[10],
  },
  busProfile: {
    primaryRoutes: item[11],
    vayuVajraAvailable: item[12],
    feederRoutes: item[13],
  },
  aliases: item[14] || [],
}));

export function findLocalityById(id: string): Locality | undefined {
  return BENGALURU_LOCALITIES.find((loc) => loc.id === id);
}

export function findLocalityByQuery(query: string): Locality[] {
  const q = query.trim().toLowerCase();
  if (!q) return BENGALURU_LOCALITIES;
  return BENGALURU_LOCALITIES.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.zone.toLowerCase().includes(q) ||
      loc.nearestMetro.station.toLowerCase().includes(q) ||
      loc.nearestRail.station.toLowerCase().includes(q) ||
      (loc.aliases && loc.aliases.some((a) => a.toLowerCase().includes(q)))
  );
}
