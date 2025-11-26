/**
 * Global Chat Service
 * Handles anonymous global chat for all Chico State students
 */

import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { DatabaseGateway } from '../Database/databaseGateway';

const GLOBAL_CHAT_COLLECTION = 'global_chat';
const MESSAGE_LIMIT = 50; // Load last 50 messages

export interface ChatMessage {
  id?: string;
  userId: string;
  email: string;
  alias: string;
  message: string;
  timestamp: Timestamp;
  createdAt: string;
}

export interface SendMessageResult {
  success: boolean;
  message: string;
  messageId?: string;
}

/**
 * Send a message to global chat
 */
export const sendGlobalMessage = async (
  userId: string,
  email: string,
  alias: string,
  message: string
): Promise<SendMessageResult> => {
  try {
    // Validate inputs
    if (!userId || !email || !alias || !message) {
      return {
        success: false,
        message: 'User ID, email, alias, and message are required',
      };
    }

    if (message.trim().length === 0) {
      return {
        success: false,
        message: 'Message cannot be empty',
      };
    }

    if (message.length > 500) {
      return {
        success: false,
        message: 'Message is too long (max 500 characters)',
      };
    }

    const db = DatabaseGateway.getFirestore();
    const chatRef = collection(db, GLOBAL_CHAT_COLLECTION);

    // Add message to Firestore
    const docRef = await addDoc(chatRef, {
      userId,
      email,
      alias,
      message: message.trim(),
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Message sent successfully',
      messageId: docRef.id,
    };
  } catch (error: any) {
    console.error('Error sending global message:', error);
    return {
      success: false,
      message: error.message || 'Failed to send message',
    };
  }
};

/**
 * Get recent messages from global chat
 * Returns last 50 messages ordered by timestamp
 */
export const getRecentMessages = async (): Promise<{
  success: boolean;
  messages: ChatMessage[];
  error?: string;
}> => {
  try {
    const db = DatabaseGateway.getFirestore();
    const chatRef = collection(db, GLOBAL_CHAT_COLLECTION);

    // Query last 50 messages, ordered by timestamp descending
    const q = query(
      chatRef,
      orderBy('timestamp', 'desc'),
      limit(MESSAGE_LIMIT)
    );

    const querySnapshot = await getDocs(q);

    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      } as ChatMessage);
    });

    // Reverse to show oldest first
    messages.reverse();

    return {
      success: true,
      messages,
    };
  } catch (error: any) {
    console.error('Error getting recent messages:', error);
    return {
      success: false,
      messages: [],
      error: error.message || 'Failed to get messages',
    };
  }
};

/**
 * Delete a message (admin only)
 */
export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Add admin check
    // For now, users can only delete their own messages
    
    const db = DatabaseGateway.getFirestore();
    const messageRef = collection(db, GLOBAL_CHAT_COLLECTION);
    
    // TODO: Implement delete logic with permission check
    
    return {
      success: false,
      message: 'Delete functionality not yet implemented',
    };
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete message',
    };
  }
};

export const GlobalChatService = {
  sendGlobalMessage,
  getRecentMessages,
  deleteMessage,
};
