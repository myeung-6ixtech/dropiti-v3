'use client';

import { useState, useRef } from 'react';
import { 
  PhotoIcon, 
  XMarkIcon,
  ArrowUpTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Step6PhotosProps {
  data?: {
    photos?: File[];
  };
  onUpdate: (data: any) => void;
}

export default function Step6Photos({ data, onUpdate }: Step6PhotosProps) {
  const [photos, setPhotos] = useState<File[]>(data?.photos || []);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList) => {
    const newPhotos = Array.from(files).filter(file => 
      file.type.startsWith('image/') && !photos.find(p => p.name === file.name)
    );
    
    if (newPhotos.length > 0) {
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onUpdate({ photos: updatedPhotos });
    }
  };

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

  const reorderPhotos = (fromIndex: number, toIndex: number) => {
    const updatedPhotos = [...photos];
    const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
    updatedPhotos.splice(toIndex, 0, movedPhoto);
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
        </p>

        {/* Upload Area */}
        {photos.length === 0 && (
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

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Photos ({photos.length})
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay */}
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
          </div>
        )}

        {/* Photo Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Photo Guidelines</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload high-quality photos (minimum 1024x768 pixels)</li>
            <li>• Include photos of all major rooms and areas</li>
            <li>• Make sure photos are well-lit and clean</li>
            <li>• Avoid blurry or dark images</li>
            <li>• Maximum 20 photos allowed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
