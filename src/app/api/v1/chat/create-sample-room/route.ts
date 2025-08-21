import { NextRequest, NextResponse } from 'next/server';
import { executeMutation } from '@/app/api/graphql/serverClient';
import { v4 as uuidv4 } from 'uuid';

const CREATE_SAMPLE_ROOM_MUTATION = `
  mutation CreateSampleRoom($roomId: uuid!) {
    insert_real_estate_chat_room_one(object: {
      id: $roomId,
      room_type: "direct",
      title: "Sample Chat Room"
    }) {
      id
      room_type
      title
      created_at
      updated_at
    }
  }
`;

const ADD_SAMPLE_PARTICIPANTS_MUTATION = `
  mutation AddSampleParticipants($roomId: uuid!, $user1FirebaseUid: String!, $user2FirebaseUid: String!) {
    insert_real_estate_chat_room_participant(objects: [
      { room_id: $roomId, user_firebase_uid: $user1FirebaseUid, role: "tenant" },
      { room_id: $roomId, user_firebase_uid: $user2FirebaseUid, role: "landlord" }
    ]) {
      affected_rows
      returning {
        id
        room_id
        user_firebase_uid
        role
      }
    }
  }
`;

const ADD_SAMPLE_MESSAGES_MUTATION = `
  mutation AddSampleMessages($roomId: uuid!, $user1FirebaseUid: String!, $user2FirebaseUid: String!) {
    insert_real_estate_chat_message(objects: [
      { 
        room_id: $roomId, 
        sender_firebase_uid: $user1FirebaseUid, 
        content: "Hi there! How can I help you today?",
        message_type: "text"
      },
      { 
        room_id: $roomId, 
        sender_firebase_uid: $user2FirebaseUid, 
        content: "I have a question about the property maintenance schedule.",
        message_type: "text"
      },
      { 
        room_id: $roomId, 
        sender_firebase_uid: $user1FirebaseUid, 
        content: "Of course! What would you like to know?",
        message_type: "text"
      }
    ]) {
      affected_rows
      returning {
        id
        content
        sender_firebase_uid
        created_at
      }
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const { user1FirebaseUid, user2FirebaseUid } = await request.json();

    if (!user1FirebaseUid || !user2FirebaseUid) {
      return NextResponse.json(
        { error: 'user1FirebaseUid and user2FirebaseUid are required' },
        { status: 400 }
      );
    }

    const roomId = uuidv4();

    // Create the room
    const roomData = await executeMutation(CREATE_SAMPLE_ROOM_MUTATION, { roomId });

    if (!roomData.insert_real_estate_chat_room_one) {
      return NextResponse.json(
        { error: 'Failed to create sample room' },
        { status: 500 }
      );
    }

    // Add participants
    await executeMutation(ADD_SAMPLE_PARTICIPANTS_MUTATION, {
      roomId,
      user1FirebaseUid,
      user2FirebaseUid
    });

    // Add sample messages
    await executeMutation(ADD_SAMPLE_MESSAGES_MUTATION, {
      roomId,
      user1FirebaseUid,
      user2FirebaseUid
    });

    return NextResponse.json({
      success: true,
      data: {
        roomId,
        room: roomData.insert_real_estate_chat_room_one
      },
      message: 'Sample chat room created successfully'
    });
  } catch (error) {
    console.error('Error creating sample chat room:', error);
    return NextResponse.json(
      { error: 'Failed to create sample chat room' },
      { status: 500 }
    );
  }
}
