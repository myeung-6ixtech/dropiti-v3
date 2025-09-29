import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFirebaseUid = searchParams.get('userFirebaseUid');

    if (!userFirebaseUid) {
      return NextResponse.json(
        { error: 'User Firebase UID is required' },
        { status: 400 }
      );
    }

    const count = await NotificationService.getUnreadCount(userFirebaseUid);

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return NextResponse.json(
      { error: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}
