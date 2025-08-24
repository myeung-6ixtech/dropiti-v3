import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/api/graphql/serverClient';

const GET_USER_CHAT_ROOMS_QUERY = `
  query GetUserChatRooms($userFirebaseUid: String!) {
    real_estate_chat_room_participant(
      where: { user_firebase_uid: { _eq: $userFirebaseUid } }
      order_by: { joined_at: desc }
    ) {
      id
      room_id
      user_firebase_uid
      role
      joined_at
      last_read_at
      is_active
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFirebaseUid = searchParams.get('userFirebaseUid');

    if (!userFirebaseUid) {
      return NextResponse.json(
        { error: 'userFirebaseUid is required' },
        { status: 400 }
      );
    }

    // First, get the user's chat room participants
    const participantData = await executeQuery(GET_USER_CHAT_ROOMS_QUERY, { userFirebaseUid }) as {
      real_estate_chat_room_participant?: Array<{
        id: string;
        room_id: string;
        user_firebase_uid: string;
        role: string;
        joined_at: string;
        last_read_at: string | null;
        is_active: boolean;
      }>;
    };

    if (!participantData.real_estate_chat_room_participant || 
        participantData.real_estate_chat_room_participant.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No chat rooms found'
      });
    }

    // Get the room IDs
    const roomIds = participantData.real_estate_chat_room_participant.map(p => p.room_id);

    // Now get the room details and last messages
    const GET_ROOM_DETAILS_QUERY = `
      query GetRoomDetails($roomIds: [uuid!]!) {
        real_estate_chat_room(
          where: { id: { _in: $roomIds } }
          order_by: { last_message_at: desc }
        ) {
          id
          title
          room_type
          created_at
          updated_at
          last_message_at
          is_active
        }
      }
    `;

    const roomData = await executeQuery(GET_ROOM_DETAILS_QUERY, { roomIds }) as {
      real_estate_chat_room?: Array<{
        id: string;
        title: string | null;
        room_type: 'direct' | 'group' | 'support';
        created_at: string;
        updated_at: string;
        last_message_at: string;
        is_active: boolean;
      }>;
    };

    // Get last messages for each room
    const GET_LAST_MESSAGES_QUERY = `
      query GetLastMessages($roomIds: [uuid!]!) {
        real_estate_chat_message(
          where: { room_id: { _in: $roomIds } }
          order_by: { created_at: desc }
        ) {
          room_id
          content
          sender_firebase_uid
          created_at
        }
      }
    `;

    const messageData = await executeQuery(GET_LAST_MESSAGES_QUERY, { roomIds }) as {
      real_estate_chat_message?: Array<{
        room_id: string;
        content: string;
        sender_firebase_uid: string;
        created_at: string;
      }>;
    };

    // Combine the data
    const combinedData = participantData.real_estate_chat_room_participant.map(participant => {
      const room = roomData.real_estate_chat_room?.find(r => r.id === participant.room_id);
      const lastMessage = messageData.real_estate_chat_message?.find(m => m.room_id === participant.room_id);
      
      return {
        ...participant,
        room: room || null,
        last_message: lastMessage || null
      };
    });

    return NextResponse.json({
      success: true,
      data: combinedData,
      message: 'Chat rooms retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}
