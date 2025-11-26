/**
 * Chat Service for Frontend
 * Handles global chat with real-time Firestore listeners
 */

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb } from '../config/firebase';

const GLOBAL_CHAT_COLLECTION = 'global_chat';
const MESSAGE_LIMIT = 50;

export interface ChatMessage {
  id: string;
  userId: string;
  email: string;
  alias: string;
  message: string;
  timestamp: any;
  createdAt: string;
}

/**
 * Subscribe to real-time global chat messages
 * Returns an unsubscribe function
 */
export const subscribeToGlobalChat = (
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const db = getFirebaseDb();
  const chatRef = collection(db, GLOBAL_CHAT_COLLECTION);
  
  // Query last 50 messages, ordered by timestamp
  const chatQuery = query(
    chatRef,
    orderBy('timestamp', 'asc'),
    limit(MESSAGE_LIMIT)
  );

  // Set up real-time listener
  return onSnapshot(chatQuery, (snapshot) => {
    const messages: ChatMessage[] = [];
    
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      } as ChatMessage);
    });

    callback(messages);
  }, (error) => {
    console.error('Error in chat listener:', error);
  });
};

/**
 * Send a message to global chat
 */
export const sendGlobalMessage = async (
  userId: string,
  email: string,
  alias: string,
  message: string
): Promise<void> => {
  if (!message.trim()) {
    throw new Error('Message cannot be empty');
  }

  if (message.length > 500) {
    throw new Error('Message is too long (max 500 characters)');
  }

  const db = getFirebaseDb();
  const chatRef = collection(db, GLOBAL_CHAT_COLLECTION);

  await addDoc(chatRef, {
    userId,
    email,
    alias,
    message: message.trim(),
    timestamp: serverTimestamp(),
    createdAt: new Date().toISOString(),
  });
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  } catch (error) {
    return '';
  }
};
