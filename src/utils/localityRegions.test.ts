import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BENGALURU_LOCALITIES,
  findLocalityById,
  findLocalityByQuery,
} from '../data/bengaluruLocalities';
import {
  BENGALURU_REGIONS,
  getLocalityRegion,
  groupLocalitiesByRegion,
} from './localityRegions';

test('groupLocalitiesByRegion partitions all 161 localities across the 7 specified regions', () => {
  const groups = groupLocalitiesByRegion(BENGALURU_LOCALITIES);
  assert.deepEqual(
    groups.map((g) => g.region),
    [...BENGALURU_REGIONS]
  );

  const totalCount = groups.reduce((sum, g) => sum + g.localities.length, 0);
  assert.equal(totalCount, BENGALURU_LOCALITIES.length);
  assert.equal(totalCount, 161);

  const countByRegion = new Map(
    groups.map((g) => [g.region, g.localities.length])
  );
  assert.equal(countByRegion.get('Central'), 27);
  assert.equal(countByRegion.get('East'), 38);
  assert.equal(countByRegion.get('South'), 28);
  assert.equal(countByRegion.get('West'), 18);
  assert.equal(countByRegion.get('North'), 18);
  assert.equal(countByRegion.get('North-East'), 20);
  assert.equal(countByRegion.get('Outskirts/Industrial'), 12);
});

test('getLocalityRegion maps representative areas accurately into all 7 regions', () => {
  const checks: Array<[string, (typeof BENGALURU_REGIONS)[number]]> = [
    ['mg-road', 'Central'],
    ['kr-market', 'Central'],
    ['indiranagar', 'East'],
    ['whitefield', 'East'],
    ['bellandur', 'East'],
    ['jayanagar', 'South'],
    ['koramangala-blocks-1-8', 'South'],
    ['rajajinagar', 'West'],
    ['kengeri', 'West'],
    ['hebbal', 'North'],
    ['yeshwanthpur', 'North'],
    ['hennur', 'North-East'],
    ['yelahanka-new-town', 'North-East'],
    ['devanahalli', 'North-East'],
    ['electronic-city-phases-1-2', 'Outskirts/Industrial'],
    ['hoskote', 'Outskirts/Industrial'],
    ['bidadi', 'Outskirts/Industrial'],
  ];

  for (const [id, expectedRegion] of checks) {
    const loc = findLocalityById(id);
    assert.ok(loc, `Expected match for ${id}`);
    assert.equal(
      getLocalityRegion(loc),
      expectedRegion,
      `Expected ${loc.name} to map to ${expectedRegion}`
    );
  }
});

test('groupLocalitiesByRegion omits empty regions by default when filtering subsets', () => {
  const subsets = BENGALURU_LOCALITIES.filter((l) =>
    ['Whitefield', 'Devanahalli', 'Bidadi'].includes(l.name)
  );
  const filteredGroups = groupLocalitiesByRegion(subsets);
  assert.deepEqual(
    filteredGroups.map((g) => g.region),
    ['East', 'North-East', 'Outskirts/Industrial']
  );

  const withEmpty = groupLocalitiesByRegion(subsets, { includeEmpty: true });
  assert.equal(withEmpty.length, 7);
});
