import { 
  Wifi, AirConditioner, Lightning, TV, Oven, WashingMachine, 
  CarPark, Gym, SwimmingPool, SecurityGuard, SmokeAlarm, 
  Elevator, Balcony, Table, Chat, Home, Clean, Fridge, 
  Microwave, GasStove, InductionStove, Bathtub, Shower, 
  HairDryer, ExhaustFan, Dehumidifier, Clock, Ruler, 
  Trees, Walk, Quiet, Spacious, Children 
} from '@/assets/icons';
import { AMENITIES, getAmenityById } from './amenities';

export const AMENITY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'wifi': Wifi,
  'air-conditioning': AirConditioner,
  'heating': Lightning,
  'tv': TV,
  'dishwasher': Oven,
  'fridge': Fridge,
  'microwave': Microwave,
  'oven': Oven,
  'gas-stove': GasStove,
  'induction-stove': InductionStove,
  'washer': WashingMachine,
  'dryer': WashingMachine,
  'parking': CarPark,
  'gym': Gym,
  'pool': SwimmingPool,
  'security': SecurityGuard,
  'smoke-alarm': SmokeAlarm,
  'elevator': Elevator,
  'balcony': Balcony,
  'trees': Trees,
  'walk': Walk,
  'workspace': Table,
  'phone': Chat,
  'furnished': Home,
  'utilities-included': Lightning,
  'lightning': Lightning,
  'clock': Clock,
  'ruler': Ruler,
  'cleaning': Clean,
  'clean': Clean,
  'quiet': Quiet,
  'spacious': Spacious,
  'bathtub': Bathtub,
  'shower': Shower,
  'hair-dryer': HairDryer,
  'exhaust-fan': ExhaustFan,
  'dehumidifier': Dehumidifier,
  'children': Children
};

export const getAmenityIcon = (amenityId: string) => {
  return AMENITY_ICON_MAP[amenityId] || Home;
};

export const getAmenityDisplayName = (amenityId: string) => {
  const amenity = getAmenityById(amenityId);
  return amenity?.name || amenityId;
};

export const getAmenityIconByName = (amenityName: string) => {
  // Find amenity by name (case-insensitive)
  const amenity = Object.values(AMENITIES).find(
    a => a.name.toLowerCase() === amenityName.toLowerCase()
  );
  if (amenity) {
    return AMENITY_ICON_MAP[amenity.id];
  }
  return Home; // Default fallback
};
