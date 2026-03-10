import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeMutation } from '@/app/api/graphql/serverClient';
import { v4 as uuidv4 } from 'uuid';

const GET_EXISTING_ROOM_QUERY = `
  query GetExistingRoom($user1UserId: uuid!) {
    real_estate_chat_room_participant(
      where: {
        user_id: { _eq: $user1UserId }
      }
    ) {
      id
      room_id
      user_id
      role
      joined_at
      last_read_at
      is_active
    }
  }
`;

const CREATE_ROOM_MUTATION = `
  mutation CreateRoom($roomId: uuid!) {
    insert_real_estate_chat_room_one(object: {
      id: $roomId,
      room_type: "direct",
      title: null
    }) {
      id
      room_type
      created_at
      updated_at
    }
  }
`;

const ADD_PARTICIPANT_MUTATION = `
  mutation AddParticipant($roomId: uuid!, $userId: uuid!, $role: String!) {
    insert_real_estate_chat_room_participant_one(object: {
      room_id: $roomId,
      user_id: $userId,
      role: $role
    }) {
      id
      room_id
      user_id
      role
      joined_at
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const { user1UserId, user2UserId, user1Role = 'tenant', user2Role = 'landlord' } = await request.json();

    if (!user1UserId || !user2UserId) {
      return NextResponse.json(
        { error: 'user1UserId and user2UserId are required' },
        { status: 400 }
      );
    }

    // First, check if a direct room already exists between these users
    const existingRoomData = await executeQuery(GET_EXISTING_ROOM_QUERY, {
      user1UserId
    }) as {
      real_estate_chat_room_participant?: Array<{
        id: string;
        room_id: string;
        user_id: string;
        role: string;
        joined_at: string;
        last_read_at: string | null;
        is_active: boolean;
      }>;
    };

    if (existingRoomData.real_estate_chat_room_participant &&
        existingRoomData.real_estate_chat_room_participant.length > 0) {
      // Check if any of these rooms also have user2 as a participant (direct chat)
      for (const participant of existingRoomData.real_estate_chat_room_participant) {
        const roomDetails = await executeQuery(`
          query GetRoomDetails($roomId: uuid!) {
            real_estate_chat_room(
              where: { id: { _eq: $roomId } }
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
        `, {
          roomId: participant.room_id
        }) as {
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

        const room = roomDetails.real_estate_chat_room?.[0];
        if (room && room.room_type === 'direct') {
          // Check if user2 is also in this room
          const user2ParticipantData = await executeQuery(`
            query CheckUser2InRoom($roomId: uuid!, $user2UserId: uuid!) {
              real_estate_chat_room_participant(
                where: {
                  room_id: { _eq: $roomId },
                  user_id: { _eq: $user2UserId }
                }
              ) {
                id
                room_id
                user_id
                role
              }
            }
          `, {
            roomId: participant.room_id,
            user2UserId
          }) as {
            real_estate_chat_room_participant?: Array<{
              id: string;
              room_id: string;
              user_id: string;
              role: string;
            }>;
          };

          if (user2ParticipantData.real_estate_chat_room_participant &&
              user2ParticipantData.real_estate_chat_room_participant.length > 0) {
            return NextResponse.json({
              success: true,
              data: {
                roomId: participant.room_id,
                room: room,
                isNew: false
              },
              message: 'Existing room found'
            });
          }
        }
      }
    }

    // Room doesn't exist, create a new one
    const newRoomId = uuidv4();

    const roomData = await executeMutation(CREATE_ROOM_MUTATION, {
      roomId: newRoomId
    }) as {
      insert_real_estate_chat_room_one?: {
        id: string;
        room_type: 'direct' | 'group' | 'support';
        created_at: string;
        updated_at: string;
      };
    };

    if (!roomData.insert_real_estate_chat_room_one) {
      return NextResponse.json(
        { error: 'Failed to create chat room' },
        { status: 500 }
      );
    }

    // Add both users as participants
    await executeMutation(ADD_PARTICIPANT_MUTATION, {
      roomId: newRoomId,
      userId: user1UserId,
      role: user1Role
    });

    await executeMutation(ADD_PARTICIPANT_MUTATION, {
      roomId: newRoomId,
      userId: user2UserId,
      role: user2Role
    });

    return NextResponse.json({
      success: true,
      data: {
        roomId: newRoomId,
        room: roomData.insert_real_estate_chat_room_one,
        isNew: true
      },
      message: 'New chat room created successfully'
    });
  } catch (error) {
    console.error('Error getting or creating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to get or create chat room' },
      { status: 500 }
    );
  }
}
