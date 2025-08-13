// ========================================
// S3 UPLOAD SERVICE
// ========================================

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.S3_BUCKET_AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_BUCKET_SECRET_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-bucket-name';
const DOMAIN_URL = process.env.S3_BUCKET_DOMAIN_URL || 'https://your-domain.com';

// File type categories
export type FileCategory = 'images' | 'documents' | 'videos' | 'audio' | 'other';

// Upload response interface
export interface S3UploadResponse {
  success: boolean;
  data?: {
    url: string;
    key: string;
    filename: string;
    size: number;
    type: string;
    uploadedAt: string;
  };
  error?: string;
}

// File metadata interface
export interface FileMetadata {
  originalName: string;
  size: number;
  type: string;
  category: FileCategory;
}

export class S3UploadService {
  private static instance: S3UploadService;

  static getInstance(): S3UploadService {
    if (!S3UploadService.instance) {
      S3UploadService.instance = new S3UploadService();
    }
    return S3UploadService.instance;
  }

  /**
   * Generate organized file path based on category, year, and month
   * Format: dropiti_uploads/{category}/{year}/{month}/{filename}
   */
  private generateFilePath(category: FileCategory, filename: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Generate unique filename to prevent conflicts
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = filename.split('.').pop();
    const baseName = filename.replace(/\.[^/.]+$/, '');
    
    const uniqueFilename = `${baseName}_${timestamp}_${randomString}.${fileExtension}`;
    
    return `dropiti_uploads/${category}/${year}/${month}/${uniqueFilename}`;
  }

