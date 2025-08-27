# S3 Bucket Image Upload System Documentation

## Overview

This document provides a comprehensive guide to the S3 bucket image upload system implemented in the Dropiti platform. The system is designed for scalable, secure, and organized file management with support for multiple file types, automated fallback mechanisms, and structured folder organization.

## 🏗️ Architecture Overview

### Core Components

1. **S3UploadService** (`src/lib/s3-upload.ts`) - Core upload service with singleton pattern
2. **Upload API** (`src/app/api/v1/upload/route.ts`) - Next.js API route handler
3. **UploadClient** (`src/lib/upload-client.ts`) - Frontend client for API communication
4. **Specialized Services** - Category-specific upload services
5. **React Components** - UI components for file upload interactions

### File Structure
```
src/
├── lib/
│   ├── s3-upload.ts              # Core S3 upload service
│   ├── upload-client.ts          # Frontend API client
│   └── utils.ts                  # Helper functions (image validation)
├── app/api/v1/upload/
│   └── route.ts                  # API endpoint for uploads
└── components/
    ├── common/
    │   └── ProfilePhotoUpload.tsx # Profile photo upload component
    └── dashboard/property-sections/
        └── PhotosSection.tsx      # Property photo upload component
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# S3 Bucket Configuration
S3_BUCKET_NAME=your-s3-bucket-name
S3_BUCKET_ACCESS_KEY=your-s3-access-key
S3_BUCKET_SECRET_KEY=your-s3-secret-key
S3_BUCKET_AWS_REGION=ap-northeast-2  # Seoul region
S3_BUCKET_DOMAIN_URL=https://your-domain.com

# Optional: Upload method preference
UPLOAD_METHOD=direct  # or 'presigned'
```

### AWS S3 Configuration

```javascript
// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.S3_BUCKET_AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_BUCKET_SECRET_KEY || '',
  },
});
```

## 📁 File Organization Structure

### Automated Folder Structure
```
s3-bucket-name/
└── dropiti_uploads/
    ├── images/
    │   ├── 2024/
    │   │   ├── 01/     # January
    │   │   ├── 02/     # February
    │   │   └── ...
    │   └── 2025/
    │       ├── 01/
    │       └── ...
    ├── documents/
    │   ├── 2024/
    │   └── 2025/
    ├── videos/
    ├── audio/
    └── other/
```

### File Naming Convention
```
Format: {baseName}_{timestamp}_{randomString}.{extension}
Example: profile_photo_1640995200000_abc123def456.jpg
```

## 🛠️ Core Implementation

### 1. S3UploadService Class

```typescript
export class S3UploadService {
  private static instance: S3UploadService;
  
  // Singleton pattern
  static getInstance(): S3UploadService {
    if (!S3UploadService.instance) {
      S3UploadService.instance = new S3UploadService();
    }
    return S3UploadService.instance;
  }
  
  // Core upload method
  async uploadFile(file: File, category: FileCategory = 'images'): Promise<S3UploadResponse>
  
  // Batch upload
  async uploadFiles(files: File[], category: FileCategory = 'images'): Promise<S3UploadResponse[]>
  
  // Upload with fallback mechanism
  async uploadFileWithFallback(file: File, category: FileCategory = 'images'): Promise<S3UploadResponse>
  
  // Presigned URL generation
  async generatePresignedUrl(filename: string, category: FileCategory, contentType: string)
  
  // File deletion
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }>
  
  // File validation
  validateFile(file: File, category: FileCategory): { valid: boolean; errors: string[] }
}
```

### 2. File Categories and Types

```typescript
export type FileCategory = 'images' | 'documents' | 'videos' | 'audio' | 'other';

// Upload response interface
export interface S3UploadResponse {
  success: boolean;
  data?: {
    url: string;           // Public URL of uploaded file
    key: string;           // S3 object key
    filename: string;      // Original filename
    size: number;          // File size in bytes
    type: string;          // MIME type
    uploadedAt: string;    // ISO timestamp
  };
  error?: string;
}
```

### 3. Upload Methods

#### Direct Upload
```typescript
// Convert File to Buffer for S3 upload
const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

// Create upload command
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

// Execute upload
await s3Client.send(uploadCommand);
```

#### Presigned URL Upload (Fallback)
```typescript
// Generate presigned URL
const presignedUrl = await getSignedUrl(s3Client, uploadCommand, { expiresIn: 3600 });

// Upload using fetch
const uploadResponse = await fetch(presignedUrl, {
  method: 'PUT',
  body: buffer,
  headers: {
    'Content-Type': file.type,
  },
});
```

## 🔄 API Endpoints

### POST /api/v1/upload

**Purpose**: Upload files to S3 bucket

**Request Format**:
```typescript
// FormData
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('category', 'images');
formData.append('uploadType', 'direct'); // or 'presigned'
```

