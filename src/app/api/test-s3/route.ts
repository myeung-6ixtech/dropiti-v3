import { NextResponse } from 'next/server';
import { S3UploadService } from '@/lib/s3-upload';

export async function GET() {
  try {
    console.log('Testing S3 connection...');
    
    const s3Service = S3UploadService.getInstance();
    const testResult = await s3Service.testConnection();
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'S3 connection successful',
        details: testResult.details
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'S3 connection failed',
        error: testResult.error,
        details: testResult.details
      }, { status: 500 });
    }
  } catch (error) {
    console.error('S3 test error:', error);
    return NextResponse.json({
      success: false,
      message: 'S3 test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
