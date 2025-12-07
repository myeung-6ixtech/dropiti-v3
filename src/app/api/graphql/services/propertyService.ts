import { executeQuery, executeMutation } from '../serverClient';
import type { Property, CreatePropertyInput, UpdatePropertyInput } from '../types';

// Define the property interface based on your Hasura schema
export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  type?: string;
  furnished?: string;
  petsAllowed?: boolean;
  parking?: boolean;
  landlordFirebaseUid?: string; // Add landlord filter
}

// Hasura filter interface for GraphQL queries
interface HasuraFilters {
  rental_price?: { _gte?: number; _lte?: number };
  num_bedroom?: { _gte: number };
  property_type?: { _eq: string };
  furnished?: { _eq: string };
  pets_allowed?: { _eq: boolean };
  status?: { _eq: string };
  landlord_firebase_uid?: { _eq: string };
}

// Re-export types for backward compatibility
export type { Property, CreatePropertyInput, UpdatePropertyInput };

export class PropertyService {
  static async getProperties(limit: number = 10, offset: number = 0, filters?: PropertyFilters) {
    try {
      console.log('PropertyService: Starting property search with filters:', JSON.stringify(filters, null, 2));
      
      const hasuraFilters = this.buildFilters(filters || {});
      
      // Build the GraphQL query
      const query = `
        query GetProperties($limit: Int!, $offset: Int!, $filters: real_estate_property_listing_bool_exp) {
          real_estate_property_listing(
            limit: $limit
            offset: $offset
            where: $filters
            order_by: { created_at: desc }
          ) {
            id
            property_uuid
            title
            description
            address
            rental_price
            num_bedroom
            num_bathroom
            property_type
            furnished
            pets_allowed
            amenities
            display_image
            uploaded_images
            availability_date
            status
            landlord_firebase_uid
            created_at
          }
          real_estate_property_listing_aggregate(where: $filters) {
            aggregate {
              count
            }
          }
        }
      `;

      const variables = {
        limit,
        offset,
        filters: hasuraFilters
      };

      console.log('PropertyService: Executing GraphQL query with variables:', JSON.stringify(variables, null, 2));
      console.log('PropertyService: Built filters:', JSON.stringify(hasuraFilters, null, 2));

      const result = await executeQuery(query, variables);
      
      console.log('PropertyService: Raw GraphQL result:', JSON.stringify(result, null, 2));
      
      // Type assertion for the response data
      const typedResult = result as { real_estate_property_listing?: unknown[]; real_estate_property_listing_aggregate?: { aggregate?: { count?: number } } };
      
      if (!typedResult.real_estate_property_listing) {
        console.log('PropertyService: No properties found in result');
        return { properties: [], total: 0 };
      }

      const properties = typedResult.real_estate_property_listing;
      const total = typedResult.real_estate_property_listing_aggregate?.aggregate?.count || 0;
      
      console.log(`PropertyService: Found ${properties.length} properties out of ${total} total`);
      console.log('PropertyService: First property address sample:', properties[0] ? JSON.stringify((properties[0] as { address?: unknown }).address, null, 2) : 'No properties');
      
      return { properties, total };
    } catch (error) {
      console.error('PropertyService: Error fetching properties:', error);
      throw error;
    }
  }

  // Test method to check what's in the database
  static async testDatabaseContent() {
    try {
      console.log('PropertyService: Testing database content...');
      
      const testQuery = `
        query TestDatabaseContent {
          real_estate_property_listing(limit: 10) {
            id
            title
            address
            status
            created_at
          }
          real_estate_property_listing_aggregate {
            aggregate {
              count
            }
          }
        }
      `;
      
      const result = await executeQuery(testQuery, {});
      console.log('PropertyService: Database test result:', JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      console.error('PropertyService: Database test failed:', error);
      throw error;
    }
  }

  static async getPropertyById(id: string) {
    const query = `
      query GetProperty($id: uuid!) {
        real_estate_property_listing_by_pk(id: $id) {
          id
          property_uuid
          landlord_firebase_uid
          title
          description
          created_at
          property_type
          rental_space
          address
          show_specific_location
          gross_area_size
          gross_area_size_unit
          num_bedroom
          num_bathroom
          furnished
          pets_allowed
          amenities
          display_image
          uploaded_images
          rental_price
          rental_price_currency
          availability_date
          is_public
        }
      }
    `;

    return await executeQuery(query, { id });
  }

  static async createProperty(propertyData: CreatePropertyInput) {
    const mutation = `
      mutation CreateProperty($property: real_estate_property_listing_insert_input!) {
        insert_real_estate_property_listing_one(object: $property) {
          id
          property_uuid
          landlord_firebase_uid
          title
          description
          created_at
          property_type
          rental_space
          address
          show_specific_location
          gross_area_size
          gross_area_size_unit
          num_bedroom
          num_bathroom
          furnished
          pets_allowed
          amenities
          display_image
          uploaded_images
          rental_price
          rental_price_currency
          availability_date
          status
        }
      }
    `;

    return await executeMutation(mutation, { property: propertyData });
  }

  static async updateProperty(id: string, updates: UpdatePropertyInput) {
    const mutation = `
      mutation UpdateProperty($id: uuid!, $updates: real_estate_property_listing_set_input!) {
        update_real_estate_property_listing_by_pk(
          pk_columns: { id: $id }
          _set: $updates
        ) {
          id
          property_uuid
          landlord_firebase_uid
          title
          description
          created_at
          property_type
          rental_space
          address
          show_specific_location
          gross_area_size
          gross_area_size_unit
          num_bedroom
          num_bathroom
          furnished
          pets_allowed
          amenities
          display_image
          uploaded_images
          rental_price
          rental_price_currency
          availability_date
          status
        }
      }
    `;

    return await executeMutation(mutation, { id, updates });
  }

  static async deleteProperty(id: string) {
    const mutation = `
      mutation DeleteProperty($id: uuid!) {
        delete_real_estate_property_listing_by_pk(id: $id) {
          id
        }
      }
    `;

    return await executeMutation(mutation, { id });
  }

  private static buildFilters(filters: PropertyFilters) {
    const hasuraFilters: HasuraFilters = {};

    // Only show published properties by default (status is the single source of truth)
    hasuraFilters.status = { _eq: 'published' };

    // Add other filters if they exist
    if (filters.minPrice || filters.maxPrice) {
      hasuraFilters.rental_price = {};
      if (filters.minPrice) hasuraFilters.rental_price._gte = filters.minPrice;
      if (filters.maxPrice) hasuraFilters.rental_price._lte = filters.maxPrice;
    }

    if (filters.bedrooms) {
      hasuraFilters.num_bedroom = { _gte: filters.bedrooms };
    }

    if (filters.type) {
      hasuraFilters.property_type = { _eq: filters.type };
    }

    if (filters.furnished) {
      hasuraFilters.furnished = { _eq: filters.furnished };
    }

    if (filters.petsAllowed !== undefined) {
      hasuraFilters.pets_allowed = { _eq: filters.petsAllowed };
    }

    if (filters.landlordFirebaseUid) {
      hasuraFilters.landlord_firebase_uid = { _eq: filters.landlordFirebaseUid };
    }

    console.log('PropertyService: Built filters:', JSON.stringify(hasuraFilters, null, 2));
    
    return hasuraFilters;
  }
}