  /**
   * Upload a single file to S3
   */
  async uploadFile(
    file: File, 
    category: FileCategory = 'images'
  ): Promise<S3UploadResponse> {
    try {
      const filePath = this.generateFilePath(category, file.name);
      
      console.log('S3 Upload: Starting upload for file:', file.name);
      console.log('S3 Upload: Bucket:', BUCKET_NAME);
      console.log('S3 Upload: Key:', filePath);
      console.log('S3 Upload: File size:', file.size);
      console.log('S3 Upload: File type:', file.type);
      
      // Convert File to Buffer for S3 upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Create the upload command
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          category: category,
        },
      });

      console.log('S3 Upload: Sending upload command...');
      
      // Upload the file
      await s3Client.send(uploadCommand);

      console.log('S3 Upload: File uploaded successfully');

      // Generate the public URL
      const publicUrl = `${DOMAIN_URL}/${filePath}`;

      return {
        success: true,
        data: {
          url: publicUrl,
          key: filePath,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      
      // Provide more detailed error information
      let errorMessage = 'Upload failed';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific S3 error types
        if (error.name === 'AllAccessDisabled') {
          errorMessage = 'S3 bucket access is disabled. Please check bucket permissions and policies.';
        } else if (error.name === 'AccessDenied') {
          errorMessage = 'Access denied to S3 bucket. Please check IAM permissions.';
        } else if (error.name === 'NoSuchBucket') {
          errorMessage = 'S3 bucket does not exist. Please check bucket name.';
        } else if (error.name === 'InvalidAccessKeyId') {
          errorMessage = 'Invalid AWS access key. Please check credentials.';
        } else if (error.name === 'SignatureDoesNotMatch') {
          errorMessage = 'Invalid AWS secret key. Please check credentials.';
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadFiles(
    files: File[], 
    category: FileCategory = 'images'
  ): Promise<S3UploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, category));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(deleteCommand);
      return { success: true };
    } catch (error) {
      console.error('S3 delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Generate a presigned URL for direct upload (useful for large files)
   */
  async generatePresignedUrl(
    filename: string,
    category: FileCategory = 'images',
    contentType: string
  ): Promise<{ success: boolean; data?: { url: string; key: string }; error?: string }> {
    try {
      const filePath = this.generateFilePath(category, filename);
      
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
        ContentType: contentType,
      });

      const presignedUrl = await getSignedUrl(s3Client, uploadCommand, { expiresIn: 3600 });

      return {
        success: true,
        data: {
          url: presignedUrl,
          key: filePath,
        },
      };
    } catch (error) {
      console.error('Presigned URL generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate presigned URL',
      };
    }
  }

  /**
   * Get the public URL for a file
   */
  getPublicUrl(key: string): string {
    return `${DOMAIN_URL}/${key}`;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, category: FileCategory): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB default

    // Size validation
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Type validation based on category
    switch (category) {
      case 'images':
        if (!file.type.startsWith('image/')) {
          errors.push('File must be an image');
        }
        break;
      case 'documents':
        if (!file.type.includes('pdf') && !file.type.includes('document') && !file.type.includes('text')) {
          errors.push('File must be a document (PDF, Word, etc.)');
        }
        break;
      case 'videos':
        if (!file.type.startsWith('video/')) {
          errors.push('File must be a video');
        }
        break;
      case 'audio':
        if (!file.type.startsWith('audio/')) {
          errors.push('File must be an audio file');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Upload a single file to S3 with fallback to presigned URL
   */
  async uploadFileWithFallback(
    file: File, 
    category: FileCategory = 'images'
  ): Promise<S3UploadResponse> {
    try {
      // Try direct upload first
      console.log('S3 Upload: Attempting direct upload...');
      const directUploadResult = await this.uploadFile(file, category);
      
      if (directUploadResult.success) {
        console.log('S3 Upload: Direct upload successful');
        return directUploadResult;
      }
      
      // If direct upload fails with access issues, try presigned URL
      if (directUploadResult.error && 
          (directUploadResult.error.includes('access') || 
           directUploadResult.error.includes('disabled') ||
           directUploadResult.error.includes('denied'))) {
        
        console.log('S3 Upload: Direct upload failed, trying presigned URL...');
        return await this.uploadFileViaPresignedUrl(file, category);
      }
      
      // Return the original error if it's not an access issue
      return directUploadResult;
      
    } catch (error) {
      console.error('S3 Upload: Both direct and presigned upload failed:', error);
      return {
        success: false,
        error: 'All upload methods failed. Please check S3 configuration.',
      };
    }
  }

  /**
   * Upload file using presigned URL as fallback
   */
  private async uploadFileViaPresignedUrl(
    file: File, 
    category: FileCategory
  ): Promise<S3UploadResponse> {
    try {
      console.log('S3 Upload: Generating presigned URL for:', file.name);
      
      // Generate presigned URL
      const presignedResult = await this.generatePresignedUrl(
        file.name,
        category,
        file.type
      );
      
      if (!presignedResult.success || !presignedResult.data) {
        throw new Error('Failed to generate presigned URL');
      }
      
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Upload using presigned URL
      const uploadResponse = await fetch(presignedResult.data.url, {
        method: 'PUT',
        body: buffer,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Presigned upload failed: ${uploadResponse.statusText}`);
      }
      
      console.log('S3 Upload: Presigned upload successful');
      
      // Generate the public URL
      const publicUrl = `${DOMAIN_URL}/${presignedResult.data.key}`;
      
      return {
        success: true,
        data: {
          url: publicUrl,
          key: presignedResult.data.key,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
      };
      
    } catch (error) {
      console.error('S3 Upload: Presigned upload failed:', error);
      return {
        success: false,
        error: `Presigned upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Export singleton instance
export const s3UploadService = S3UploadService.getInstance();

// ========================================
// SPECIALIZED UPLOAD SERVICES
// ========================================

// Property photo upload service
export const propertyPhotoService = {
  async uploadPhotos(files: File[]): Promise<S3UploadResponse[]> {
    // Use fallback method for better reliability
    const uploadPromises = files.map(file => s3UploadService.uploadFileWithFallback(file, 'images'));
    return Promise.all(uploadPromises);
  },

  validatePhotos(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (files.length === 0) {
      errors.push('At least one photo is required');
    }
    
    if (files.length > 20) {
      errors.push('Maximum 20 photos allowed');
    }
    
    for (const file of files) {
      const validation = s3UploadService.validateFile(file, 'images');
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// Document upload service
export const documentUploadService = {
  async uploadDocuments(files: File[]): Promise<S3UploadResponse[]> {
    return s3UploadService.uploadFiles(files, 'documents');
  },

  validateDocuments(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const file of files) {
      const validation = s3UploadService.validateFile(file, 'documents');
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// Generic file upload service
export const genericUploadService = {
  async uploadFiles(files: File[], category: FileCategory): Promise<S3UploadResponse[]> {
    return s3UploadService.uploadFiles(files, category);
  },

  validateFiles(files: File[], category: FileCategory): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const file of files) {
      const validation = s3UploadService.validateFile(file, category);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// Profile photo upload service
export const profilePhotoService = {
  async uploadProfilePhoto(file: File): Promise<S3UploadResponse> {
    // Use fallback method for better reliability
    return s3UploadService.uploadFileWithFallback(file, 'images');
  },

  validateProfilePhoto(file: File): { valid: boolean; errors: string[] } {
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
  },
};
