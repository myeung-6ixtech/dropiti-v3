// ========================================
// UPLOAD CLIENT - Frontend API Client
// ========================================

export interface UploadResponse {
  success: boolean;
  data?: {
    uploadedFiles: Array<{
      url: string;
      key: string;
      filename: string;
      size: number;
      type: string;
      uploadedAt: string;
    }>;
    totalFiles: number;
    successfulUploads: number;
    category: string;
    uploadType: string;
  };
  message?: string;
  error?: string;
  details?: string[];
}

export interface PresignedUrlResponse {
  success: boolean;
  data?: {
    url: string;
    key: string;
  };
  message?: string;
  error?: string;
}

export class UploadClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1/upload') {
    this.baseUrl = baseUrl;
  }

  /**
   * Upload files directly to S3 through our backend
   */
  async uploadFiles(
    files: File[], 
    category: string = 'images',
    uploadType: string = 'direct'
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      // Add files
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add metadata
      formData.append('category', category);
      formData.append('uploadType', uploadType);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload client error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Get presigned URL for direct S3 upload
   */
  async getPresignedUrl(
    filename: string,
    category: string = 'images',
    contentType: string = 'application/octet-stream'
  ): Promise<PresignedUrlResponse> {
    try {
      const params = new URLSearchParams({
        filename,
        category,
        contentType,
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Presigned URL error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get presigned URL',
      };
    }
  }

  /**
   * Upload a single profile photo
   */
  async uploadProfilePhoto(file: File): Promise<UploadResponse> {
    return this.uploadFiles([file], 'images', 'direct');
  }

  /**
   * Upload a single file
   */
  async uploadFile(
    file: File, 
    category: string = 'images'
  ): Promise<UploadResponse> {
    return this.uploadFiles([file], category);
  }

  /**
   * Upload property photos
   */
  async uploadPropertyPhotos(files: File[]): Promise<UploadResponse> {
    return this.uploadFiles(files, 'images');
  }

  /**
   * Upload documents
   */
  async uploadDocuments(files: File[]): Promise<UploadResponse> {
    return this.uploadFiles(files, 'documents');
  }

  /**
   * Upload videos
   */
  async uploadVideos(files: File[]): Promise<UploadResponse> {
    return this.uploadFiles(files, 'videos');
  }

  /**
   * Upload audio files
   */
  async uploadAudio(files: File[]): Promise<UploadResponse> {
    return this.uploadFiles(files, 'audio');
  }
}

// Export singleton instance
export const uploadClient = new UploadClient();

// Export specialized upload functions
export const uploadService = {
  // Property photos
  uploadPropertyPhotos: (files: File[]) => uploadClient.uploadPropertyPhotos(files),
  
  // Documents
  uploadDocuments: (files: File[]) => uploadClient.uploadDocuments(files),
  
  // Videos
  uploadVideos: (files: File[]) => uploadClient.uploadVideos(files),
  
  // Audio
  uploadAudio: (files: File[]) => uploadClient.uploadAudio(files),
  
  // Generic upload
  uploadFiles: (files: File[], category: string) => uploadClient.uploadFiles(files, category),
  
  // Single file
  uploadFile: (file: File, category: string) => uploadClient.uploadFile(file, category),
  
  // Presigned URLs
  getPresignedUrl: (filename: string, category: string, contentType: string) => 
    uploadClient.getPresignedUrl(filename, category, contentType),
};
