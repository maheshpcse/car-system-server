import { describe, expect, it } from 'vitest';
import { VEHICLE_CATALOG } from '../src/database/seed/catalog.js';
import { calculateConfigurationPrice } from '../src/modules/configurator/priceCalculator.js';
import { toConfigurationCatalog } from '../src/modules/vehicles/mapper.js';
import { AppError } from '../src/common/errors/AppError.js';

describe('calculateConfigurationPrice', () => {
  const vehicle = VEHICLE_CATALOG.find((v) => v.id === 'aureon-x1')!;
  const catalog = toConfigurationCatalog(vehicle);

  it('sums variant plus selected options', () => {
    const pricing = calculateConfigurationPrice(catalog, {
      variantId: 'lr',
      colorId: 'indigo',
      wheelId: 'forged-21',
      interiorId: 'int-tan',
      trimId: 'trim-carbon',
      accessoryIds: ['acc-sound', 'acc-charger'],
    });
    expect(pricing.basePrice).toBe(68900);
    expect(pricing.exteriorColorPrice).toBe(1400);
    expect(pricing.wheelPrice).toBe(3200);
    expect(pricing.interiorPrice).toBe(2400);
    expect(pricing.trimPrice).toBe(1200);
    expect(pricing.accessories).toBe(2550);
    expect(pricing.optionPrice).toBe(10750);
    expect(pricing.totalPrice).toBe(79650);
    expect(pricing.currency).toBe('USD');
  });

  it('rejects unknown options', () => {
    expect(() =>
      calculateConfigurationPrice(catalog, {
        variantId: 'missing',
        colorId: 'indigo',
        wheelId: 'aero-19',
        interiorId: 'int-stone',
        trimId: 'trim-ash',
        accessoryIds: [],
      }),
    ).toThrow(AppError);
  });
});
