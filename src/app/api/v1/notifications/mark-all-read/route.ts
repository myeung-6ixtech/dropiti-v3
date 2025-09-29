import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
  try {
    const { userFirebaseUid } = await request.json();

    if (!userFirebaseUid) {
      return NextResponse.json(
        { error: 'User Firebase UID is required' },
        { status: 400 }
      );
    }

    await NotificationService.markAllAsRead(userFirebaseUid);

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
