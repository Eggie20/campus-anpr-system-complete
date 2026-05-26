/**
 * Shared Vehicle Constants
 * 
 * Single source of truth for vehicle types, brands, and colors
 * that match the SMART-PLATE ANPR engine's detection classes.
 */

// ── Vehicle Types (5 classes) ──
// Must match the PostgreSQL ENUM: vehicle_type ('car','motorcycle','van','truck','other')
// and the ANPR engine's vehicle_type_detector.py RAW_NAMES
export const VEHICLE_TYPES = [
  { value: 'car',        icon: '🚗', label: 'Car' },
  { value: 'motorcycle', icon: '🏍️', label: 'Motorcycle' },
  { value: 'van',        icon: '🚐', label: 'Van' },
  { value: 'truck',      icon: '🚚', label: 'Truck' },
  { value: 'other',      icon: '🚙', label: 'Others' },
];

// ── Vehicle Brands (59 classes) ──
// Must match brand_detector.py BRAND_CLASS_NAMES_59
export const VEHICLE_BRANDS = [
  'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'BYD',
  'Brilliance', 'Bugatti', 'Changan', 'Chery', 'Chevrolet',
  'Citroen', 'DS', 'Daewoo', 'Daihatsu', 'Dodge',
  'Dongfeng', 'Fiat', 'Ford', 'GMC', 'Gac',
  'Geely', 'Honda', 'Hyundai', 'Infiniti', 'Isuzu',
  'JAC', 'Jaecoo', 'Jaguar', 'Jeep', 'Jetour',
  'KIA', 'Lada', 'Lamborghini', 'Land Rover', 'Lexus',
  'MG', 'Maxus', 'Mazda', 'Mercedes', 'Mini Cooper',
  'Mitsubishi', 'Neta', 'Nissan', 'Omoda', 'Opel',
  'Peugeot', 'Porsche', 'Proton', 'Renault', 'Scania',
  'Seat', 'Skoda', 'Subaru', 'Suzuki', 'Tesla',
  'Toyota', 'Vinfast', 'Volkswagen', 'Volvo',
];

// ── Vehicle Colors (15 classes) ──
// Must match color_detector.py COLOR_CLASS_NAMES
export const VEHICLE_COLORS = [
  'Beige', 'Black', 'Blue', 'Brown', 'Gold',
  'Green', 'Grey', 'Orange', 'Pink', 'Purple',
  'Red', 'Silver', 'Tan', 'White', 'Yellow',
];

// ── Helpers ──
export function getVehicleIcon(type) {
  const found = VEHICLE_TYPES.find(v => v.value === type?.toLowerCase());
  return found ? found.icon : '🚘';
}
