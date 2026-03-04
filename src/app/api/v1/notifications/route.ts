import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isRead = searchParams.get('isRead');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Notifications API: Received request with params:', {
      userId,
      isRead,
      category,
      limit,
      offset
    });

    if (!userId) {
      return NextResponse.json(
        { error: 'User Firebase UID is required' },
        { status: 400 }
      );
    }

    const notifications = await NotificationService.getUserNotifications(userId, {
      isRead: isRead ? isRead === 'true' : undefined,
      category: category || undefined,
      limit,
      offset,
    });

    console.log('Notifications API: Successfully fetched notifications:', notifications.length);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
