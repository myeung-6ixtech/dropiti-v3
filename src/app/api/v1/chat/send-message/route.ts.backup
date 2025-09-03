import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';
import { checkRateLimit } from '@/lib/rate-limiter';

// Basic message validation
const validateMessage = (content: string): { valid: boolean; error?: string } => {
  if (typeof content !== 'string') return { valid: false, error: 'Invalid message' };

  // Preserve intented whitespace/newlines but trim excessive outer whitespace
  const trimmed = content.replace(/\s+$/g, '');
  if (trimmed.length === 0) return { valid: false, error: 'Message cannot be empty' };

  if (content.length > 2000) return { valid: false, error: 'Message too long (max 2000 characters)' };

  // Basic XSS guard (we store plain text; UI renders as text)
  if (/<\s*script/i.test(content)) return { valid: false, error: 'Invalid content' };

  return { valid: true };
};

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

    // Validate message content
    const validation = validateMessage(content);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Rate limit per sender
    const rate = checkRateLimit(`msg:${senderFirebaseUid}`, 20, 60_000); // 20 msgs/min
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending more messages.' },
        { status: 429 }
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
