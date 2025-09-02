# S3 Upload Setup Guide

## Overview

This guide explains how to set up and configure the S3 upload functionality for the Dropiti platform. The system organizes all uploads into a structured folder hierarchy based on file type, year, and month.

## Folder Structure

All uploads are organized in the following structure:
```
DOMAIN_URL/dropiti_uploads/
├── images/
│   ├── 2024/
│   │   ├── 01/ (January)
│   │   ├── 02/ (February)
│   │   └── ...
│   └── 2025/
│       ├── 01/ (January)
│       └── ...
├── documents/
│   ├── 2024/
│   │   ├── 01/
│   │   └── ...
│   └── 2025/
│       └── ...
├── videos/
├── audio/
└── other/
```

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# S3 Bucket Configuration
S3_BUCKET_NAME=your-s3-bucket-name
S3_BUCKET_ACCESS_KEY=your-s3-access-key
S3_BUCKET_SECRET_KEY=your-s3-secret-key

# AWS Region (optional, defaults to us-east-1)
NEXT_PUBLIC_AWS_REGION=us-east-1

# Domain URL for generating public URLs
NEXT_PUBLIC_DOMAIN_URL=https://your-domain.com
```

## S3 Bucket Setup

### 1. Create S3 Bucket
1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name
4. Select your preferred region
5. Keep default settings for versioning and encryption

### 2. Configure Bucket Permissions
Create a bucket policy that allows public read access for uploaded files:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/dropiti_uploads/*"
        }
    ]
}
```

### 3. Configure CORS (if needed)
If you plan to upload directly from the frontend, add CORS configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 4. Create IAM User
1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/dropiti_uploads/*"
        }
    ]
}
```

## Usage Examples

### Upload Property Photos
```typescript
import { uploadService } from '@/lib/upload-client';

// Upload multiple photos
const response = await uploadService.uploadPropertyPhotos(photoFiles);

if (response.success) {
  console.log('Uploaded files:', response.data?.uploadedFiles);
}
```

### Upload Documents
```typescript
// Upload documents
const response = await uploadService.uploadDocuments(documentFiles);
```

### Upload Any File Type
```typescript
// Upload with custom category
const response = await uploadService.uploadFiles(files, 'videos');
```

## API Endpoints

### POST /api/v1/upload
Upload files to S3 through the backend.

**Request:**
- `files`: Array of files
- `category`: File category (images, documents, videos, audio, other)
- `uploadType`: Upload method (direct, presigned)

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadedFiles": [
      {
        "url": "https://domain.com/dropiti_uploads/images/2025/01/photo_123.jpg",
        "key": "dropiti_uploads/images/2025/01/photo_123.jpg",
        "filename": "photo.jpg",
        "size": 1024000,
        "type": "image/jpeg",
        "uploadedAt": "2025-01-15T10:30:00Z"
      }
    ],
    "totalFiles": 1,
    "successfulUploads": 1,
    "category": "images",
    "uploadType": "direct"
  }
}
```

### GET /api/v1/upload
Generate presigned URLs for direct S3 upload.

**Query Parameters:**
- `filename`: Name of the file
- `category`: File category
- `contentType`: MIME type of the file

## File Validation

The system automatically validates files based on their category:

### Images
- File types: JPEG, PNG, WebP, GIF
- Max size: 50MB
- Required for property photos

### Documents
- File types: PDF, Word, Text files
- Max size: 50MB
- Suitable for contracts, agreements

### Videos
- File types: MP4, AVI, MOV, etc.
- Max size: 50MB
- For property tours, walkthroughs

### Audio
- File types: MP3, WAV, AAC, etc.
- Max size: 50MB
- For voice notes, descriptions

## Security Features

1. **File Type Validation**: Only allowed file types can be uploaded
2. **Size Limits**: Configurable file size limits per category
3. **Unique Naming**: Files are renamed with timestamps to prevent conflicts
4. **Organized Storage**: Files are organized by type, year, and month
5. **Access Control**: IAM policies control who can upload/delete files

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors**: File type, size, and format validation
- **Upload Errors**: Network issues, S3 errors, permission issues
- **Progress Tracking**: Real-time upload progress for large files
- **Retry Logic**: Automatic retry for failed uploads

## Monitoring and Logging

All upload activities are logged with:
- File metadata (name, size, type)
- Upload timestamps
- Success/failure status
- Error details for debugging

## Best Practices

1. **File Naming**: Use descriptive names for better organization
2. **Batch Uploads**: Upload multiple files together for efficiency
3. **Progress Feedback**: Show upload progress to users
4. **Error Recovery**: Provide clear error messages and retry options
5. **File Cleanup**: Implement cleanup for unused or failed uploads

## Troubleshooting

### Common Issues

1. **Access Denied**: Check IAM permissions and bucket policy
2. **File Too Large**: Verify file size limits in configuration
3. **Invalid File Type**: Ensure file type is supported for the category
4. **Network Errors**: Check internet connection and AWS region settings

### Debug Steps

1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Test S3 bucket permissions with AWS CLI
4. Check API endpoint logs for backend errors

## Future Enhancements

- **Image Processing**: Automatic thumbnail generation and optimization
- **CDN Integration**: CloudFront distribution for faster file delivery
- **Backup Strategy**: Cross-region replication for disaster recovery
- **Analytics**: Upload statistics and usage analytics
- **Advanced Validation**: Virus scanning and content moderation
