import { AppError } from '../../common/errors/AppError.js';

export interface PricedOption {
  id: string;
  price: number;
  available?: boolean;
}

export interface ConfigurationSelection {
  variantId: string;
  colorId: string;
  wheelId: string;
  interiorId: string;
  trimId: string;
  accessoryIds: string[];
}

export interface ConfigurationCatalog {
  vehicleId: string;
  variants: PricedOption[];
  colors: PricedOption[];
  wheels: PricedOption[];
  interiors: PricedOption[];
  trims: PricedOption[];
  accessories: PricedOption[];
  currency?: string;
}

export interface PriceBreakdown {
  basePrice: number;
  variantPrice: number;
  exteriorColorPrice: number;
  wheelPrice: number;
  interiorPrice: number;
  trimPrice: number;
  accessories: number;
  optionPrice: number;
  totalPrice: number;
  currency: string;
}

function pick(options: PricedOption[], id: string, label: string) {
  const found = options.find((item) => item.id === id);
  if (!found) throw AppError.badRequest('INVALID_OPTION', `${label} "${id}" is not available for this vehicle`);
  if (found.available === false) throw AppError.badRequest('OPTION_UNAVAILABLE', `${label} "${id}" is currently unavailable`);
  return found;
}

export function calculateConfigurationPrice(
  catalog: ConfigurationCatalog,
  selection: ConfigurationSelection,
): PriceBreakdown {
  const variant = pick(catalog.variants, selection.variantId, 'Variant');
  const color = pick(catalog.colors, selection.colorId, 'Exterior color');
  const wheel = pick(catalog.wheels, selection.wheelId, 'Wheel');
  const interior = pick(catalog.interiors, selection.interiorId, 'Interior');
  const trim = pick(catalog.trims, selection.trimId, 'Trim');

  const uniqueAccessories = [...new Set(selection.accessoryIds)];
  let accessoryTotal = 0;
  for (const id of uniqueAccessories) {
    accessoryTotal += pick(catalog.accessories, id, 'Accessory').price;
  }

  const optionPrice = color.price + wheel.price + interior.price + trim.price + accessoryTotal;
  return {
    basePrice: variant.price,
    variantPrice: variant.price,
    exteriorColorPrice: color.price,
    wheelPrice: wheel.price,
    interiorPrice: interior.price,
    trimPrice: trim.price,
    accessories: accessoryTotal,
    optionPrice,
    totalPrice: variant.price + optionPrice,
    currency: catalog.currency ?? 'USD',
  };
}
