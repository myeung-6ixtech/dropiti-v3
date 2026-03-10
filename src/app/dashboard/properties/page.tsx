'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import PropertyCard from '@/components/PropertyCard';
import { DraftCard } from '@/components/dashboard/DraftCard';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useRouter, useSearchParams } from 'next/navigation';
import { Property } from '@/types';
import { propertyCardClasses } from '@/styles/property-card';
import { PropertiesHeader } from './_components/properties-header';
import { PropertiesTabs } from './_components/properties-tabs';

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
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get initial tab from URL parameter, default to 'published'
  const tabParam = searchParams.get('tab');
  const initialTab = (tabParam === 'drafts' || tabParam === 'published') ? tabParam : 'published';
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>(initialTab);
  
  // Update active tab when URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'drafts' || tabParam === 'published') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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
        
        // Fetch both properties and drafts in parallel
        const [propertiesResponse, draftsResponse] = await Promise.all([
          propertiesAPI.getListings({
            limit: 50,
            landlord_user_id: authUser.id,
          }),
          propertiesAPI.getDrafts(authUser.id)
        ]);

        if (propertiesResponse.success && propertiesResponse.data) {
          setProperties(propertiesResponse.data);
        }

        if (draftsResponse.success && draftsResponse.data) {
          setDrafts(draftsResponse.data);
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

  // Use properties and drafts directly without filtering
  const filteredProperties = properties;
  const filteredDrafts = drafts;

  if (!isAuthenticated) {
    return <CenteredLoadingSpinner size="lg" />;
  }

  return (
    <div className="h-full flex flex-col">
      <PropertiesHeader 
        propertyCount={properties.length}
        draftCount={drafts.length}
      />
      <PropertiesTabs
        activeTab={activeTab}
        propertyCount={properties.length}
        draftCount={drafts.length}
        onTabChange={setActiveTab}
      />

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
            description="You haven't published any properties yet. Start by creating your first property listing to attract potential tenants."
            actionText="Add Your First Property"
            actionHref="/dashboard/add-property"
          />
        </div>
      )}

      {!isLoading && !error && activeTab === 'drafts' && filteredDrafts.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon="📝"
            title="No Drafts"
            description="You haven't created any drafts yet. Start by creating your first property draft to work on your listing before publishing."
            actionText="Create Your First Draft"
            actionHref="/dashboard/add-property"
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
