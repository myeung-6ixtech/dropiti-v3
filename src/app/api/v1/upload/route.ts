import { NextRequest, NextResponse } from 'next/server';
import { s3UploadService, propertyPhotoService, documentUploadService, genericUploadService, FileCategory } from '@/lib/s3-upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const category = formData.get('category') as FileCategory || 'images';
    const uploadType = formData.get('uploadType') as string || 'direct';

    console.log('Upload API: Received request', {
      fileCount: files.length,
      category,
      uploadType,
    });

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate files based on category
    let validationResult: { valid: boolean; errors: string[] };
    
    switch (category) {
      case 'images':
        validationResult = propertyPhotoService.validatePhotos(files);
        break;
      case 'documents':
        validationResult = documentUploadService.validateDocuments(files);
        break;
      default:
        validationResult = genericUploadService.validateFiles(files, category);
    }

    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: 'File validation failed',
          details: validationResult.errors 
        },
        { status: 400 }
      );
    }

    // Upload files to S3
    let uploadResults;
    
    if (uploadType === 'presigned') {
      // Generate presigned URLs for client-side upload
      const presignedResults = await Promise.all(
        files.map(async (file) => {
          const result = await s3UploadService.generatePresignedUrl(
            file.name,
            category,
            file.type
          );
          return {
            ...result,
            originalFile: file.name,
          };
        })
      );
      
      uploadResults = presignedResults;
    } else {
      // Direct upload to S3
      uploadResults = await s3UploadService.uploadFiles(files, category);
    }

    // Check for upload errors
    const failedUploads = uploadResults.filter(result => !result.success);
    if (failedUploads.length > 0) {
      console.error('Upload API: Some uploads failed:', failedUploads);
      return NextResponse.json(
        { 
          error: 'Some files failed to upload',
          failedUploads: failedUploads.map(upload => {
            if ('data' in upload && upload.data && 'filename' in upload.data) {
              return {
                filename: upload.data.filename,
                error: upload.error
              };
            }
            return {
              filename: 'Unknown',
              error: upload.error
            };
          })
        },
        { status: 500 }
      );
    }

    // Return successful upload results
    const successfulUploads = uploadResults.filter(result => result.success);
    console.log('Upload API: Successfully uploaded files:', successfulUploads.length);

    return NextResponse.json({
      success: true,
      data: {
        uploadedFiles: successfulUploads.map(upload => {
          if ('data' in upload && upload.data) {
            return upload.data;
          }
          return null;
        }).filter(Boolean),
        totalFiles: files.length,
        successfulUploads: successfulUploads.length,
        category,
        uploadType,
      },
      message: 'Files uploaded successfully',
    });

  } catch (error) {
    console.error('Upload API: Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for generating presigned URLs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const category = searchParams.get('category') as FileCategory || 'images';
    const contentType = searchParams.get('contentType') || 'application/octet-stream';

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    const result = await s3UploadService.generatePresignedUrl(filename, category, contentType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Presigned URL generated successfully',
    });

  } catch (error) {
    console.error('Upload API: Error generating presigned URL:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate presigned URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
