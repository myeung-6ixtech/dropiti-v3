import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_ROOM_MESSAGES_QUERY = `
  query GetRoomMessages($roomId: uuid!, $limit: Int = 50, $offset: Int = 0) {
    real_estate_chat_message(
      where: { room_id: { _eq: $roomId } }
      order_by: { created_at: asc }
      limit: $limit
      offset: $offset
    ) {
      id
      content
      sender_firebase_uid
      status
      created_at
      message_type
      metadata
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId is required' },
        { status: 400 }
      );
    }

    const data = await executeQuery(GET_ROOM_MESSAGES_QUERY, { 
      roomId, 
      limit, 
      offset 
    }) as {
      real_estate_chat_message?: Array<{
        id: string;
        content: string;
        sender_firebase_uid: string;
        status: string;
        created_at: string;
        message_type: string;
        metadata: Record<string, unknown> | null;
      }>;
    };

    if (!data.real_estate_chat_message) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No messages found'
      });
    }

    return NextResponse.json({
      success: true,
      data: data.real_estate_chat_message,
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching room messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
