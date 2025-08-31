'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  PhotoIcon, 
  ArrowUpTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Step6PhotosProps {
  data?: {
    photos?: File[];
  };
  onUpdate: (data: { photos?: File[] }) => void;
}

export default function Step6Photos({ data, onUpdate }: Step6PhotosProps) {
  const [photos, setPhotos] = useState<File[]>(data?.photos || []);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize photos from data if available
  useState(() => {
    if (data?.photos) {
      setPhotos(data.photos);
    }
  });

  const handleFileSelect = useCallback((files: FileList) => {
    const newPhotos = Array.from(files).filter(file => 
      file.type.startsWith('image/') && !photos.find(p => p.name === file.name)
    );
    
    if (newPhotos.length > 0) {
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onUpdate({ photos: updatedPhotos });
    }
  }, [photos, onUpdate]);

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

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onUpdate({ photos: updatedPhotos });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload photos of your property
        </h3>
        <p className="text-gray-600 mb-6">
          High-quality photos help tenants visualize your property. Upload at least 5 photos for the best results. 
          Photos will be automatically uploaded to S3 when you create the listing.
        </p>

        {/* Upload Area */}
        {photos.length === 0 && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-purple-400 bg-purple-50'
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
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Photos ({photos.length})
              </h4>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-3 py-1 text-sm font-medium text-purple-600 hover:text-purple-700"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={`${photo.name}-${index}`} className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      width={400}
                      height={225}
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
                        onClick={() => removePhoto(index)}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                        Photo {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Drag Handle */}
                  {photos.length > 1 && (
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-1 bg-white bg-opacity-80 rounded cursor-move">
                        <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Summary */}
            {photos.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700">
                    {photos.length} photos ready for upload
                  </span>
                  <span className="text-purple-600 font-medium">
                    Photos will be uploaded automatically when you create the listing
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Photo Guidelines */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">Photo Guidelines</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Upload high-quality photos (minimum 1024x768 pixels)</li>
            <li>• Include photos of all major rooms and areas</li>
            <li>• Make sure photos are well-lit and clean</li>
            <li>• Avoid blurry or dark images</li>
            <li>• Maximum 10 photos allowed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
