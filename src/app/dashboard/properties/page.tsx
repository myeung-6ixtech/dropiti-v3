'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import PropertyCard from '@/components/PropertyCard';
import DraftCard from '@/components/dashboard/DraftCard';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { propertyCardClasses } from '@/styles/property-card';

interface Draft {
  id: string;
  property_uuid: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  last_saved_at: string;
  status: string;
  property_type: string;
  rental_space: string;
  address: string;
  num_bedroom: number;
  num_bathroom: number;
  rental_price: number;
  amenities: string[];
  display_image: string;
  completion_percentage: number;
}

export default function PropertiesPage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');

  // Fetch user's properties and drafts
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !authUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching properties and drafts for user:', authUser.id);
        
        // Fetch both properties and drafts in parallel
        const [propertiesResponse, draftsResponse] = await Promise.all([
          propertiesAPI.getListings({
            limit: 50, // Get up to 50 properties
            landlord_firebase_uid: authUser.id, // Filter by current user's Firebase UID
          }),
          propertiesAPI.getDrafts(authUser.id)
        ]);

        console.log('Properties API response:', propertiesResponse);
        console.log('Drafts API response:', draftsResponse);

        if (propertiesResponse.success && propertiesResponse.data) {
          setProperties(propertiesResponse.data);
          console.log('Properties set:', propertiesResponse.data);
        }

        if (draftsResponse.success && draftsResponse.data) {
          setDrafts(draftsResponse.data);
          console.log('Drafts set:', draftsResponse.data);
        }

        if (!propertiesResponse.success && !draftsResponse.success) {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, authUser?.id]);

  // Filter properties and drafts based on search term and active tab
  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.details?.type as string)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (draft.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (draft.property_type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-0">Properties</h1>
            <p className="text-gray-600 mt-1">Manage your property listings</p>
          </div>
          <Link href="/dashboard/add-property" className="btn-primary flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <button className="btn-outline-md">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('published')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'published'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Published Properties
            {properties.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {properties.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'drafts'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Drafts
            {drafts.length > 0 && (
              <span className="ml-2 bg-purple-100 text-purple-700 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {drafts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <CenteredLoadingSpinner />
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon="⚠️"
            title="Error Loading Properties"
            description={error}
            actionText="Try Again"
            onActionClick={() => window.location.reload()}
            className="bg-red-50"
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && activeTab === 'published' && filteredProperties.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon="🏠"
            title="No Published Properties"
            description={searchTerm ? 'No published properties match your search criteria. Try adjusting your search terms.' : "You haven't published any properties yet. Start by creating your first property listing to attract potential tenants."}
            actionText={!searchTerm ? "Add Your First Property" : undefined}
            actionHref={!searchTerm ? "/dashboard/add-property" : undefined}
          />
        </div>
      )}

      {!isLoading && !error && activeTab === 'drafts' && filteredDrafts.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon="📝"
            title="No Drafts"
            description={searchTerm ? 'No drafts match your search criteria. Try adjusting your search terms.' : "You haven't created any drafts yet. Start by creating your first property draft to work on your listing before publishing."}
            actionText={!searchTerm ? "Create Your First Draft" : undefined}
            actionHref={!searchTerm ? "/dashboard/add-property" : undefined}
          />
        </div>
      )}

      {/* Published Properties Grid */}
      {!isLoading && !error && activeTab === 'published' && filteredProperties.length > 0 && (
        <div className="flex-1 overflow-auto p-6">
          <div className={propertyCardClasses.grid.default}>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isDashboard={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Drafts Grid */}
      {!isLoading && !error && activeTab === 'drafts' && filteredDrafts.length > 0 && (
        <div className="flex-1 overflow-auto p-6">
          <div className={propertyCardClasses.grid.default}>
            {filteredDrafts.map((draft) => (
              <DraftCard
                key={draft.property_uuid}
                draft={draft}
                onContinue={(draftId: string) => router.push(`/dashboard/properties/edit/${draftId}`)}
                onDelete={async (draftId: string) => {
                  try {
                    const response = await propertiesAPI.deleteDraft(draftId);
                    if (response.success) {
                      setDrafts(prev => prev.filter(d => d.property_uuid !== draftId));
                    }
                  } catch (error) {
                    console.error('Failed to delete draft:', error);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
