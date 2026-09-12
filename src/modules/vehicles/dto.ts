export type BodyType = 'sedan' | 'suv' | 'coupe' | 'hatchback' | 'wagon' | 'roadster' | 'crossover' | 'pickup';
export type FuelType = 'electric' | 'hybrid' | 'petrol' | 'diesel';
export type Transmission = 'automatic' | 'manual' | 'single-speed' | 'dual-clutch';
export type VehicleCategory = 'electric' | 'performance' | 'luxury' | 'family' | 'adventure' | 'compact';

export interface VehicleColorDto {
  id: string;
  name: string;
  hex: string;
  finish: 'solid' | 'metallic' | 'pearl' | 'matte';
  price: number;
}

export interface WheelOptionDto {
  id: string;
  name: string;
  sizeInches: number;
  style: 'aero' | 'sport' | 'classic' | 'forged';
  price: number;
}

export interface InteriorOptionDto {
  id: string;
  name: string;
  accent: string;
  material: 'fabric' | 'leather' | 'vegan-leather' | 'alcantara';
  price: number;
}

export interface TrimOptionDto {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface AccessoryOptionDto {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface VehicleVariantDto {
  id: string;
  name: string;
  price: number;
  power: number;
  range: number;
  acceleration: number;
}

export interface VehicleDimensionsDto {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  wheelbaseMm: number;
  cargoLiters: number;
  weightKg: number;
}

export interface VehicleDto {
  id: string;
  slug: string;
  manufacturer: string;
  model: string;
  variant: string;
  year: number;
  tagline: string;
  description: string;
  category: VehicleCategory[];
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: Transmission;
  power: number;
  torque: number;
  topSpeed: number;
  acceleration: number;
  range: number;
  mileage: number | null;
  seats: number;
  price: number;
  startingPrice?: number;
  currency: string;
  rating: number;
  isNew?: boolean;
  isFeatured?: boolean;
  featured?: boolean;
  thumbnail?: string | null;
  colors: VehicleColorDto[];
  wheels: WheelOptionDto[];
  interiors: InteriorOptionDto[];
  trims: TrimOptionDto[];
  accessories: AccessoryOptionDto[];
  variants: VehicleVariantDto[];
  dimensions: VehicleDimensionsDto;
  features: string[];
  technology: string[];
  safety: string[];
  model3d: string | null;
  silhouette: 'sedan' | 'suv' | 'coupe' | 'hatch' | 'wagon' | 'roadster' | 'pickup';
  renderMode: 'procedural' | 'asset';
  renderConfig?: Record<string, unknown> | null;
  modelUrl?: string | null;
}

export type SortKey =
  | 'recommended'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'price_asc'
  | 'price_desc'
  | 'power_desc'
  | 'range'
  | 'range_desc'
  | 'performance'
  | 'alphabetical'
  | 'name_asc'
  | 'name_desc';
