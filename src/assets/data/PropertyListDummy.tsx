export interface Property {
  id: number
  UIDOwner: number
  postedTime: Date
  lastUpdate: Date
  listingTitle: string
  description: string
  // Unit Properties
  propertyType: string
  rentType: string
  bedroomCount: number
  washroomCount: number
  amenities: string[]
  floorplanUrl: string
  // Map Information
  location: string
  longitude: string
  latitude: string
  // Rental
  listingPrice: number
  others: string // optional
  // Misc
  imageUrl: string
  attributes: string[] // output the max 3 random skills of this object
  saved: boolean
}

const properties: Property[] = [
  {
    id: 1,
    UIDOwner: 123,
    postedTime: new Date('2023-02-28T10:00:00Z'),
    lastUpdate: new Date('2023-02-28T10:00:00Z'),
    listingTitle: '3 Bedroom Flat in Tin Hau',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    propertyType: 'Estate',
    rentType: 'Whole Apartment',
    bedroomCount: 2,
    washroomCount: 2,
    amenities: ['Gym', 'Air Conditioning'],
    floorplanUrl: 'https://dummyimage.com/100x100/000/fff',
    location: 'Makati',
    longitude: '',
    latitude: '',
    listingPrice: 15000,
    others: '',
    imageUrl: 'https://dummyimage.com/100x100/000/fff',
    attributes: ['Cooking', 'Childcare'],
    saved: false
  },
  {
    id: 2,
    UIDOwner: 456,
    postedTime: new Date('2023-01-27T12:30:00Z'),
    lastUpdate: new Date('2023-02-28T10:00:00Z'),
    listingTitle: '3 Bedroom Flat in Tin Hau',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    propertyType: 'Villa',
    rentType: 'Whole Apartment',
    bedroomCount: 2,
    washroomCount: 2,
    amenities: ['Gym', 'Air Conditioning'],
    floorplanUrl: 'https://dummyimage.com/100x100/000/fff',
    location: 'Quezon City',
    longitude: '',
    latitude: '',
    listingPrice: 10000,
    others: '',
    imageUrl: 'https://dummyimage.com/100x100/000/fff',
    attributes: ['Elderly Care', 'Cooking'],
    saved: false
  }
  // add more dummy data here
]

export default properties
