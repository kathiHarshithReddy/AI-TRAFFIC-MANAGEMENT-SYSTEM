import { BENGALURU_LOCALITIES } from '../data/bengaluruLocalities';
import { Locality } from '../types/traffic';

export type BengaluruRegion =
  | 'Central'
  | 'East'
  | 'South'
  | 'West'
  | 'North'
  | 'North-East'
  | 'Outskirts/Industrial';

export const BENGALURU_REGIONS: readonly BengaluruRegion[] = [
  'Central',
  'East',
  'South',
  'West',
  'North',
  'North-East',
  'Outskirts/Industrial',
] as const;

export const BENGALURU_REGION_DESCRIPTIONS: Record<BengaluruRegion, string> = {
  Central: 'CBD & Old City Heritage Core',
  East: 'Old Airport Rd, Whitefield & ORR Tech Belt',
  South: 'Jayanagar, Koramangala & Bannerghatta Spine',
  West: 'Rajajinagar, Vijayanagar & Mysuru Rd Radial',
  North: 'Hebbal, Malleshwaram, Yeshwanthpur & Peenya',
  'North-East': 'Kalyan Nagar, Hennur, Yelahanka & Airport Axis',
  'Outskirts/Industrial': 'Electronic City & Satellite Industrial Hubs',
};

const NORTH_EAST_LOCALITY_IDS = new Set<string>([
  'kalyan-nagar',
  'kammanahalli',
  'banaswadi',
  'kasturi-nagar',
  'lingarajapuram',
  'hrbr-layout',
  'hbr-layout',
  'hennur',
  'kothanur',
  'thanisandra',
  'nagavara',
  'rachenahalli',
  'jakkur',
  'sahakara-nagar',
  'vidyaranyapura',
  'yelahanka',
  'yelahanka-new-town',
  'kogilu',
  'bagalur',
  'devanahalli',
]);

const OUTSKIRTS_INDUSTRIAL_EXTRA_IDS = new Set<string>([
  'electronic-city-phases-1-2',
]);

export interface CategorizedLocalityGroup {
  region: BengaluruRegion;
  description: string;
  localities: Locality[];
}

export function getLocalityRegion(locality: Locality): BengaluruRegion {
  if (
    locality.zone === 'Outskirts' ||
    OUTSKIRTS_INDUSTRIAL_EXTRA_IDS.has(locality.id)
  ) {
    return 'Outskirts/Industrial';
  }
  if (locality.zone === 'Central Bengaluru') {
    return 'Central';
  }
  if (locality.zone === 'East Bengaluru' || locality.zone === 'IT Hubs') {
    return 'East';
  }
  if (locality.zone === 'South Bengaluru') {
    return 'South';
  }
  if (locality.zone === 'West Bengaluru') {
    return 'West';
  }
  if (NORTH_EAST_LOCALITY_IDS.has(locality.id)) {
    return 'North-East';
  }
  return 'North';
}

export function groupLocalitiesByRegion(
  localities: Locality[] = BENGALURU_LOCALITIES,
  options: { includeEmpty?: boolean } = {}
): CategorizedLocalityGroup[] {
  const buckets = new Map<BengaluruRegion, Locality[]>();
  for (const region of BENGALURU_REGIONS) {
    buckets.set(region, []);
  }

  for (const locality of localities) {
    const region = getLocalityRegion(locality);
    buckets.get(region)!.push(locality);
  }

  const groups: CategorizedLocalityGroup[] = [];
  for (const region of BENGALURU_REGIONS) {
    const items = buckets.get(region) || [];
    if (options.includeEmpty || items.length > 0) {
      groups.push({
        region,
        description: BENGALURU_REGION_DESCRIPTIONS[region],
        localities: items,
      });
    }
  }

  return groups;
}