**Response Format**:
```typescript
{
  success: true,
  data: {
    uploadedFiles: [
      {
        url: "https://domain.com/dropiti_uploads/images/2024/01/file.jpg",
        key: "dropiti_uploads/images/2024/01/file.jpg",
        filename: "original_name.jpg",
        size: 1024000,
        type: "image/jpeg",
        uploadedAt: "2024-01-15T10:30:00.000Z"
      }
    ],
    totalFiles: 1,
    successfulUploads: 1,
    category: "images",
    uploadType: "direct"
  },
  message: "Files uploaded successfully"
}
```

### GET /api/v1/upload

**Purpose**: Generate presigned URLs for client-side uploads

**Query Parameters**:
- `filename`: Original filename
- `category`: File category (default: 'images')
- `contentType`: MIME type (default: 'application/octet-stream')

**Response**:
```typescript
{
  success: true,
  data: {
    url: "https://s3.amazonaws.com/bucket/presigned-url",
    key: "dropiti_uploads/images/2024/01/unique_filename.jpg"
  },
  message: "Presigned URL generated successfully"
}
```

## 🎯 Specialized Upload Services

### 1. Property Photo Service
```typescript
export const propertyPhotoService = {
  async uploadPhotos(files: File[]): Promise<S3UploadResponse[]>
  
  validatePhotos(files: File[]): { valid: boolean; errors: string[] }
  // Validation rules:
  // - Maximum 10 photos
  // - Images only
  // - Size limits
}
```

### 2. Profile Photo Service
```typescript
export const profilePhotoService = {
  async uploadProfilePhoto(file: File): Promise<S3UploadResponse>
  
  validateProfilePhoto(file: File): { valid: boolean; errors: string[] }
  // Validation rules:
  // - Maximum 5MB
  // - JPEG, PNG, WebP only
  // - Image files only
}
```

### 3. Document Upload Service
```typescript
export const documentUploadService = {
  async uploadDocuments(files: File[]): Promise<S3UploadResponse[]>
  
  validateDocuments(files: File[]): { valid: boolean; errors: string[] }
  // Validation rules:
  // - PDF, Word documents, text files
  // - Size limits per category
}
```

## 🎨 Frontend Integration

### Upload Client Usage

```typescript
import { uploadClient } from '@/lib/upload-client';

// Upload property photos
const result = await uploadClient.uploadPropertyPhotos(files);

// Upload single file
const result = await uploadClient.uploadFile(file, 'images');

// Upload with custom category
const result = await uploadClient.uploadFiles(files, 'documents');
```

### React Component Example

```typescript
const handleUpload = async () => {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('category', 'images');
  formData.append('uploadType', 'direct');

  const response = await fetch('/api/v1/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  
  if (result.success) {
    const uploadedFile = result.data.uploadedFiles[0];
    onImageUpload(uploadedFile.url);
  }
};
```

## 🔐 Security Features

### 1. File Validation
- **File type checking**: MIME type validation per category
- **Size limits**: Configurable per file type
- **Extension validation**: Whitelist of allowed extensions
- **Content validation**: Additional security checks

