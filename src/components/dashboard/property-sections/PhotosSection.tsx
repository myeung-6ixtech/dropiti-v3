'use client';

import { PencilIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PropertyData } from '@/types/property';
import Image from 'next/image';
import { useState } from 'react';

interface PhotosSectionProps {
  data: PropertyData;
  tempData: Partial<PropertyData>;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onUpdateField: (section: string, field: string, value: unknown) => void;
  errors: Record<string, string>;
  isSaving: boolean;
}

export function PhotosSection({
  data,
  tempData,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onUpdateField,
  errors,
  isSaving
}: PhotosSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    const currentPhotos = tempData.photos || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    onUpdateField('photos', 'photos', newPhotos);
  };

  const handleSave = () => {
    // For now, we'll just save the existing photos
    // In a real implementation, you'd upload the new files and get URLs
    onSaveEdit();
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
        <div className="space-y-4">
          {/* Existing Photos */}
          {tempData.photos && tempData.photos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Photos</label>
              <div className="grid grid-cols-3 gap-4">
                {tempData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {typeof photo === 'string' ? (
                        <Image
                          src={photo}
                          alt={`Property photo ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeExistingPhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add New Photos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <PlusIcon className="h-8 w-8 text-gray-400" />
                <span className="text-gray-600">Click to upload photos</span>
                <span className="text-sm text-gray-500">PNG, JPG up to 10MB</span>
              </label>
            </div>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Photos to Upload</label>
              <div className="grid grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                      {file.name}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {data.photos && data.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {data.photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {typeof photo === 'string' ? (
                    <Image
                      src={photo}
                      alt={`Property photo ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
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
