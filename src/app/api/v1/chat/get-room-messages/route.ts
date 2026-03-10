import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';
import { decryptMessage, isEncrypted } from '@/lib/encryption';

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
      sender_user_id
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
        sender_user_id: string;
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

    // Decrypt messages before returning
    const decryptedMessages = data.real_estate_chat_message.map(message => {
      try {
        return {
          ...message,
          content: isEncrypted(message.content) 
            ? decryptMessage(message.content) 
            : message.content // Fallback for unencrypted messages
        };
      } catch (error) {
        console.error('Failed to decrypt message:', message.id, error);
        // Return message with error indicator if decryption fails
        return {
          ...message,
          content: '[Message could not be decrypted]'
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: decryptedMessages,
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