### 2. Access Control
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::bucket-name/dropiti_uploads/*"
    }
  ]
}
```

### 3. Metadata Storage
```typescript
Metadata: {
  originalName: file.name,
  uploadedAt: new Date().toISOString(),
  category: category,
  uploadedBy: userId, // If available
}
```

## 🚀 Error Handling & Fallback

### Automatic Fallback Mechanism
```typescript
async uploadFileWithFallback(file: File, category: FileCategory): Promise<S3UploadResponse> {
  try {
    // Try direct upload first
    const directResult = await this.uploadFile(file, category);
    if (directResult.success) return directResult;
    
    // Fall back to presigned URL if access issues
    if (directResult.error?.includes('access')) {
      return await this.uploadFileViaPresignedUrl(file, category);
    }
    
    return directResult;
  } catch (error) {
    return {
      success: false,
      error: 'All upload methods failed'
    };
  }
}
```

### Error Types and Handling
- **AllAccessDisabled**: Bucket policy issues
- **AccessDenied**: IAM permission problems
- **NoSuchBucket**: Bucket doesn't exist
- **InvalidAccessKeyId**: Wrong access key
- **SignatureDoesNotMatch**: Wrong secret key

## 📊 Usage Examples

### Property Photos
```typescript
// Multiple property photos
const propertyFiles = [file1, file2, file3];
const results = await propertyPhotoService.uploadPhotos(propertyFiles);

// Handle results
results.forEach(result => {
  if (result.success) {
    propertyImageUrls.push(result.data.url);
  } else {
    console.error('Upload failed:', result.error);
  }
});
```

### Profile Photo
```typescript
// Single profile photo
const profileFile = selectedFile;
const result = await profilePhotoService.uploadProfilePhoto(profileFile);

if (result.success) {
  updateUserProfile({ avatar: result.data.url });
} else {
  showError(result.error);
}
```

### Document Upload
```typescript
// Document files
const documents = [pdfFile, docFile];
const results = await documentUploadService.uploadDocuments(documents);

// Process successful uploads
const uploadedDocs = results
  .filter(r => r.success)
  .map(r => ({
    name: r.data.filename,
    url: r.data.url,
    size: r.data.size
  }));
```

## 🔍 Image URL Validation

### Safe Image URL Helper
```typescript
export const getSafeProfileImage = (imageUrl?: string | null, fallbackUrl?: string): string => {
  if (!imageUrl) return fallbackUrl || '/images/Portrait_Placeholder.png';
  
  // Validate URL and check allowed hostnames
  const allowedHostnames = [
    's3.amazonaws.com',
    '*.amazonaws.com',
    'storage.googleapis.com',
    'firebasestorage.googleapis.com',
    // Custom domain patterns
  ];
  
  // Return safe URL or fallback
  return isValidImageUrl(imageUrl) ? imageUrl : fallbackUrl;
};
```

## 📈 Performance Optimizations

### 1. Batch Uploads
```typescript
// Upload multiple files concurrently
const uploadPromises = files.map(file => uploadFile(file, category));
const results = await Promise.all(uploadPromises);
```

### 2. Progress Tracking
```typescript
// For large files, use presigned URLs with progress
const uploadWithProgress = async (file: File, onProgress: (percent: number) => void) => {
  // Implementation with progress callbacks
};
```

### 3. Image Optimization
- **Format conversion**: WebP for modern browsers
- **Compression**: Quality settings per use case
- **Responsive sizes**: Multiple image variants

## 🔧 Configuration & Setup

### 1. AWS S3 Bucket Setup
1. Create S3 bucket in preferred region
2. Configure bucket policy for public read access
3. Set up CORS configuration for web uploads
4. Create IAM user with appropriate permissions

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Update with your S3 credentials
S3_BUCKET_NAME=your-bucket-name
S3_BUCKET_ACCESS_KEY=AKIA...
S3_BUCKET_SECRET_KEY=your-secret-key
S3_BUCKET_AWS_REGION=ap-northeast-2
S3_BUCKET_DOMAIN_URL=https://your-domain.com
```

### 3. Next.js Configuration
```javascript
// next.config.js - Image domains configuration
module.exports = {
  images: {
    domains: [
      's3.amazonaws.com',
      'your-bucket-name.s3.amazonaws.com',
      'your-custom-domain.com'
    ],
  },
};
```

## 📋 Implementation Checklist

- [ ] **Environment Variables**: Set up all required S3 credentials
- [ ] **AWS Configuration**: Create bucket, IAM user, and policies
- [ ] **Install Dependencies**: AWS SDK packages
- [ ] **API Routes**: Implement upload endpoints
- [ ] **Frontend Client**: Set up upload client service
- [ ] **Validation**: Implement file type and size validation
- [ ] **Error Handling**: Add comprehensive error handling
- [ ] **Fallback Mechanism**: Implement presigned URL fallback
- [ ] **Security**: Configure proper IAM permissions
- [ ] **Testing**: Test upload, validation, and error scenarios

## 🚨 Common Issues & Solutions

### 1. Access Denied Errors
**Problem**: S3 bucket access denied
**Solution**: Check IAM permissions and bucket policy

### 2. CORS Issues
**Problem**: Browser blocking uploads
**Solution**: Configure CORS in S3 bucket settings

### 3. Large File Uploads
**Problem**: Timeouts on large files
**Solution**: Use presigned URLs for client-side uploads

### 4. Region Mismatch
**Problem**: Bucket not found
**Solution**: Ensure region matches environment variable

## 📚 Additional Resources

- [AWS S3 JavaScript SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [S3 Bucket Policies Guide](https://docs.aws.amazon.com/s3/latest/userguide/bucket-policies.html)
- [Next.js File Upload Best Practices](https://nextjs.org/docs/api-routes/request-helpers)
- [React File Upload Patterns](https://react.dev/learn/synchronizing-with-effects)

## 🔄 Migration Guide

### From Other Upload Systems

1. **Update environment variables** to match S3 configuration
2. **Replace upload functions** with S3UploadService methods
3. **Update API endpoints** to use new upload routes
4. **Migrate existing files** to S3 bucket structure
5. **Update image URLs** in database to S3 URLs

### Database Schema Updates
```sql
-- Update image URL columns to support S3 URLs
ALTER TABLE users 
ADD COLUMN avatar_s3_key VARCHAR(255),
ADD COLUMN avatar_s3_url VARCHAR(500);

ALTER TABLE properties 
ADD COLUMN images_s3_keys JSON,
ADD COLUMN images_s3_urls JSON;
```

This documentation provides a complete reference for implementing and maintaining the S3 bucket image upload system. The modular design allows for easy customization and extension for different file types and use cases.
