// ========================================
// FILE UPLOAD SERVICE
// ========================================

import type { FileUploadResponse } from '@/types';

// Internal upload tracking interface
interface InternalUpload {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export class FileUploadService {
  private static instance: FileUploadService;
  private uploads: Map<string, InternalUpload> = new Map();

  static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  // Upload a single file
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const uploadId = this.generateUploadId();
    
    // Create upload record
    const upload: InternalUpload = {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading',
    };

    this.uploads.set(uploadId, upload);

    try {
      // Simulate file upload process
      await this.simulateUpload(uploadId);
      
      // For now, create a temporary URL (in production, this would be a real file URL)
      const temporaryUrl = URL.createObjectURL(file);
      
      // Update upload status
      upload.status = 'success';
      upload.progress = 100;
      
      return {
        success: true,
        data: {
          id: uploadId,
          url: temporaryUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      upload.status = 'error';
      upload.error = error instanceof Error ? error.message : 'Upload failed';
      
      return {
        success: false,
        data: {
          id: uploadId,
          url: '',
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
        error: upload.error,
      };
    }
  }

  // Upload multiple files
  async uploadFiles(files: File[]): Promise<FileUploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  // Get upload progress
  getUploadProgress(uploadId: string): number {
    const upload = this.uploads.get(uploadId);
    return upload?.progress || 0;
  }

  // Get upload status
  getUploadStatus(uploadId: string): InternalUpload['status'] {
    const upload = this.uploads.get(uploadId);
    return upload?.status || 'uploading';
  }

  // Cancel upload
  cancelUpload(uploadId: string): boolean {
    const upload = this.uploads.get(uploadId);
    if (upload && upload.status === 'uploading') {
      upload.status = 'error';
      upload.error = 'Upload cancelled';
      return true;
    }
    return false;
  }

  // Clean up temporary URLs
  cleanupTemporaryUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // Private methods
  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateUpload(uploadId: string): Promise<void> {
    const upload = this.uploads.get(uploadId);
    if (!upload) return;

    // Simulate progress updates
    for (let i = 0; i <= 100; i += 10) {
      upload.progress = i;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Export singleton instance
export const fileUploadService = FileUploadService.getInstance();

// ========================================
// PROPERTY PHOTO UPLOAD HELPERS
// ========================================

export const propertyPhotoService = {
  // Upload property photos
  async uploadPropertyPhotos(files: File[]): Promise<string[]> {
    try {
      const uploads = await fileUploadService.uploadFiles(files);
      const urls: string[] = [];
      
      for (const upload of uploads) {
        if (upload.success && upload.data) {
          urls.push(upload.data.url);
        } else {
          console.error('Failed to upload file:', upload.error);
        }
      }
      
      return urls;
    } catch (error) {
      console.error('Error uploading property photos:', error);
      throw new Error('Failed to upload property photos');
    }
  },

  // Validate photo files
  validatePhotos(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (files.length === 0) {
      errors.push('At least one photo is required');
    }
    
    if (files.length > 10) {
      errors.push('Maximum 10 photos allowed');
    }
    
    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large. Maximum size is 10MB`);
      }
      
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} is not a supported image format. Use JPEG, PNG, or WebP`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Generate thumbnail URLs for preview
  generateThumbnails(files: File[]): string[] {
    return files.map(file => URL.createObjectURL(file));
  },

  // Clean up thumbnail URLs
  cleanupThumbnails(urls: string[]): void {
    urls.forEach(url => fileUploadService.cleanupTemporaryUrl(url));
  },
};
