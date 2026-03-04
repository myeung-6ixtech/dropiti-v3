import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { chatAPI, ChatMessage } from '@/lib/chat-api';

interface UseRealTimeChatProps {
  roomId?: string;
  pollingInterval?: number; // in milliseconds
}

export const useRealTimeChat = ({ roomId, pollingInterval = 2000 }: UseRealTimeChatProps) => {
  const { user: authUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSendingRef = useRef<boolean>(false);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!roomId || !authUser?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedMessages = await chatAPI.getRoomMessages(roomId, 50, 0);
      setMessages(fetchedMessages);
      
      // Set the last message timestamp for polling
      if (fetchedMessages.length > 0) {
        setLastMessageTimestamp(fetchedMessages[fetchedMessages.length - 1].created_at);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, authUser?.id]);

  // Poll for new messages (only fetch messages newer than last known)
  const pollForNewMessages = useCallback(async () => {
    if (!roomId || !authUser?.id || !lastMessageTimestamp || isSendingRef.current) return;

    try {
      // Get all messages and filter for new ones
      const allMessages = await chatAPI.getRoomMessages(roomId, 50, 0);
      
      // Find messages newer than the last known timestamp
      const newMessages = allMessages.filter(msg => 
        new Date(msg.created_at) > new Date(lastMessageTimestamp)
      );
      
      if (newMessages.length > 0) {
        setMessages(prev => {
          // Avoid duplicates by checking message IDs
          const existingIds = new Set(prev.map(msg => msg.id));
          const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
          
          if (uniqueNewMessages.length > 0) {
            const updatedMessages = [...prev, ...uniqueNewMessages].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            // Update last message timestamp
            setLastMessageTimestamp(updatedMessages[updatedMessages.length - 1].created_at);
            
            return updatedMessages;
          }
          
          return prev;
        });
      }
    } catch (err) {
      console.error('Error polling for new messages:', err);
      // Don't set error for polling failures to avoid disrupting the UI
    }
  }, [roomId, authUser?.id, lastMessageTimestamp]);

  // Send a message with optimistic updates
  const sendMessage = useCallback(async (
    content: string, 
    messageType: 'text' | 'property_share' = 'text',
    metadata: Record<string, unknown> | null = null
  ): Promise<ChatMessage | null> => {
    if (!roomId || !authUser?.id || !content.trim()) return null;

    // Prevent polling while sending
    isSendingRef.current = true;

    try {
      // Create optimistic message
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        sender_user_id: authUser.id,
        content: content.trim(),
        message_type: messageType,
        status: 'sent',
        created_at: new Date().toISOString(),
        metadata: metadata
      };

      // Add optimistic message immediately
      setMessages(prev => [...prev, optimisticMessage]);

      // Send the actual message
      const sentMessage = await chatAPI.sendMessage(roomId, authUser.id, content, messageType, metadata);
      
      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );
      
      // Update the last message timestamp
      setLastMessageTimestamp(sentMessage.created_at);
      
      return sentMessage;
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    } finally {
      // Re-enable polling after a short delay
      setTimeout(() => {
        isSendingRef.current = false;
      }, 1000);
    }
  }, [roomId, authUser?.id]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    pollingRef.current = setInterval(pollForNewMessages, pollingInterval);
  }, [pollForNewMessages, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Initialize chat
  useEffect(() => {
    if (roomId && authUser?.id) {
      fetchMessages();
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [roomId, authUser?.id, fetchMessages, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    const currentAbortController = abortControllerRef.current;
    return () => {
      stopPolling();
      if (currentAbortController) {
        currentAbortController.abort();
      }
    };
  }, [stopPolling]);

  // Manual refresh
  const refreshMessages = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages,
    startPolling,
    stopPolling
  };
};
