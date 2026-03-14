'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { tenantsAPI } from '@/lib/api-client';
import TenantProfilePreview from '@/components/tenant-profile/TenantProfilePreview';
import type { TenantProfileData, TenantListingStatus } from '@/types/tenant';
import { TenantProfileHeader } from './_components/tenant-profile-header';
import { TenantProfileEmptyState } from './_components/tenant-profile-empty-state';

export default function TenantProfilePage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [profileData, setProfileData] = useState<TenantProfileData>({});
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const nhostUserId = authUser?.id || '';

  // Load existing profile data
  useEffect(() => {
    if (!nhostUserId) {
      setLoading(false);
      return;
    }
    
    (async () => {
      try {
        setLoading(true);
        const res = await tenantsAPI.getTenantProfile(nhostUserId);
        const profile = res?.data || null;
        if (profile) {
          // Map API payload directly to state
          const mapped: TenantProfileData = {
            tenant_listing_title: profile.tenant_listing_title,
            tenant_listing_description: profile.tenant_listing_description,
            budget_min: profile.budget_min,
            budget_max: profile.budget_max,
            budget_currency: profile.budget_currency,
            payment_preferences: profile.payment_preferences || [],
            deposit_capability: profile.deposit_capability,
            preferred_property_types: profile.preferred_property_types || [],
            rental_space_preference: profile.rental_space_preference,
            furnishing_preference: profile.furnishing_preference,
            pets_allowed: profile.pets_allowed,
            preferred_locations: profile.preferred_locations || [],
            transportation_proximity: profile.transportation_proximity || [],
            neighborhood_preferences: profile.neighborhood_preferences || [],
            location_flexibility: profile.location_flexibility,
            preferred_move_in_date: profile.preferred_move_in_date,
            preferred_lease_duration: profile.preferred_lease_duration,
            notice_period: profile.notice_period,
            urgency_level: profile.urgency_level,
            work_location: profile.work_location,
            lifestyle_preferences: profile.lifestyle_preferences || [],
            special_requirements: profile.special_requirements || [],
            contact_preferences: profile.contact_preferences || [],
            best_contact_times: profile.best_contact_times || [],
            response_time_expectation: profile.response_time_expectation,
            tenant_privacy_settings: profile.privacy_settings || {},
            tenant_listing_status: profile.tenant_listing_status,
          };
          setProfileData(mapped);
        }
      } catch (error) {
        console.error(error);
        showToast('error', 'Failed to load tenant profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [nhostUserId, showToast]);

  const handlePublish = async () => {
    if (!nhostUserId) return;
    try {
      setIsPublishing(true);
      const { tenant_privacy_settings, ...rest } = profileData;
      await tenantsAPI.upsertTenantProfile({ 
        user_nhost_user_id: nhostUserId, 
        ...rest,
        privacy_settings: tenant_privacy_settings || {},
        tenant_listing_status: 'active' as TenantListingStatus
      });
      showToast('success', 'Tenant profile published successfully!');
      // Update local state instead of reloading
      setProfileData(prev => ({
        ...prev,
        tenant_listing_status: 'active' as TenantListingStatus
      }));
    } catch {
      showToast('error', 'Failed to publish profile');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!nhostUserId) return;
    try {
      setIsUnpublishing(true);
      const { tenant_privacy_settings, ...rest } = profileData;
      await tenantsAPI.upsertTenantProfile({ 
        user_nhost_user_id: nhostUserId, 
        ...rest,
        privacy_settings: tenant_privacy_settings || {},
        tenant_listing_status: 'inactive' as TenantListingStatus
      });
      showToast('success', 'Tenant profile has been unpublished');
      // Update local state instead of reloading
      setProfileData(prev => ({
        ...prev,
        tenant_listing_status: 'inactive' as TenantListingStatus
      }));
    } catch {
      showToast('error', 'Failed to unpublish profile');
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleModify = () => {
    router.push('/dashboard/tenant-profile/edit');
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your tenant profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Check if profile exists
  const hasProfile = Boolean(profileData.tenant_listing_title || profileData.tenant_listing_description);

  return (
    <div className="h-full flex flex-col">
      <TenantProfileHeader
        hasProfile={hasProfile}
        isPublished={Boolean(profileData.tenant_listing_status === 'active')}
        isPublishing={isPublishing}
        isUnpublishing={isUnpublishing}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onModify={handleModify}
      />

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {hasProfile ? (
            <TenantProfilePreview 
              data={profileData} 
              user={{
                name: authUser?.name,
                displayName: authUser?.displayName,
                avatar: authUser?.avatar || authUser?.photoUrl
              }}
              showActions={true}
              onEdit={handleModify}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              isSubmitting={isPublishing || isUnpublishing}
            />
          ) : (
            <TenantProfileEmptyState onCreateProfile={handleModify} />
          )}
        </div>
      </div>
    </div>
  );
}


