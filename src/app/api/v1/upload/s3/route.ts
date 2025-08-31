import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 Configuration - This runs on the server where env vars are available
const s3Client = new S3Client({
  region: process.env.S3_BUCKET_AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_BUCKET_SECRET_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-bucket-name';
const DOMAIN_URL = process.env.S3_BUCKET_DOMAIN_URL || 'https://your-domain.com';

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const missingVars = [];
    if (!process.env.S3_BUCKET_ACCESS_KEY) missingVars.push('S3_BUCKET_ACCESS_KEY');
    if (!process.env.S3_BUCKET_SECRET_KEY) missingVars.push('S3_BUCKET_SECRET_KEY');
    if (!process.env.S3_BUCKET_NAME) missingVars.push('S3_BUCKET_NAME');
    if (!process.env.S3_BUCKET_AWS_REGION) missingVars.push('S3_BUCKET_AWS_REGION');
    if (!process.env.S3_BUCKET_DOMAIN_URL) missingVars.push('S3_BUCKET_DOMAIN_URL');
    
    if (missingVars.length > 0) {
      console.error('S3 Upload API: Missing environment variables:', missingVars);
      return NextResponse.json({
        success: false,
        error: `S3 configuration is incomplete. Missing: ${missingVars.join(', ')}`
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'images';

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File size exceeds 5MB limit'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed'
      }, { status: 400 });
    }

    // Generate file path
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    
    const uniqueFilename = `${baseName}_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `dropiti_uploads/${category}/${year}/${month}/${uniqueFilename}`;

    // Convert File to Buffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    });

    await s3Client.send(uploadCommand);

    // Generate the public URL
    const publicUrl = `${DOMAIN_URL}/${filePath}`;

    console.log('S3 Upload API: File uploaded successfully:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      url: publicUrl,
      key: filePath
    });

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        key: filePath,
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('S3 Upload API Error:', error);
    
    let errorMessage = 'Upload failed';
    if (error instanceof Error) {
      if (error.name === 'AccessDenied') {
        errorMessage = 'Access denied: Check IAM permissions for S3 bucket access';
      } else if (error.name === 'NoSuchBucket') {
        errorMessage = 'Bucket not found: Check bucket name and region';
      } else if (error.name === 'InvalidAccessKeyId') {
        errorMessage = 'Invalid access key: Check AWS credentials';
      } else if (error.name === 'SignatureDoesNotMatch') {
        errorMessage = 'Invalid secret key: Check AWS credentials';
      } else if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        errorMessage = 'Network error: Check internet connection and AWS region';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
