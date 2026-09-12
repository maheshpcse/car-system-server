import { describe, expect, it } from 'vitest';
import { VEHICLE_CATALOG } from '../src/database/seed/catalog.js';
import { matchesSearchBlob, normalizeSort } from '../src/modules/vehicles/vehicleQuery.js';

describe('vehicle query helpers', () => {
  it('normalizes frontend and prompt sort keys', () => {
    expect(normalizeSort('price_asc')).toBe('price-asc');
    expect(normalizeSort('price-desc')).toBe('price-desc');
    expect(normalizeSort('alphabetical')).toBe('alphabetical');
    expect(normalizeSort('name_desc')).toBe('name_desc');
    expect(normalizeSort('unknown')).toBe('recommended');
  });

  it('matches catalog search terms used by the frontend', () => {
    const aureon = VEHICLE_CATALOG.find((v) => v.id === 'aureon-x1')!;
    const blob = [aureon.manufacturer, aureon.model, aureon.variant, aureon.bodyType, aureon.fuelType].join(' ');
    expect(matchesSearchBlob(blob, 'aureon')).toBe(true);
    expect(matchesSearchBlob(blob, 'electric sedan')).toBe(true);
    expect(matchesSearchBlob(blob, 'pickup')).toBe(false);
  });
});
