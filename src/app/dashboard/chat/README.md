# Real-time Chat Feature

## Overview

This is a comprehensive real-time chat system integrated into the dashboard. The chat feature provides a modern, responsive interface for communication between tenants, landlords, and support teams.

## Features

### Core Functionality
- **Real-time Messaging**: Instant message delivery with status indicators
- **Contact Management**: Sidebar with contact list and search functionality
- **Message Status**: Visual indicators for sent, delivered, and read messages
- **Typing Indicators**: Shows when someone is typing
- **Auto-scroll**: Automatically scrolls to the latest messages
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### UI/UX Features
- **Modern Interface**: Clean, intuitive design following the existing design system
- **Online Status**: Real-time online/offline indicators
- **Message Timestamps**: Relative time display (e.g., "2m ago", "1h ago")
- **File Attachments**: Support for file uploads (UI ready)
- **Search**: Filter contacts by name
- **Notifications**: Real-time notification system

### Real-time Features
- **Connection Status**: Visual indicator showing connection status
- **Typing Indicators**: Animated dots showing when someone is typing
- **Message Status**: Sent ✓, Delivered ✓✓, Read ✓✓ (blue)
- **Auto-resize Textarea**: Automatically adjusts height based on content

## Components

### 1. ChatPage (`page.tsx`)
Main chat page component that orchestrates the entire chat experience.

**Key Features:**
- Connection status management
- Search functionality
- Notification handling
- Real-time status indicators

**Props:**
- None (uses internal state)

### 2. ChatInterface (`ChatInterface.tsx`)
Core chat interface component handling message display and input.

**Key Features:**
- Message display with status indicators
- Typing indicators
- Auto-scroll to bottom
- Message input with auto-resize
- Contact selection

**Props:**
```typescript
interface ChatInterfaceProps {
  contacts: ChatContact[];
  initialMessages?: Message[];
  userType: 'tenant' | 'landlord';
}
```

### 3. ChatMessage (`ChatMessage.tsx`)
Individual message component with status indicators.

**Key Features:**
- Message status indicators (sent, delivered, read)
- Relative timestamps
- Avatar display
- Responsive design

**Props:**
```typescript
interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}
```

### 4. ChatSidebar (`ChatSidebar.tsx`)
Contact list sidebar component.

**Key Features:**
- Contact list with online status
- Unread message counts
- Last message preview
- Contact selection

**Props:**
```typescript
interface ChatSidebarProps {
  contacts: ChatContact[];
  selectedContact: ChatContact | null;
  onContactSelect: (contact: ChatContact) => void;
  userType: 'tenant' | 'landlord';
}
```

## Data Structures

### Message Interface
```typescript
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  avatar?: string;
  senderName: string;
  status?: 'sent' | 'delivered' | 'read';
}
```

### ChatContact Interface
```typescript
interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  role?: 'landlord' | 'tenant' | 'support';
}
```

## Usage

### Basic Implementation
```typescript
import ChatInterface from '@/components/chat/ChatInterface';

// Mock data
const contacts = [
  {
    id: '1',
    name: 'John Doe',
    role: 'landlord',
    lastMessage: 'Hello there!',
    lastMessageTime: new Date(),
    unreadCount: 0,
    isOnline: true
  }
];

function MyChatPage() {
  return (
    <ChatInterface
      contacts={contacts}
      userType="tenant"
    />
  );
}
```

### With Real-time Features
The chat system currently includes simulated real-time features:

1. **Connection Status**: Automatically shows as connected after 1 second
2. **Typing Indicators**: Appears when messages are sent
3. **Message Status**: Simulates delivery and read status updates
4. **Auto-replies**: Generates contextual responses

## Styling

The chat system uses Tailwind CSS classes and follows the existing design system:

- **Colors**: Blue-600 for primary actions, gray scale for text and borders
- **Spacing**: Consistent padding and margins using Tailwind's spacing scale
- **Shadows**: Subtle shadows for depth and hierarchy
- **Transitions**: Smooth transitions for interactive elements

## Future Enhancements

### Planned Features
1. **WebSocket Integration**: Real WebSocket connection for true real-time messaging
2. **File Uploads**: Drag-and-drop file upload functionality
3. **Voice Messages**: Audio message recording and playback
4. **Video Calls**: Integrated video calling feature
5. **Message Reactions**: Emoji reactions to messages
6. **Message Threading**: Reply to specific messages
7. **Message Search**: Search within conversations
8. **Push Notifications**: Browser notifications for new messages

### Technical Improvements
1. **State Management**: Redux or Zustand for better state management
2. **Message Persistence**: Database integration for message history
3. **Offline Support**: Offline message queue and sync
4. **Encryption**: End-to-end encryption for messages
5. **Performance**: Virtual scrolling for large message lists

## Accessibility

The chat interface includes several accessibility features:

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Logical tab order and focus indicators
- **Color Contrast**: WCAG AA compliant color combinations

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **Responsive**: Tablet and mobile-friendly design

## Performance

- **Optimized Rendering**: Efficient re-renders using React best practices
- **Memory Management**: Proper cleanup of timeouts and event listeners
- **Lazy Loading**: Components load only when needed
- **Bundle Size**: Minimal impact on overall application size
