import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';

const SEND_MESSAGE_MUTATION = `
  mutation SendMessage($roomId: uuid!, $senderFirebaseUid: String!, $content: String!) {
    insert_real_estate_chat_message_one(object: {
      room_id: $roomId,
      sender_firebase_uid: $senderFirebaseUid,
      content: $content,
      message_type: "text"
    }) {
      id
      content
      sender_firebase_uid
      status
      created_at
      message_type
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const { roomId, senderFirebaseUid, content } = await request.json();

    if (!roomId || !senderFirebaseUid || !content) {
      return NextResponse.json(
        { error: 'roomId, senderFirebaseUid, and content are required' },
        { status: 400 }
      );
    }

    const data = await executeMutation(SEND_MESSAGE_MUTATION, {
      roomId,
      senderFirebaseUid,
      content
    }) as {
      insert_real_estate_chat_message_one?: {
        id: string;
        content: string;
        sender_firebase_uid: string;
        status: string;
        created_at: string;
        message_type: string;
      };
    };

    if (!data.insert_real_estate_chat_message_one) {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.insert_real_estate_chat_message_one,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
