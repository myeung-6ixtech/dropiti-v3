'use client';

import { useState, useRef, useCallback } from 'react';
import { PencilIcon, PhotoIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';
import Image from 'next/image';

interface UploadedFile {
  url: string;
  key: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface PhotosSectionProps {
  data: PropertyData;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onUpdateField: (section: string, field: string, value: unknown) => void;
  errors: Record<string, string>;
  isSaving: boolean;
  // NEW: Add these props for handling photo API calls
  propertyId: string;
  onPhotoSaveSuccess?: () => void;
  onPhotoSaveError?: (error: string) => void;
}

export function PhotosSection({
  data,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onUpdateField,
  errors,
  isSaving,
  propertyId,
  onPhotoSaveSuccess,
  onPhotoSaveError
}: PhotosSectionProps) {
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get all existing photos (combining display_image and uploaded_images)
  const getExistingPhotos = () => {
    const photos: string[] = [];
    
    // Add display image if it exists
    if (data.displayImage && typeof data.displayImage === 'string') {
      photos.push(data.displayImage);
    }
    
    // Add uploaded images if they exist
    if (data.uploadedImages && Array.isArray(data.uploadedImages)) {
      photos.push(...data.uploadedImages);
    }
    
    // Also check the photos field for backward compatibility
    if (data.photos && Array.isArray(data.photos)) {
      data.photos.forEach(photo => {
        if (typeof photo === 'string' && !photos.includes(photo)) {
          photos.push(photo);
        }
      });
    }
    
    return photos;
  };

  const existingPhotos = getExistingPhotos();

  const handleFileSelect = useCallback((files: FileList) => {
    const newPhotos = Array.from(files).filter(file => 
      file.type.startsWith('image/') && !selectedFiles.find(p => p.name === file.name)
    );
    
    if (newPhotos.length > 0) {
      setSelectedFiles(prev => [...prev, ...newPhotos]);
    }
  }, [selectedFiles]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    const currentPhotos = getExistingPhotos();
    const photoToRemove = currentPhotos[index];
    
    // Remove from displayImage if it matches
    if (data.displayImage === photoToRemove) {
      // If removing the display image, set it to the next available photo or empty
      const remainingPhotos = currentPhotos.filter((_, i) => i !== index);
      const newDisplayImage = remainingPhotos.length > 0 ? remainingPhotos[0] : '';
      onUpdateField('', 'displayImage', newDisplayImage);
    }
    
    // Remove from uploadedImages if it matches
    if (data.uploadedImages && data.uploadedImages.includes(photoToRemove)) {
      const newUploadedImages = data.uploadedImages.filter(img => img !== photoToRemove);
      onUpdateField('', 'uploadedImages', newUploadedImages);
    }
    
    // Also update the photos field for backward compatibility
    if (data.photos && Array.isArray(data.photos)) {
      const newPhotos = data.photos.filter(photo => {
        if (typeof photo === 'string') {
          return photo !== photoToRemove;
        }
        return true;
      });
      onUpdateField('', 'photos', newPhotos);
    }
  };

  const handleSave = async () => {
    try {      
      // If there are new files to upload, handle S3 upload here
      if (selectedFiles.length > 0) {
        
        // Create FormData for the upload API
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        formData.append('category', 'images');
        formData.append('uploadType', 'direct');

        // Upload files to S3
        const uploadResponse = await fetch('/api/v1/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload photos');
        }

        const uploadResult: { success: boolean; data?: { uploadedFiles: UploadedFile[] }; error?: string } = await uploadResponse.json();
        
        if (uploadResult.success && uploadResult.data?.uploadedFiles) {
          // Get the URLs of uploaded files
          const uploadedUrls = uploadResult.data.uploadedFiles.map((file: UploadedFile) => file.url);        
          // Update the property data with new photo URLs
          const currentUploadedImages = data.uploadedImages || [];
          const newUploadedImages = [...currentUploadedImages, ...uploadedUrls];
          
          // Update the uploadedImages field - this is a top-level field
          onUpdateField('', 'uploadedImages', newUploadedImages);
          
          // Update the displayImage field to the first photo if it's empty - this is also a top-level field
          if (!data.displayImage && uploadedUrls.length > 0) {
            onUpdateField('', 'displayImage', uploadedUrls[0]);
          }
          
          // Clear selected files after successful upload
          setSelectedFiles([]);
          
          // NEW: Call property update API directly
          const propertyUpdateData = {
            display_image: data.displayImage || uploadedUrls[0],
            uploaded_images: newUploadedImages,
            photos: newUploadedImages, // backward compatibility
          };
                  
          try {
            const propertyResponse = await fetch(`/api/v1/properties/update-property`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: propertyId,
                updates: propertyUpdateData
              }),
            });
            
            if (!propertyResponse.ok) {
              const errorText = await propertyResponse.text();
              throw new Error(`Failed to update property photos: ${propertyResponse.status} - ${errorText}`);
            }
            
            const propertyResult = await propertyResponse.json();
            
            if (propertyResult.success) {
              onPhotoSaveSuccess?.();
              // Exit editing mode
              onSaveEdit();
            } else {
              throw new Error(propertyResult.error || 'Failed to save photos');
            }
          } catch (propertyError) {
            console.error('Error updating property photos:', propertyError);
            const errorMessage = propertyError instanceof Error ? propertyError.message : 'Failed to update property photos';
            onPhotoSaveError?.(errorMessage);
            // Don't exit editing mode on error
            return;
          }
          
          return; // Don't call onSaveEdit immediately
        } else {
          throw new Error(uploadResult.error || 'Upload failed');
        }
      } else {
        console.log('PhotosSection: No new files to upload');
        // If no new files, just exit editing mode
        onSaveEdit();
      }
    } catch (error) {
      console.error('Error saving photos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save photos';
      onPhotoSaveError?.(errorMessage);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Property Photos</h2>
        {!isEditing ? (
          <button
            onClick={onStartEdit}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button onClick={onCancelEdit} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="btn-primary">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Photos</label>
              <div className="grid grid-cols-3 gap-4">
                {existingPhotos.map((photoUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={photoUrl}
                        alt={`Property photo ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeExistingPhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove photo"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                      Photo {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add New Photos</label>
            
            {/* Upload Area */}
            {selectedFiles.length === 0 && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-lg font-medium text-gray-900">
                    Drag and drop your photos here
                  </p>
                  <p className="text-gray-500 mt-1">
                    or click to browse files
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            )}

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    New Photos ({selectedFiles.length})
                  </h4>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <PhotoIcon className="h-4 w-4 mr-1" />
                    Add More Photos
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Photo ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Status Overlay */}
                      <div className="absolute top-2 left-2 flex items-center space-x-2 bg-white bg-opacity-90 rounded-full px-2 py-1">
                        <span className="text-xs font-medium text-gray-700">
                          Ready to Upload
                        </span>
                      </div>
                      
                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => removeSelectedFile(index)}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                            {file.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">
                      {selectedFiles.length} photos ready for upload
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Photo Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Photo Guidelines</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Upload high-quality photos (minimum 1024x768 pixels)</li>
              <li>• Include photos of all major rooms and areas</li>
              <li>• Make sure photos are well-lit and clean</li>
              <li>• Avoid blurry or dark images</li>
              <li>• Maximum 10 photos allowed</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {existingPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {existingPhotos.map((photoUrl, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={photoUrl}
                    alt={`Property photo ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
              <p>No photos uploaded yet</p>
            </div>
          )}
        </div>
      )}

      {errors.photos && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.photos}</p>
        </div>
      )}
    </div>
  );
}