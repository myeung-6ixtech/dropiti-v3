'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getSafeProfileImage } from '@/lib/utils';
import { uploadFileToNhost } from '@/lib/nhost-upload';

interface ProfilePhotoUploadProps {
  currentPhotoUrl: string;
  onPhotoChange: (photoUrl: string) => void;
  isEditing: boolean;
  disabled?: boolean;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoChange,
  isEditing,
  disabled = false
}: ProfilePhotoUploadProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.errors.join(', '));
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);
    setIsPreviewOpen(true);
    setUploadError(null);
  };

  const validateFile = (file: File): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check file size (max 5MB for profile photos)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('Profile photo must be less than 5MB');
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.push('File must be an image');
    }
    
    // Check for common image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Only JPEG, PNG, and WebP images are supported');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const handleUpload = async () => {
    if (!previewUrl || !fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const { publicUrl } = await uploadFileToNhost(file);
      onPhotoChange(publicUrl);
      setIsPreviewOpen(false);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Profile photo upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsPreviewOpen(false);
    setPreviewUrl(null);
    setUploadError(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {/* Profile Photo Display and Edit Button */}
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
          <Image
            src={getSafeProfileImage(currentPhotoUrl, '/images/Portrait_Placeholder.png')}
            alt="Profile"
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
          
          {/* Edit Button Overlay */}
          {isEditing && !disabled && (
            <button
              onClick={handleEditClick}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
              type="button"
            >
              <CameraIcon className="h-6 w-6 text-white" />
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Status */}
        {isUploading && (
          <div className="text-sm text-blue-600">
            Uploading...
          </div>
        )}
        
        {uploadError && (
          <div className="text-sm text-red-600">
            {uploadError}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={handleCancel}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview Profile Photo
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                type="button"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Image Preview */}
            <div className="mb-4">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={previewUrl}
                  alt="Profile Preview"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="btn-outline flex-1"
                type="button"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
