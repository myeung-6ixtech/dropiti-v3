'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { tenantsAPI } from '@/lib/api-client';
import { fetchMyTenantProfile, type TenantProfileEmbeddedUser } from '@/lib/tenant-profiles';
import { useTenantProfileDisplayUser } from '@/hooks/useTenantProfileDisplayUser';
import TenantProfilePreview from '@/components/tenant-profile/TenantProfilePreview';
import type { TenantProfileData, TenantListingStatus } from '@/types/tenant';
import { TenantProfileHeader } from './_components/tenant-profile-header';
import { TenantProfileEmptyState } from './_components/tenant-profile-empty-state';

export default function TenantProfilePage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [profileData, setProfileData] = useState<TenantProfileData>({});
  const [profileUser, setProfileUser] = useState<TenantProfileEmbeddedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const nhostUserId = authUser?.id || '';

  const { displayUser } = useTenantProfileDisplayUser(nhostUserId, profileUser, {
    displayName: authUser?.displayName,
    name: authUser?.name,
    avatar: authUser?.avatar || authUser?.photoUrl,
    email: authUser?.email,
    id: nhostUserId,
  });

  // Load JWT user's tenant profile via Nhost GET /v1/client/tenants/profile
  useEffect(() => {
    if (!isAuthenticated || !nhostUserId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await fetchMyTenantProfile(nhostUserId);
        if (res.success && res.data) {
          setProfileData(res.data);
          setProfileUser(res.user ?? null);
        } else if (res.notFound) {
          setProfileData({});
          setProfileUser(null);
        } else if (!res.success) {
          showToast('error', res.error ?? 'Failed to load tenant profile');
        }
      } catch (error) {
        console.error(error);
        showToast('error', 'Failed to load tenant profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, nhostUserId, showToast]);

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
              user={displayUser}
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


