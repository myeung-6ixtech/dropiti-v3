import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await NotificationService.archiveNotification(notificationId);

    return NextResponse.json({
      success: true,
      message: 'Notification archived',
    });
  } catch (error) {
    console.error('Error archiving notification:', error);
    return NextResponse.json(
      { error: 'Failed to archive notification' },
      { status: 500 }
    );
  }
}
