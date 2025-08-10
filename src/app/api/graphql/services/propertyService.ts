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
}

// Re-export types for backward compatibility
export type { Property, CreatePropertyInput, UpdatePropertyInput };

export class PropertyService {
  static async getProperties(limit: number = 10, offset: number = 0, filters?: PropertyFilters) {
    const query = `
      query GetProperties($limit: Int, $offset: Int, $filters: real_estate_property_listing_bool_exp) {
        real_estate_property_listing(limit: $limit, offset: $offset, order_by: {created_at: desc}, where: $filters) {
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
      filters: filters ? this.buildFilters(filters) : undefined,
    };

    return await executeQuery(query, variables);
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
          is_public
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
          is_public
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
    const hasuraFilters: any = {};

    if (filters.location) {
      // Map location to address field - you might need to adjust this based on your address structure
      hasuraFilters.address = { _ilike: `%${filters.location}%` };
    }

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

    // Only show public properties by default
    hasuraFilters.is_public = { _eq: true };

    return hasuraFilters;
  }
}
