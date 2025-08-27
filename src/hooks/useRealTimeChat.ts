import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { chatAPI, ChatMessage } from '@/lib/chat-api';

interface UseRealTimeChatProps {
  roomId?: string;
  pollingInterval?: number; // in milliseconds
}

export const useRealTimeChat = ({ roomId, pollingInterval = 3000 }: UseRealTimeChatProps) => {
  const { user: authUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!roomId || !authUser?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedMessages = await chatAPI.getRoomMessages(roomId, 50, 0);
      setMessages(fetchedMessages);
      
      // Set the last message ID for polling
      if (fetchedMessages.length > 0) {
        setLastMessageId(fetchedMessages[fetchedMessages.length - 1].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, authUser?.id]);

  // Poll for new messages
  const pollForNewMessages = useCallback(async () => {
    if (!roomId || !authUser?.id || !lastMessageId) return;

    try {
      // Get messages after the last known message
      const newMessages = await chatAPI.getRoomMessages(roomId, 50, 0);
      
      // Find messages newer than the last known message
      const lastMessageIndex = newMessages.findIndex(msg => msg.id === lastMessageId);
      if (lastMessageIndex !== -1 && lastMessageIndex < newMessages.length - 1) {
        const actualNewMessages = newMessages.slice(lastMessageIndex + 1);
        setMessages(prev => [...prev, ...actualNewMessages]);
        setLastMessageId(actualNewMessages[actualNewMessages.length - 1].id);
      }
    } catch (err) {
      console.error('Error polling for new messages:', err);
      // Don't set error for polling failures to avoid disrupting the UI
    }
  }, [roomId, authUser?.id, lastMessageId]);

  // Send a message
  const sendMessage = useCallback(async (content: string): Promise<ChatMessage | null> => {
    if (!roomId || !authUser?.id || !content.trim()) return null;

    try {
      const newMessage = await chatAPI.sendMessage(roomId, authUser.id, content);
      
      // Add the new message to the local state
      setMessages(prev => [...prev, newMessage]);
      
      // Update the last message ID
      setLastMessageId(newMessage.id);
      
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
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
