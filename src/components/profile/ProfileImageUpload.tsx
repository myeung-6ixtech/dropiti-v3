'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getSafeProfileImage } from '@/lib/utils';

interface ProfileImageUploadProps {
  currentImageUrl: string;
  onImageUpdate: (newImageUrl: string, file?: File) => void;
  disabled?: boolean;
}

export default function ProfileImageUpload({
  currentImageUrl,
  onImageUpdate,
  disabled = false
}: ProfileImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    try {
      setUploadError(null);
      setSelectedFile(file);

      // Create a temporary preview URL
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);

      // Pass the file to parent component for later upload
      onImageUpdate(tempUrl, file);
    } catch (error) {
      console.error('Profile image preview error:', error);
      setUploadError('Failed to preview image');
    }
  };

  const handleRemoveImage = () => {
    if (!disabled) {
      setSelectedFile(null);
      setPreviewUrl(null);
      onImageUpdate('/images/Portrait_Placeholder.png');
    }
  };

  // Use preview URL if available, otherwise use current image URL
  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Image Display */}
      <div className="relative group">
        <div
          className={`relative w-32 h-32 rounded-full overflow-hidden cursor-pointer transition-all duration-200 ${
            disabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80'
          }`}
          onClick={handleImageClick}
        >
          <Image
            src={getSafeProfileImage(displayImageUrl, '/images/Portrait_Placeholder.png')}
            alt="Profile"
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/Portrait_Placeholder.png';
            }}
          />
          
          {/* Upload Overlay */}
          {!disabled && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <CameraIcon className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Remove Image Button */}
        {!disabled && displayImageUrl !== '/images/Portrait_Placeholder.png' && (
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
            title="Remove image"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload Status */}
      {selectedFile && (
        <div className="text-center">
          <div className="text-sm text-blue-600 mb-2">
            <span className="font-medium">Preview:</span> {selectedFile.name}
          </div>
          <p className="text-xs text-gray-500">
            Image will be uploaded when you save changes
          </p>
        </div>
      )}

      {uploadError && (
        <div className="text-sm text-red-600 text-center max-w-xs">
          {uploadError}
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Click on the image to select a new one
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF • Max size: 5MB
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
