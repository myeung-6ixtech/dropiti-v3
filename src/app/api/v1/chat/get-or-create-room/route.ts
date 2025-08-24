import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeMutation } from '@/app/api/graphql/serverClient';
import { v4 as uuidv4 } from 'uuid';

const GET_EXISTING_ROOM_QUERY = `
  query GetExistingRoom($user1FirebaseUid: String!) {
    real_estate_chat_room_participant(
      where: {
        user_firebase_uid: { _eq: $user1FirebaseUid }
      }
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
  mutation AddParticipant($roomId: uuid!, $userFirebaseUid: String!, $role: String!) {
    insert_real_estate_chat_room_participant_one(object: {
      room_id: $roomId,
      user_firebase_uid: $userFirebaseUid,
      role: $role
    }) {
      id
      room_id
      user_firebase_uid
      role
      joined_at
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    console.log('=== GET OR CREATE ROOM API CALLED ===');
    
    const { user1FirebaseUid, user2FirebaseUid, user1Role = 'tenant', user2Role = 'landlord' } = await request.json();
    
    console.log('Request data:', { user1FirebaseUid, user2FirebaseUid, user1Role, user2Role });

    if (!user1FirebaseUid || !user2FirebaseUid) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'user1FirebaseUid and user2FirebaseUid are required' },
        { status: 400 }
      );
    }

    console.log('Checking for existing room...');
    // First, check if a direct room already exists between these users
    const existingRoomData = await executeQuery(GET_EXISTING_ROOM_QUERY, {
      user1FirebaseUid
    }) as {
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
    
    console.log('Existing room query result:', existingRoomData);

    if (existingRoomData.real_estate_chat_room_participant && 
        existingRoomData.real_estate_chat_room_participant.length > 0) {
      console.log('Found rooms for user1:', existingRoomData.real_estate_chat_room_participant);
      
      // Check if any of these rooms also have user2 as a participant (direct chat)
      for (const participant of existingRoomData.real_estate_chat_room_participant) {
        // Get room details to check if it's a direct room
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
            query CheckUser2InRoom($roomId: uuid!, $user2FirebaseUid: String!) {
              real_estate_chat_room_participant(
                where: {
                  room_id: { _eq: $roomId },
                  user_firebase_uid: { _eq: $user2FirebaseUid }
                }
              ) {
                id
                room_id
                user_firebase_uid
                role
              }
            }
          `, {
            roomId: participant.room_id,
            user2FirebaseUid: user2FirebaseUid
          }) as {
            real_estate_chat_room_participant?: Array<{
              id: string;
              room_id: string;
              user_firebase_uid: string;
              role: string;
            }>;
          };
          
          if (user2ParticipantData.real_estate_chat_room_participant && 
              user2ParticipantData.real_estate_chat_room_participant.length > 0) {
            console.log('Found existing direct room between both users:', participant.room_id);
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

    console.log('No existing room found, creating new one...');
    // Room doesn't exist, create a new one
    const newRoomId = uuidv4();
    console.log('Generated room ID:', newRoomId);
    
    console.log('Creating room with mutation...');
    // Create the room
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
    
    console.log('Room creation result:', roomData);

    if (!roomData.insert_real_estate_chat_room_one) {
      return NextResponse.json(
        { error: 'Failed to create chat room' },
        { status: 500 }
      );
    }

    console.log('Adding participants to room...');
    // Add both users as participants
    const participant1Result = await executeMutation(ADD_PARTICIPANT_MUTATION, {
      roomId: newRoomId,
      userFirebaseUid: user1FirebaseUid,
      role: user1Role
    }) as unknown;
    console.log('Participant 1 added:', participant1Result);

    const participant2Result = await executeMutation(ADD_PARTICIPANT_MUTATION, {
      roomId: newRoomId,
      userFirebaseUid: user2FirebaseUid,
      role: user2Role
    }) as unknown;
    console.log('Participant 2 added:', participant2Result);

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
