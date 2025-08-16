export const AMENITIES = {
  // Internet & Technology
  WIFI: { id: 'wifi', name: 'WiFi', icon: 'Wifi', category: 'Internet & Technology' },
  
  // Climate Control
  AIR_CONDITIONING: { id: 'air-conditioning', name: 'Air Conditioning', icon: 'AirConditioner', category: 'Climate Control' },
  HEATING: { id: 'heating', name: 'Heating', icon: 'Lightning', category: 'Climate Control' },
  
  // Entertainment
  TV: { id: 'tv', name: 'TV', icon: 'TV', category: 'Entertainment' },
  
  // Kitchen
  DISHWASHER: { id: 'dishwasher', name: 'Dishwasher', icon: 'Oven', category: 'Kitchen' },
  FRIDGE: { id: 'fridge', name: 'Fridge', icon: 'Fridge', category: 'Kitchen' },
  MICROWAVE: { id: 'microwave', name: 'Microwave', icon: 'Microwave', category: 'Kitchen' },
  OVEN: { id: 'oven', name: 'Oven', icon: 'Oven', category: 'Kitchen' },
  GAS_STOVE: { id: 'gas-stove', name: 'Gas Stove', icon: 'GasStove', category: 'Kitchen' },
  INDUCTION_STOVE: { id: 'induction-stove', name: 'Induction Stove', icon: 'InductionStove', category: 'Kitchen' },
  
  // Laundry
  WASHING_MACHINE: { id: 'washer', name: 'Washing Machine', icon: 'WashingMachine', category: 'Laundry' },
  DRYER: { id: 'dryer', name: 'Dryer', icon: 'WashingMachine', category: 'Laundry' },
  
  // Transportation
  PARKING: { id: 'parking', name: 'Parking', icon: 'CarPark', category: 'Transportation' },
  
  // Fitness & Recreation
  GYM: { id: 'gym', name: 'Gym', icon: 'Gym', category: 'Fitness' },
  POOL: { id: 'pool', name: 'Swimming Pool', icon: 'SwimmingPool', category: 'Recreation' },
  
  // Safety & Security
  SECURITY_SYSTEM: { id: 'security', name: 'Security System', icon: 'SecurityGuard', category: 'Safety' },
  SMOKE_ALARM: { id: 'smoke-alarm', name: 'Smoke Alarm', icon: 'SmokeAlarm', category: 'Safety' },
  
  // Accessibility
  ELEVATOR: { id: 'elevator', name: 'Elevator', icon: 'Elevator', category: 'Accessibility' },
  
  // Outdoor
  BALCONY: { id: 'balcony', name: 'Balcony', icon: 'Balcony', category: 'Outdoor' },
  TREES: { id: 'trees', name: 'Trees', icon: 'Trees', category: 'Outdoor' },
  WALK: { id: 'walk', name: 'Walk', icon: 'Walk', category: 'Outdoor' },
  
  // Work & Communication
  WORKSPACE: { id: 'workspace', name: 'Workspace', icon: 'Table', category: 'Work' },
  PHONE: { id: 'phone', name: 'Phone', icon: 'Chat', category: 'Communication' },
  
  // Furnishing & Utilities
  FURNISHED: { id: 'furnished', name: 'Furnished', icon: 'Home', category: 'Furnishing' },
  UTILITIES_INCLUDED: { id: 'utilities-included', name: 'Utilities Included', icon: 'Lightning', category: 'Utilities' },
  LIGHTNING: { id: 'lightning', name: 'Lightning', icon: 'Lightning', category: 'Utilities' },
  CLOCK: { id: 'clock', name: 'Clock', icon: 'Clock', category: 'Utilities' },
  RULER: { id: 'ruler', name: 'Ruler', icon: 'Ruler', category: 'Utilities' },
  
  // Services
  CLEANING_SERVICE: { id: 'cleaning', name: 'Cleaning Service', icon: 'Clean', category: 'Services' },
  CLEAN: { id: 'clean', name: 'Clean', icon: 'Clean', category: 'Services' },
  QUIET: { id: 'quiet', name: 'Quiet', icon: 'Quiet', category: 'Services' },
  SPACIOUS: { id: 'spacious', name: 'Spacious', icon: 'Spacious', category: 'Services' },
  
  // Bathroom
  BATHTUB: { id: 'bathtub', name: 'Bathtub', icon: 'Bathtub', category: 'Bathroom' },
  SHOWER: { id: 'shower', name: 'Shower', icon: 'Shower', category: 'Bathroom' },
  HAIR_DRYER: { id: 'hair-dryer', name: 'Hair Dryer', icon: 'HairDryer', category: 'Bathroom' },
  EXHAUST_FAN: { id: 'exhaust-fan', name: 'Exhaust Fan', icon: 'ExhaustFan', category: 'Bathroom' },
  DEHUMIDIFIER: { id: 'dehumidifier', name: 'Dehumidifier', icon: 'Dehumidifier', category: 'Bathroom' },
  
  // Family
  CHILDREN: { id: 'children', name: 'Children', icon: 'Children', category: 'Family' }
} as const;

export const AMENITY_CATEGORIES = {
  'Internet & Technology': ['wifi'],
  'Climate Control': ['air-conditioning', 'heating'],
  'Entertainment': ['tv'],
  'Kitchen': ['dishwasher', 'fridge', 'microwave', 'oven', 'gas-stove', 'induction-stove'],
  'Laundry': ['washer', 'dryer'],
  'Transportation': ['parking'],
  'Fitness': ['gym'],
  'Recreation': ['pool'],
  'Safety': ['security', 'smoke-alarm'],
  'Accessibility': ['elevator'],
  'Outdoor': ['balcony', 'trees', 'walk'],
  'Work': ['workspace'],
  'Communication': ['phone'],
  'Furnishing': ['furnished'],
  'Utilities': ['utilities-included', 'lightning', 'clock', 'ruler'],
  'Services': ['cleaning', 'clean', 'quiet', 'spacious'],
  'Bathroom': ['bathtub', 'shower', 'hair-dryer', 'exhaust-fan', 'dehumidifier'],
  'Family': ['children']
} as const;

export type AmenityId = typeof AMENITIES[keyof typeof AMENITIES]['id'];
export type AmenityCategory = keyof typeof AMENITY_CATEGORIES;

// Helper function to get all amenities as an array
export const getAllAmenities = () => Object.values(AMENITIES);

// Helper function to get amenities by category
export const getAmenitiesByCategory = (category: AmenityCategory) => {
  const amenityIds = AMENITY_CATEGORIES[category];
  return amenityIds.map(id => AMENITIES[id as keyof typeof AMENITIES]).filter(Boolean);
};

// Helper function to get amenity by ID
export const getAmenityById = (id: string) => {
  return Object.values(AMENITIES).find(amenity => amenity.id === id);
};
