'use client';

import { useState, useEffect } from 'react';
import { FiX, FiHome } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';
import MobileBottomSheet from '@/components/ui/MobileBottomSheet';

interface PropertyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareProperty: (property: Record<string, unknown>, message: string) => void;
  roomId: string;
}

export default function PropertyShareModal({ 
  isOpen, 
  onClose, 
  onShareProperty
}: PropertyShareModalProps) {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const [properties, setProperties] = useState<Record<string, unknown>[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Record<string, unknown> | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch user's published properties
  useEffect(() => {
    if (isOpen && authUser?.id) {
      fetchUserProperties();
    }
  }, [isOpen, authUser?.id]);

  const fetchUserProperties = async () => {
    try {
      setIsLoading(true);
      console.log('[PropertyShareModal] Fetching properties for user:', authUser?.id);
      
      const response = await propertiesAPI.getListings({
        landlord_firebase_uid: authUser?.id || '',
        limit: 50
      });
      
      console.log('[PropertyShareModal] API Response:', response);
      
      if (response.success && response.data) {
        const publishedProperties = Array.isArray(response.data) 
          ? response.data 
          : response.data.properties || [];
        
        console.log('[PropertyShareModal] All properties:', publishedProperties);
        console.log('[PropertyShareModal] Property count:', publishedProperties.length);
        
        // Log first property to see structure
        if (publishedProperties.length > 0) {
          console.log('[PropertyShareModal] First property structure:', publishedProperties[0]);
        }
        
        // Filter only published properties - be more lenient with filtering
        const activeProperties = publishedProperties.filter(
          (property: Record<string, unknown>) => {
            const isPublished = property.status === 'published' || 
                               property.property_status === 'published' ||
                               property.is_public === true ||
                               property.available === true;
            
            console.log(`[PropertyShareModal] Property "${property.title}" - status: ${property.status}, property_status: ${property.property_status}, is_public: ${property.is_public}, available: ${property.available}, isPublished: ${isPublished}`);
            
            return isPublished;
          }
        );
        
        console.log('[PropertyShareModal] Filtered active properties:', activeProperties.length);
        
        // If no published properties found, show all properties for debugging
        if (activeProperties.length === 0 && publishedProperties.length > 0) {
          console.warn('[PropertyShareModal] No published properties found, showing all properties for debugging');
          setProperties(publishedProperties);
        } else {
          setProperties(activeProperties);
        }
      }
    } catch (error) {
      console.error('[PropertyShareModal] Error fetching properties:', error);
      showToast('error', 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (selectedProperty) {
      onShareProperty(selectedProperty, customMessage);
      setSelectedProperty(null);
      setCustomMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  // Render property list content (shared between mobile and desktop)
  const renderPropertyList = () => (
    <>
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-2 text-sm">Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiHome className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="font-medium">No published properties found</p>
          <p className="text-sm mt-1">Publish a property first to share it</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {properties.map((property: Record<string, unknown>) => (
            <div
              key={String(property.id || property.property_uuid)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedProperty?.id === property.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedProperty(property)}
            >
              <div className="flex items-center space-x-3">
                {(Array.isArray(property.images) && property.images.length > 0) || property.imageUrl || property.displayImage || (Array.isArray(property.uploadedImages) && property.uploadedImages.length > 0) ? (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : property.imageUrl || property.displayImage || (Array.isArray(property.uploadedImages) && property.uploadedImages.length > 0 ? property.uploadedImages[0] : '')}
                      alt={String(property.title || 'Property')}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <FiHome className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate mb-0">
                    {String(property.title || 'Untitled Property')}
                  </h4>
                  <p className="text-xs text-gray-500 truncate mb-0">
                    {String(property.location || property.district || 'Location not specified')} • ${Number(property.price || 0).toLocaleString()}/month
                  </p>
                  <p className="text-xs text-gray-400 mb-0">
                    {Number(property.bedrooms || 0)} bed • {Number(property.bathrooms || 0)} bath
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // Mobile version with BottomSheet
  if (isMobile) {
    return (
      <MobileBottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Share Property"
        size="large"
      >
        <div className="px-4 pb-4">
          {/* Property Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Property to Share
            </label>
            {renderPropertyList()}
          </div>

          {/* Custom Message */}
          {selectedProperty && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a message (optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="I think this property might interest you..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                rows={3}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!selectedProperty}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Share Property
            </button>
          </div>
        </div>
      </MobileBottomSheet>
    );
  }

  // Desktop version with centered modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-0">Share Property</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Property Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Property to Share
          </label>
          {renderPropertyList()}
        </div>

        {/* Custom Message */}
        {selectedProperty && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a message (optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="I think this property might interest you..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              rows={3}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedProperty}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Share Property
          </button>
        </div>
      </div>
    </div>
  );
}

